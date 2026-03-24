# 3D Development Tools

> Reference for R3F/Three.js debug and visual editing tools. Read this when doing any visual positioning, animation, or scene composition work. Pick the right tool for the task — don't default to manual code edits for visual tweaking.

## Positioning & Tweaking

### Leva (pmndrs)
**Use for:** Repositioning, rotating, scaling objects with live sliders. The default choice for quick visual tweaking.

- React hooks API: `useControls('ObjectName', { x: 0, z: 0, rotation: 0, scale: 1 })`
- Floating panel with sliders, color pickers, vectors, booleans
- Zero config, instant feedback, no page refresh needed
- **Workflow:** Add controls → tweak live → hardcode final values → remove leva
- Install: `npm install leva`
- v0.10.1 (Oct 2025), actively maintained, part of pmndrs ecosystem
- [GitHub](https://github.com/pmndrs/leva)

### drei TransformControls
**Use for:** Rough positioning with draggable gizmo arrows directly on objects in the viewport (like Unity/Blender handles).

- Declarative R3F component: `<TransformControls><mesh ... /></TransformControls>`
- Translate/rotate/scale modes
- Best paired WITH leva — use gizmos for rough placement, sliders for fine-tuning
- No numeric inputs — complementary, not a replacement for leva
- Part of @react-three/drei (already installed)

## Visual Editing

### Triplex (pmndrs)
**Use for:** Full Unity-like visual editor that writes transforms back to your JSX source code. Best for large scene composition sessions.

- VS Code extension — two-way binding between code and visual workspace
- Select objects, move them visually, code updates automatically
- v0.72.5 (Jan 2026), actively maintained
- Bigger setup/commitment than leva — use when you have many objects to arrange
- [GitHub](https://github.com/pmndrs/triplex)

## Animation

### Theatre.js (@theatre/r3f)
**Use for:** Complex animation sequences, cinematic timelines, keyframing.

- Visual timeline editor with keyframe support
- R3F extension available
- **Overkill for positioning** — only use if building multi-step animations
- ⚠️ Development moved to private repo (unclear maintenance timeline)
- [GitHub](https://github.com/theatre-js/theatre)

## Performance

### r3f-perf
**Use for:** Performance monitoring — FPS, draw calls, triangles, memory.

- Drop-in component: `<Perf />`
- Not a positioning tool — use alongside leva for debugging performance
- v0.96+, actively maintained
- [GitHub](https://github.com/utsuboco/r3f-perf)

## Not Recommended for R3F

| Tool | Why |
|------|-----|
| **Tweakpane** | Same idea as leva but not React-native. Leva is strictly better in R3F. |
| **three-inspect** | Built for Threlte (Svelte). R3F support is secondary. Last release mid-2024. |

## When to Use What

| Task | Tool |
|------|------|
| Move/rotate/scale a few objects | **Leva** |
| Rough drag-and-drop placement | **drei TransformControls** + Leva |
| Arrange a full scene with many objects | **Triplex** |
| Build animation sequences | **Theatre.js** |
| Debug rendering performance | **r3f-perf** |
| Quick one-off position check | Add a console.log or debug sphere |
