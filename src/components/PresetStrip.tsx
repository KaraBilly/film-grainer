import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useStore } from '../store'
import { editorStore, applyPreset, clearPreset } from '../editorStore'
import { colorPresets, bwPresets, neutralParams } from '../presets'
import { renderFilm } from '../engine/filmRenderer'
import type { AdjustmentParams } from '../types'

const NEUTRAL_TRANSFORM = { flipX: false, flipY: false, rotation: 0 as const }
const DRAG_THRESHOLD = 4
const KEY_SCROLL = 240

interface PresetStripProps {
  source: HTMLImageElement | null
  sw: number
  sh: number
  visible: boolean
}

export function PresetStrip({ source, sw, sh, visible }: PresetStripProps) {
  const { activePreset } = useStore(editorStore)
  const stripRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startLeft: number; pointerId: number } | null>(null)
  const movedRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  // Track pointer movement at the window level so the drag keeps scrolling
  // even when the cursor briefly leaves the strip.
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const drag = dragRef.current
      const el = stripRef.current
      if (!drag || !el || e.pointerId !== drag.pointerId) return
      const dx = e.clientX - drag.startX
      if (Math.abs(dx) > DRAG_THRESHOLD) movedRef.current = true
      el.scrollLeft = drag.startLeft - dx
    }
    const handleUp = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || e.pointerId !== drag.pointerId) return
      dragRef.current = null
      setDragging(false)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [])

  if (!visible) return null

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Drag-scroll with the primary mouse button; touch keeps native panning.
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = stripRef.current
    if (!el) return
    dragRef.current = { startX: e.clientX, startLeft: el.scrollLeft, pointerId: e.pointerId }
    movedRef.current = false
    setDragging(true)
    el.focus({ preventScroll: true })
  }

  const onClickCapture = (e: ReactMouseEvent) => {
    // A drag ends with a click on a thumbnail; swallow it so we don't
    // accidentally apply a preset.
    if (movedRef.current) {
      movedRef.current = false
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const el = stripRef.current
    if (!el) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      el.scrollBy({ left: -KEY_SCROLL, behavior: 'smooth' })
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      el.scrollBy({ left: KEY_SCROLL, behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={stripRef}
      className={`preset-strip${dragging ? ' is-dragging' : ''}`}
      tabIndex={0}
      role="region"
      aria-label="Film presets"
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
    >
      <Section label="Reset">
        <Thumb
          label="Original"
          active={activePreset === null}
          onClick={clearPreset}
          source={source}
          sw={sw}
          sh={sh}
        />
      </Section>
      <Section label="Color">
        {colorPresets.map((p) => (
          <Thumb
            key={p.name}
            label={p.name}
            active={activePreset === p.name}
            onClick={() => applyPreset(p.name, p.params)}
            source={source}
            sw={sw}
            sh={sh}
            params={p.params}
          />
        ))}
      </Section>
      <Section label="B&W">
        {bwPresets.map((p) => (
          <Thumb
            key={p.name}
            label={p.name}
            active={activePreset === p.name}
            onClick={() => applyPreset(p.name, p.params)}
            source={source}
            sw={sw}
            sh={sh}
            params={p.params}
          />
        ))}
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="preset-section">
      <span className="preset-section__label">{label}</span>
      <div className="preset-section__chips">{children}</div>
    </div>
  )
}

interface ThumbProps {
  label: string
  active: boolean
  onClick: () => void
  source: HTMLImageElement | null
  sw: number
  sh: number
  params?: AdjustmentParams
}

function Thumb({ label, active, onClick, source, sw, sh, params }: ThumbProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    if (source && sw > 0 && sh > 0) {
      renderFilm(source, sw, sh, params ?? neutralParams, NEUTRAL_TRANSFORM, c, 120)
    } else {
      ctx.fillStyle = '#2b2b2b'
      ctx.fillRect(0, 0, c.width, c.height)
    }
  }, [source, sw, sh, params])

  return (
    <div className="preset-chip" title={label}>
      <div className={`preset-chip__thumb ${active ? 'active' : ''}`} onClick={onClick}>
        <canvas ref={ref} width={60} height={60} />
      </div>
      <span className="preset-chip__name">{label}</span>
    </div>
  )
}
