# Film Grainer

A React reconstruction of [Dehancer Online](https://online.dehancer.com/) — a dark, retro film-emulation photo editor. Built as an original implementation: the layout, interaction and design language follow the original, while the film engine and every asset are written from scratch.

## Reverse-engineering notes

- **Original stack**: Vue 3 + Vite + Tailwind CSS v4 + `vue-advanced-cropper` + `floating-vue` (PWA).
- **Design tokens** recovered from the shipped CSS: background `#242424`, blueprint grid `#2f2f2f` + grid lines, frosted panel `rgba(32,32,32,.72)` + `backdrop-filter: blur(12px)`, accent `#77aabf`, pale text `#c9c2b6`, orange CTA gradient `#e67e22 → #d35400`.
- **Adjustment model** recovered from the `/api/v1/presets` payload: `exposure`, `contrast`, `color_boost` (saturation), `temperature`, `tint`, `grain`, `halation`, `bloom`, `vignette` (`exposure`/`size`/`feather`) — each with an enable flag.
- The original renders images **server-side** (`/api/v1/image/render`, `/image/previews`, `/image/export`); its film engine is closed-source. This project performs everything **client-side** in Canvas 2D with its own algorithms.

## Features

- Drag-and-drop / click to upload (processed locally, nothing leaves the browser).
- Live adjustments: Exposure, Contrast, Saturation, Temperature, Tint.
- Film texture: Grain (amount + size), Halation, Bloom, Vignette.
- 25 film presets (color + black & white), each with a live thumbnail preview.
- Transform: flip H/V, rotate 90°, center-crop to aspect ratio.
- PNG export, mock sign-in/subscription UI.

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # type-check + production build to dist/
```

## Structure

```
src/
  App.tsx                  # workspace, layout, image load, render loop
  editorStore.ts           # tiny useSyncExternalStore-based store
  store.ts                 # generic store + hooks
  types.ts / presets.ts    # state model + film presets
  engine/filmRenderer.ts   # Canvas 2D film pipeline (grade/grain/halation/bloom/vignette)
  components/              # Toolbar, AdjustPanel, PresetStrip, CropModal, AuthModal, Dropzone, controls, icons
```
