import type { AdjustmentParams, FilmPreset } from './types'

export const neutralParams: AdjustmentParams = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  grain: 30,
  grainSize: 40,
  grainEnabled: true,
  halation: 0,
  halationEnabled: false,
  bloom: 0,
  bloomEnabled: false,
  vignette: 0,
  vignetteEnabled: false,
}

// Original interpretations of well-known film stocks.
// Values are our own creative settings, not Dehancer's data.
function p(
  name: string,
  type: FilmPreset['type'],
  overrides: Partial<AdjustmentParams>,
): FilmPreset {
  return { name, type, params: { ...neutralParams, ...overrides } }
}

export const FILM_PRESETS: FilmPreset[] = [
  // --- Color negative / slide ---
  p('Kodak Portra 160', 'color', { contrast: -0.08, saturation: -0.1, temperature: 0.12, grain: 22, grainSize: 30 }),
  p('Kodak Portra 400', 'color', { contrast: -0.05, saturation: -0.05, temperature: 0.1, grain: 30, grainSize: 36 }),
  p('Kodak Portra 800', 'color', { contrast: -0.02, saturation: -0.02, temperature: 0.12, grain: 42, grainSize: 44 }),
  p('Kodak Ektar 100', 'color', { contrast: 0.22, saturation: 0.28, temperature: 0.05, grain: 18, grainSize: 24 }),
  p('Kodak Gold 200', 'color', { contrast: 0.12, saturation: 0.12, temperature: 0.28, tint: -0.04, grain: 34, grainSize: 40 }),
  p('Kodak ColorPlus 200', 'color', { contrast: 0.08, saturation: 0.08, temperature: 0.2, grain: 36, grainSize: 42 }),
  p('Kodak Ultramax 400', 'color', { contrast: 0.16, saturation: 0.18, temperature: 0.1, grain: 38, grainSize: 40 }),
  p('Fujifilm Superia 400', 'color', { contrast: 0.14, saturation: 0.06, temperature: -0.08, tint: 0.1, grain: 34, grainSize: 38 }),
  p('Fujicolor C200', 'color', { contrast: 0.06, saturation: 0.02, temperature: -0.1, tint: 0.08, grain: 30, grainSize: 40 }),
  p('Fujichrome Velvia 50', 'color', { contrast: 0.3, saturation: 0.45, temperature: 0.05, grain: 16, grainSize: 22 }),
  p('Fujichrome Provia 100F', 'color', { contrast: 0.18, saturation: 0.2, temperature: 0.0, grain: 18, grainSize: 26 }),
  p('Agfa Portrait XPS 160', 'color', { contrast: -0.1, saturation: -0.06, temperature: 0.16, grain: 24, grainSize: 34 }),
  p('Cinestill 50D', 'color', { contrast: 0.08, saturation: 0.04, temperature: 0.06, halation: 45, halationEnabled: true, grain: 20, grainSize: 28 }),
  p('Cinestill 800T', 'color', { contrast: 0.1, saturation: -0.02, temperature: -0.14, tint: 0.06, halation: 70, halationEnabled: true, grain: 40, grainSize: 40 }),
  p('Kodak Vision3 250D', 'color', { contrast: -0.06, saturation: -0.04, temperature: 0.08, halation: 30, halationEnabled: true, grain: 24, grainSize: 30 }),
  p('Kodak Vision3 500T', 'color', { contrast: -0.04, saturation: -0.06, temperature: -0.1, halation: 40, halationEnabled: true, grain: 34, grainSize: 38 }),
  p('Lomochrome Purple', 'color', { contrast: 0.12, saturation: 0.1, temperature: 0.1, tint: 0.24, grain: 36, grainSize: 44 }),
  p('Polaroid 600', 'color', { contrast: 0.02, saturation: -0.05, temperature: 0.22, vignette: 32, vignetteEnabled: true, grain: 28, grainSize: 36 }),

  // --- Black & white ---
  p('Kodak Tri-X 400', 'bw', { contrast: 0.28, grain: 52, grainSize: 46, saturation: -1 }),
  p('Ilford HP5 Plus 400', 'bw', { contrast: 0.16, grain: 38, grainSize: 40, saturation: -1 }),
  p('Ilford Delta 3200', 'bw', { contrast: 0.22, grain: 74, grainSize: 62, saturation: -1 }),
  p('Kodak T-Max 100', 'bw', { contrast: 0.18, grain: 14, grainSize: 22, saturation: -1 }),
  p('Fujifilm Acros 100', 'bw', { contrast: 0.12, grain: 12, grainSize: 20, saturation: -1 }),
  p('Kodak Double-X 5222', 'bw', { contrast: 0.2, grain: 40, grainSize: 42, saturation: -1, halation: 22, halationEnabled: true }),
  p('Agfa APX 100', 'bw', { contrast: 0.14, grain: 24, grainSize: 30, saturation: -1 }),
]

export const colorPresets = FILM_PRESETS.filter((f) => f.type === 'color')
export const bwPresets = FILM_PRESETS.filter((f) => f.type === 'bw')
