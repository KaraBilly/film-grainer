import type { AdjustmentParams, TransformState } from '../types'

const MAX_DIM = 1920

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  return [c, ctx]
}

function colorGrade(data: ImageData, params: AdjustmentParams): void {
  const px = data.data
  const exposureMul = Math.pow(2, params.exposure)
  const contrast = 1 + params.contrast // 0..2
  const sat = 1 + params.saturation // 0..2
  const temp = params.temperature
  const tint = params.tint

  // Channel scale factors (precomputed).
  const rTemp = 1 + temp * 0.25
  const bTemp = 1 - temp * 0.25
  const gTint = 1 + tint * 0.2
  const rbTint = 1 - tint * 0.12

  for (let i = 0; i < px.length; i += 4) {
    let r = (px[i] / 255) * exposureMul
    let g = (px[i + 1] / 255) * exposureMul
    let b = (px[i + 2] / 255) * exposureMul

    // Contrast around mid-gray.
    r = (r - 0.5) * contrast + 0.5
    g = (g - 0.5) * contrast + 0.5
    b = (b - 0.5) * contrast + 0.5

    // Saturation.
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    r = lum + (r - lum) * sat
    g = lum + (g - lum) * sat
    b = lum + (b - lum) * sat

    // White balance (temperature / tint).
    r = clamp01(r * rTemp * rbTint)
    g = clamp01(g * gTint)
    b = clamp01(b * bTemp * rbTint)

    px[i] = r * 255
    px[i + 1] = g * 255
    px[i + 2] = b * 255
  }
}

function makeBlurredHighlights(src: HTMLCanvasElement, blurPx: number, brighten: number): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(src.width, src.height)
  ctx.filter = `blur(${blurPx}px) brightness(${brighten})`
  ctx.drawImage(src, 0, 0)
  ctx.filter = 'none'
  return c
}

function tintLayerRed(c: HTMLCanvasElement): void {
  const ctx = c.getContext('2d')!
  ctx.save()
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = '#ff2414'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.restore()
}

function makeGrain(w: number, h: number, size: number): HTMLCanvasElement {
  const cell = 1 + Math.round((size / 100) * 6) // 1..7 px
  const gw = Math.ceil(w / cell)
  const gh = Math.ceil(h / cell)
  const [c, ctx] = makeCanvas(w, h)
  const img = ctx.createImageData(gw, gh)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    // Mid-gray noise; overlay blend makes deviations from 128 visible.
    const v = 128 + (Math.random() * 2 - 1) * 90
    d[i] = v
    d[i + 1] = v
    d[i + 2] = v
    d[i + 3] = 255
  }
  const [small] = makeCanvas(gw, gh)
  small.getContext('2d')!.putImageData(img, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(small, 0, 0, gw, gh, 0, 0, w, h)
  return c
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number): void {
  const maxR = Math.hypot(w, h) / 2
  const inner = maxR * 0.45
  const grad = ctx.createRadialGradient(w / 2, h / 2, inner, w / 2, h / 2, maxR)
  const strength = amount / 100
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(0,0,0,${0.85 * strength})`)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

// Center-crop a source image to a width/height ratio (null = original).
export function cropSource(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  ratio: number | null,
): { src: CanvasImageSource; w: number; h: number } {
  if (!ratio) return { src: source, w: sw, h: sh }
  const srcRatio = sw / sh
  let cw: number
  let ch: number
  if (ratio > srcRatio) {
    cw = sw
    ch = sw / ratio
  } else {
    ch = sh
    cw = sh * ratio
  }
  const sx = (sw - cw) / 2
  const sy = (sh - ch) / 2
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(cw))
  c.height = Math.max(1, Math.round(ch))
  c.getContext('2d')!.drawImage(source, sx, sy, cw, ch, 0, 0, c.width, c.height)
  return { src: c, w: c.width, h: c.height }
}

export function renderFilm(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  params: AdjustmentParams,
  transform: TransformState,
  out: HTMLCanvasElement,
  maxDim = MAX_DIM,
): void {
  const rotated = transform.rotation === 90 || transform.rotation === 270
  const ow = rotated ? sh : sw
  const oh = rotated ? sw : sh

  // Cap working resolution for interactive performance.
  const scale = Math.min(1, maxDim / Math.max(ow, oh))
  const w = Math.max(1, Math.round(ow * scale))
  const h = Math.max(1, Math.round(oh * scale))

  out.width = w
  out.height = h
  const ctx = out.getContext('2d', { willReadFrequently: true })!
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Draw source with flip + rotation.
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((transform.rotation * Math.PI) / 180)
  ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)
  ctx.drawImage(source, -sw / 2, -sh / 2, sw, sh)
  ctx.restore()

  // Color grade (exposure / contrast / saturation / temperature / tint).
  const imageData = ctx.getImageData(0, 0, w, h)
  colorGrade(imageData, params)
  ctx.putImageData(imageData, 0, 0)

  const longEdge = Math.max(w, h)

  // Bloom: blurred, brightened highlights screen-blended.
  if (params.bloomEnabled && params.bloom > 0) {
    const blur = longEdge * (0.004 + (params.bloom / 100) * 0.02)
    const layer = makeBlurredHighlights(out, blur, 1.6)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = (params.bloom / 100) * 0.85
    ctx.drawImage(layer, 0, 0)
    ctx.restore()
  }

  // Halation: red glow from scattered highlight light.
  if (params.halationEnabled && params.halation > 0) {
    const blur = longEdge * (0.003 + (params.halation / 100) * 0.018)
    const layer = makeBlurredHighlights(out, blur, 1.35)
    tintLayerRed(layer)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = (params.halation / 100) * 0.9
    ctx.drawImage(layer, 0, 0)
    ctx.restore()
  }

  // Vignette.
  if (params.vignetteEnabled && params.vignette > 0) {
    drawVignette(ctx, w, h, params.vignette)
  }

  // Grain.
  if (params.grainEnabled && params.grain > 0) {
    const noise = makeGrain(w, h, params.grainSize)
    ctx.save()
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = (params.grain / 100) * 0.9
    ctx.drawImage(noise, 0, 0)
    ctx.restore()
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}
