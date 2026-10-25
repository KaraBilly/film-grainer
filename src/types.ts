export interface AdjustmentParams {
  exposure: number // -2..2 stops
  contrast: number // -1..1
  saturation: number // -1..1
  temperature: number // -1 (cool) .. 1 (warm)
  tint: number // -1 (magenta) .. 1 (green)
  grain: number // 0..100
  grainSize: number // 0..100
  grainEnabled: boolean
  halation: number // 0..100
  halationEnabled: boolean
  bloom: number // 0..100
  bloomEnabled: boolean
  vignette: number // 0..100
  vignetteEnabled: boolean
}

export interface TransformState {
  flipX: boolean
  flipY: boolean
  rotation: 0 | 90 | 180 | 270
}

export interface CropState {
  ratio: number | null // width / height; null = original
}

export interface FilmPreset {
  name: string
  type: 'color' | 'bw'
  params: AdjustmentParams
}

export interface EditorState {
  params: AdjustmentParams
  transform: TransformState
  activePreset: string | null
  hasImage: boolean
}
