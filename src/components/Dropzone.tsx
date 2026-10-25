import { useState, type DragEvent } from 'react'
import { IconImage } from './icons'

interface DropzoneProps {
  onFiles: (files: FileList | File[]) => void
  onPick: () => void
}

export function Dropzone({ onFiles, onPick }: DropzoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dropzone--dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="dropzone__box">
        <IconImage size={48} style={{ color: 'var(--muted)' }} />
        <div style={{ fontSize: 18, fontWeight: 600 }}>Drop a photo to get started</div>
        <div className="dropzone__hint">or</div>
        <button className="btn-cta" onClick={onPick}>
          <IconImage size={16} />
          Upload image
        </button>
        <div className="dropzone__hint">JPG, PNG or WebP · processed locally in your browser</div>
      </div>
    </div>
  )
}
