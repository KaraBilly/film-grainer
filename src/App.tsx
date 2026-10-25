import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { editorStore, setHasImage } from './editorStore'
import { renderFilm } from './engine/filmRenderer'
import { Toolbar } from './components/Toolbar'
import { AdjustPanel } from './components/AdjustPanel'
import { PresetStrip } from './components/PresetStrip'
import { CropModal } from './components/CropModal'
import { AuthModal } from './components/AuthModal'
import { Dropzone } from './components/Dropzone'
import { IconDownload, IconUser } from './components/icons'

interface SourceImage {
  img: HTMLImageElement
  w: number
  h: number
}

function cropSource(source: SourceImage, ratio: number | null): { src: HTMLImageElement | HTMLCanvasElement; w: number; h: number } {
  if (!ratio) return { src: source.img, w: source.w, h: source.h }
  const srcRatio = source.w / source.h
  let cw: number
  let ch: number
  if (ratio > srcRatio) {
    cw = source.w
    ch = source.w / ratio
  } else {
    ch = source.h
    cw = source.h * ratio
  }
  const sx = (source.w - cw) / 2
  const sy = (source.h - ch) / 2
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(cw))
  c.height = Math.max(1, Math.round(ch))
  c.getContext('2d')!.drawImage(source.img, sx, sy, cw, ch, 0, 0, c.width, c.height)
  return { src: c, w: c.width, h: c.height }
}

export default function App() {
  const { params, transform, crop, hasImage } = useStore(editorStore)
  const [source, setSource] = useState<SourceImage | null>(null)
  const [showAdjust, setShowAdjust] = useState(true)
  const [showPresets, setShowPresets] = useState(false)
  const [showCrop, setShowCrop] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = Array.from(files)[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setSource({ img, w: img.naturalWidth, h: img.naturalHeight })
      setHasImage(true)
      URL.revokeObjectURL(url)
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [])

  // Render whenever source, params, transform or crop change (throttled to rAF).
  useEffect(() => {
    if (!source) return
    const canvas = canvasRef.current
    if (!canvas) return
    const raf = requestAnimationFrame(() => {
      const { src, w, h } = cropSource(source, crop.ratio)
      renderFilm(src, w, h, params, transform, canvas)
    })
    return () => cancelAnimationFrame(raf)
  }, [source, params, transform, crop])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'film-grainer.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="workspace blueprint">
      {source ? (
        <canvas ref={canvasRef} className="workspace__canvas" />
      ) : (
        <Dropzone onFiles={handleFiles} onPick={() => fileRef.current?.click()} />
      )}

      {/* Brand */}
      <div className="brand">
        <span className="brand__name">FILM GRAINER</span>
        <span className="brand__tag">Retro film</span>
      </div>

      {/* Top toolbar */}
      <Toolbar
        onUpload={() => fileRef.current?.click()}
        onCrop={() => setShowCrop(true)}
        showPresets={showPresets}
        showAdjust={showAdjust}
        onTogglePresets={() => setShowPresets((v) => !v)}
        onToggleAdjust={() => setShowAdjust((v) => !v)}
      />

      {/* Corner: download + sign in */}
      <div className="corner">
        <button className="btn-cta" onClick={handleDownload} disabled={!hasImage}>
          <IconDownload />
          Export
        </button>
        <button className="icon-btn" title="Sign in" onClick={() => setShowAuth(true)}>
          <IconUser />
        </button>
      </div>

      {/* Adjustments panel */}
      {showAdjust && source && <AdjustPanel />}

      {/* Presets filmstrip */}
      <PresetStrip
        source={source?.img ?? null}
        sw={source?.w ?? 0}
        sh={source?.h ?? 0}
        visible={showPresets && !!source}
      />

      {/* Modals */}
      {showCrop && source && <CropModal onClose={() => setShowCrop(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Hidden file input (shared by toolbar + dropzone) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
