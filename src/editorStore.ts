import { createStore } from './store'
import { neutralParams } from './presets'
import type { AdjustmentParams, CropState, TransformState } from './types'

export interface EditorState {
  params: AdjustmentParams
  transform: TransformState
  crop: CropState
  activePreset: string | null
  hasImage: boolean
}

export const editorStore = createStore<EditorState>({
  params: { ...neutralParams },
  transform: { flipX: false, flipY: false, rotation: 0 },
  crop: { ratio: null },
  activePreset: null,
  hasImage: false,
})

export function setParams(patch: Partial<AdjustmentParams>): void {
  editorStore.set((s) => ({ params: { ...s.params, ...patch }, activePreset: null }))
}

export function setTransform(patch: Partial<TransformState>): void {
  editorStore.set((s) => ({ transform: { ...s.transform, ...patch } }))
}

export function applyPreset(name: string, params: AdjustmentParams): void {
  editorStore.set({ params: { ...params }, activePreset: name })
}

export function clearPreset(): void {
  editorStore.set({ params: { ...neutralParams }, activePreset: null })
}

export function resetAll(): void {
  editorStore.set({
    params: { ...neutralParams },
    transform: { flipX: false, flipY: false, rotation: 0 },
    crop: { ratio: null },
    activePreset: null,
  })
}

export function setCropRatio(ratio: number | null): void {
  editorStore.set({ crop: { ratio } })
}

export function setHasImage(hasImage: boolean): void {
  editorStore.set({ hasImage })
}
