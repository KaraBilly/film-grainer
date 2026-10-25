import { useEffect, useRef, type ReactNode } from 'react'
import { useStore } from '../store'
import { editorStore, applyPreset, clearPreset } from '../editorStore'
import { colorPresets, bwPresets, neutralParams } from '../presets'
import { renderFilm } from '../engine/filmRenderer'
import type { AdjustmentParams } from '../types'

const NEUTRAL_TRANSFORM = { flipX: false, flipY: false, rotation: 0 as const }

interface PresetStripProps {
  source: HTMLImageElement | null
  sw: number
  sh: number
  visible: boolean
}

export function PresetStrip({ source, sw, sh, visible }: PresetStripProps) {
  const { activePreset } = useStore(editorStore)

  if (!visible) return null

  return (
    <div className="preset-strip">
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
