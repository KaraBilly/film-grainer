import { useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { FILM_PRESETS } from '../presets'
import { renderFilm, cropSource } from '../engine/filmRenderer'
import type { FilmPreset, TransformState } from '../types'
import { IconClose, IconDownload } from './icons'

const EXPORT_MAX_DIM = 1600
const THUMB_MAX_DIM = 380

function slugify(name: string): string {
  return name.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '')
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

interface FilmGalleryProps {
  source: HTMLImageElement
  sw: number
  sh: number
  transform: TransformState
  cropRatio: number | null
  onClose: () => void
  onApply: (preset: FilmPreset) => void
}

export function FilmGallery({ source, sw, sh, transform, cropRatio, onClose, onApply }: FilmGalleryProps) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const cropped = useMemo(() => cropSource(source, sw, sh, cropRatio), [source, sw, sh, cropRatio])
  const { src, w, h } = cropped

  const downloadOne = (preset: FilmPreset) => {
    const c = document.createElement('canvas')
    renderFilm(src, w, h, preset.params, transform, c, EXPORT_MAX_DIM)
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `${slugify(preset.name)}.png`
    a.click()
  }

  const downloadAll = async () => {
    if (exporting) return
    setExporting(true)
    setProgress(0)
    try {
      const zip = new JSZip()
      for (let i = 0; i < FILM_PRESETS.length; i++) {
        const preset = FILM_PRESETS[i]
        const c = document.createElement('canvas')
        renderFilm(src, w, h, preset.params, transform, c, EXPORT_MAX_DIM)
        const blob = await canvasToBlob(c)
        zip.file(`${slugify(preset.name)}.png`, blob)
        setProgress((i + 1) / FILM_PRESETS.length)
      }
      const out = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      downloadBlob(out, 'film-grainer-presets.zip')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="gallery">
      <header className="gallery__header panel">
        <div>
          <h2 className="gallery__title">Film gallery</h2>
          <span className="muted" style={{ fontSize: 12 }}>
            {FILM_PRESETS.length} film looks · {w}×{h}px
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {exporting && (
            <div className="gallery__progress">
              <span className="gallery__progress-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
              <span className="gallery__progress-label">
                Exporting {Math.round(progress * FILM_PRESETS.length)}/{FILM_PRESETS.length}
              </span>
            </div>
          )}
          <button className="btn-cta" onClick={downloadAll} disabled={exporting}>
            <IconDownload />
            Download all (ZIP)
          </button>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>
      </header>

      <div className="gallery__grid">
        {FILM_PRESETS.map((preset) => (
          <GalleryCell
            key={preset.name}
            preset={preset}
            src={src}
            w={w}
            h={h}
            transform={transform}
            onApply={onApply}
            onDownload={downloadOne}
          />
        ))}
      </div>
    </div>
  )
}

interface GalleryCellProps {
  preset: FilmPreset
  src: CanvasImageSource
  w: number
  h: number
  transform: TransformState
  onApply: (preset: FilmPreset) => void
  onDownload: (preset: FilmPreset) => void
}

function GalleryCell({ preset, src, w, h, transform, onApply, onDownload }: GalleryCellProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  // Render thumbnail once per (source, transform) — not per slider change.
  useEffect(() => {
    const c = ref.current
    if (!c) return
    renderFilm(src, w, h, preset.params, transform, c, THUMB_MAX_DIM)
  }, [src, w, h, transform, preset.params])

  return (
    <div className="gallery-cell">
      <div className="gallery-cell__frame" onClick={() => onApply(preset)}>
        <canvas ref={ref} />
        <button
          className="gallery-cell__download"
          title={`Download ${preset.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onDownload(preset)
          }}
        >
          <IconDownload size={16} />
        </button>
      </div>
      <div className="gallery-cell__meta">
        <span className="gallery-cell__name">{preset.name}</span>
        <span className={`gallery-cell__badge gallery-cell__badge--${preset.type}`}>
          {preset.type === 'color' ? 'Color' : 'B&W'}
        </span>
      </div>
    </div>
  )
}
