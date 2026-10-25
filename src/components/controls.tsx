import type { ReactNode } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  disabled?: boolean
}

export function Slider({ label, value, min, max, step = 1, onChange, format, disabled }: SliderProps) {
  const display = format ? format(value) : String(Math.round(value))
  return (
    <div className="control">
      <div className="control__head">
        <span className="control__label">{label}</span>
        <span className="control__value">{display}</span>
      </div>
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

interface ToggleProps {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="control__head" style={{ cursor: 'pointer' }} onClick={() => onChange(!checked)}>
      <span className="control__label">{label}</span>
      <span className={`toggle ${checked ? 'on' : ''}`}>
        <span className="toggle__knob" />
      </span>
    </div>
  )
}
