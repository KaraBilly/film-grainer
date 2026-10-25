import { useState, type ReactNode } from 'react'
import { useStore } from '../store'
import { editorStore, resetAll, setTransform } from '../editorStore'
import {
  IconMenu,
  IconUpload,
  IconCrop,
  IconFlipH,
  IconFlipV,
  IconRotateLeft,
  IconRotateRight,
  IconPresets,
  IconSliders,
  IconReset,
  IconClose,
} from './icons'

interface ToolbarProps {
  onUpload: () => void
  onCrop: () => void
  showPresets: boolean
  showAdjust: boolean
  onTogglePresets: () => void
  onToggleAdjust: () => void
}

export function Toolbar({
  onUpload,
  onCrop,
  showPresets,
  showAdjust,
  onTogglePresets,
  onToggleAdjust,
}: ToolbarProps) {
  const { transform, hasImage } = useStore(editorStore)
  const [menuOpen, setMenuOpen] = useState(false)

  const disabled = !hasImage

  return (
    <>
      {menuOpen && (
        <div className="modal-backdrop" style={{ background: 'transparent' }} onClick={() => setMenuOpen(false)}>
          <div
            className="panel"
            style={{ position: 'absolute', top: 66, left: 16, padding: '8px 4px', minWidth: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuRow
              onClick={() => {
                resetAll()
                setMenuOpen(false)
              }}
            >
              Reset all adjustments
            </MenuRow>
            <MenuRow onClick={() => setMenuOpen(false)}>About Film Grainer</MenuRow>
          </div>
        </div>
      )}

      <nav className="toolbar">
        <button className="icon-btn" title="Menu" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
        <button className="icon-btn" title="Upload image" onClick={onUpload}>
          <IconUpload />
        </button>
        <button className="icon-btn" title="Crop" onClick={onCrop} disabled={disabled}>
          <IconCrop />
        </button>
        <button
          className="icon-btn"
          title="Flip horizontal"
          disabled={disabled}
          onClick={() => setTransform({ flipX: !transform.flipX })}
        >
          <IconFlipH />
        </button>
        <button
          className="icon-btn"
          title="Flip vertical"
          disabled={disabled}
          onClick={() => setTransform({ flipY: !transform.flipY })}
        >
          <IconFlipV />
        </button>
        <button
          className="icon-btn"
          title="Rotate left"
          disabled={disabled}
          onClick={() => setTransform({ rotation: ((transform.rotation + 270) % 360) as 0 | 90 | 180 | 270 })}
        >
          <IconRotateLeft />
        </button>
        <button
          className="icon-btn"
          title="Rotate right"
          disabled={disabled}
          onClick={() => setTransform({ rotation: ((transform.rotation + 90) % 360) as 0 | 90 | 180 | 270 })}
        >
          <IconRotateRight />
        </button>

        <span className="toolbar__divider" />

        <button
          className={`icon-btn ${showPresets ? 'active' : ''}`}
          title="Film presets"
          onClick={onTogglePresets}
        >
          <IconPresets />
        </button>
        <button className={`icon-btn ${showAdjust ? 'active' : ''}`} title="Adjustments" onClick={onToggleAdjust}>
          <IconSliders />
        </button>

        <span className="toolbar__divider" />

        <button className="icon-btn" title="Reset" disabled={disabled} onClick={resetAll}>
          <IconReset />
        </button>
      </nav>
    </>
  )
}

function MenuRow({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '8px 12px',
        borderRadius: 7,
        fontSize: 13,
        color: 'var(--pale)',
      }}
    >
      {children}
    </button>
  )
}
