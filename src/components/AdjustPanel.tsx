import { useStore } from '../store'
import { editorStore, setParams } from '../editorStore'
import { Slider, Toggle } from './controls'

function signed(v: number, digits = 2) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(digits)}`
}

export function AdjustPanel() {
  const { params } = useStore(editorStore)

  return (
    <aside className="panel side-panel">
      <h2 className="side-panel__title">Adjustments</h2>

      <div className="side-panel__section">
        <div className="side-panel__section-head">Light</div>
        <Slider
          label="Exposure"
          value={params.exposure}
          min={-2}
          max={2}
          step={0.01}
          format={(v) => signed(v)}
          onChange={(exposure) => setParams({ exposure })}
        />
        <Slider
          label="Contrast"
          value={params.contrast}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => signed(v)}
          onChange={(contrast) => setParams({ contrast })}
        />
      </div>

      <div className="side-panel__section">
        <div className="side-panel__section-head">Color</div>
        <Slider
          label="Saturation"
          value={params.saturation}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => signed(v)}
          onChange={(saturation) => setParams({ saturation })}
        />
        <Slider
          label="Temperature"
          value={params.temperature}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => signed(v)}
          onChange={(temperature) => setParams({ temperature })}
        />
        <Slider
          label="Tint"
          value={params.tint}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => signed(v)}
          onChange={(tint) => setParams({ tint })}
        />
      </div>

      <div className="side-panel__section">
        <div className="side-panel__section-head">Texture</div>
        <Toggle
          label="Grain"
          checked={params.grainEnabled}
          onChange={(grainEnabled) => setParams({ grainEnabled })}
        />
        <Slider
          label="Grain amount"
          value={params.grain}
          min={0}
          max={100}
          disabled={!params.grainEnabled}
          onChange={(grain) => setParams({ grain })}
        />
        <Slider
          label="Grain size"
          value={params.grainSize}
          min={0}
          max={100}
          disabled={!params.grainEnabled}
          onChange={(grainSize) => setParams({ grainSize })}
        />
      </div>

      <div className="side-panel__section">
        <div className="side-panel__section-head">Film look</div>
        <Toggle
          label="Halation"
          checked={params.halationEnabled}
          onChange={(halationEnabled) => setParams({ halationEnabled })}
        />
        <Slider
          label="Halation"
          value={params.halation}
          min={0}
          max={100}
          disabled={!params.halationEnabled}
          onChange={(halation) => setParams({ halation })}
        />
        <Toggle
          label="Bloom"
          checked={params.bloomEnabled}
          onChange={(bloomEnabled) => setParams({ bloomEnabled })}
        />
        <Slider
          label="Bloom"
          value={params.bloom}
          min={0}
          max={100}
          disabled={!params.bloomEnabled}
          onChange={(bloom) => setParams({ bloom })}
        />
        <Toggle
          label="Vignette"
          checked={params.vignetteEnabled}
          onChange={(vignetteEnabled) => setParams({ vignetteEnabled })}
        />
        <Slider
          label="Vignette"
          value={params.vignette}
          min={0}
          max={100}
          disabled={!params.vignetteEnabled}
          onChange={(vignette) => setParams({ vignette })}
        />
      </div>
    </aside>
  )
}
