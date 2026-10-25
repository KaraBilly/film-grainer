import { useStore } from '../store'
import { editorStore, setCropRatio } from '../editorStore'
import { IconClose } from './icons'

interface CropModalProps {
  onClose: () => void
}

const RATIOS: { label: string; ratio: number | null }[] = [
  { label: 'Original', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '9:16', ratio: 9 / 16 },
  { label: '3:4', ratio: 3 / 4 },
  { label: '2:3', ratio: 2 / 3 },
  { label: '4:5', ratio: 4 / 5 },
  { label: '5:4', ratio: 5 / 4 },
  { label: '2.35:1', ratio: 2.35 },
]

export function CropModal({ onClose }: CropModalProps) {
  const { crop } = useStore(editorStore)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Crop</h2>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>
        <p className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
          Center-crop to an aspect ratio.
        </p>
        <div className="ratio-grid">
          {RATIOS.map((r) => {
            const active = crop.ratio === r.ratio
            const w = r.ratio == null ? 1 : Math.min(1, r.ratio)
            const h = r.ratio == null ? 1 : Math.min(1, 1 / r.ratio)
            return (
              <button
                key={r.label}
                className={`ratio-cell ${active ? 'active' : ''}`}
                onClick={() => {
                  setCropRatio(r.ratio)
                }}
              >
                <span
                  className="ratio-box"
                  style={{ width: `${44 * w}px`, height: `${44 * h}px` }}
                />
                <span style={{ marginTop: 8 }}>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
