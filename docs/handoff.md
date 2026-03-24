# Session Handoff — 2026-03-24

## Where We Left Off

The **landing page is complete**. We pivoted from the envelope-opening animation (which was fighting the single-mesh GLB constraints) to a cleaner postcard-based interaction. The app has been named **Bon Voyage**.

Ready to move to **Phase 3 (Postal UI Conversion)** — converting the existing form screens (username, quiz, voting, results) to postal-themed UI components.

## What Was Done This Session

### Major Pivot: Envelope Opening → Postcard Interaction
- **Removed** the entire procedural flap / clipping plane / envelope-opening animation system — it was fundamentally limited by the single-mesh GLB (414K verts, no separable flap or seal)
- **Replaced** the interactive envelope with a **flat postcard plane** (fox meadow texture, white border) that floats in the top-right, responds to hover, and slides to center with physics animation on click
- The **envelope GLB** is now static desk decoration in the top-left corner, partially off-screen

### Landing Page Scene Composition
- **Center postcard back** — a 3D plane (`card-texture.png`) in the WebGL scene with drei `Html` overlay for text. Contains:
  - "BON VOYAGE" header (Domine serif, burnt orange-red `#b54a2e`, letter-spaced)
  - Return address: "Bon Voyage Travel Co. / 42 Wanderlust Lane / Somewhere Beautiful, Earth 00001"
  - "Dear Adventurer" message — travel planning pitch in Dancing Script
  - Sign-off: "— Bon Voyage"
  - TO: address block with lines (You & Your Friends / Wherever You Dream Of / The World)
  - Vintage postage sticker (`postage_sticker.png`) top-right with postmark (`postcard_stamp.png`) overlapping at -8° rotation
- **Desk objects**: stamp, pencil, pen, eraser, passport GLB (top-right, partially off-screen)
- **Destination postcards**: 4 full-size cards (camel, polar bear, sloth, fox forest) with white borders, clustered bottom-left under the stamp with various rotations. Layering: polar bear (Y=0.02) → camel (Y=0.06) → envelope above
- **World map**: flat textured plane, 4x enlarged, far right with ~1/3 visible
- **CTA text**: "Click the postcard above to start ↑" positioned top-right near the floating postcard

### Animation Sequence (on postcard click)
1. Text/CTA fades out
2. Postcard slides from top-right to center with friction physics (2.8s, cubic ease-out rotation, no overshoot bounce)
3. 0.1s pause → dolly zoom starts (orthographic zoom 70 → 350 over 2.5s, ease-in-out)
4. White flash starts at 1.0s into zoom, builds over 2s (gradual opacity ramp)
5. Full white holds ~0.7s → transitions to username screen
6. Username screen fades in from white (reverse flash, 2s fade-out)

### App Name: Bon Voyage
- Displayed as header on center postcard and in sign-off
- No traditional navbar/logo — brand lives within the postal metaphor

## What Works

- Landing page desk scene with warm lighting, wood texture, all GLB models
- Interactive postcard with hover (cursor change, Z-shift), click, slide-to-center physics
- Dolly zoom + white flash transition to username screen
- Reverse flash (white fade-out) on the username screen entrance
- 3D postcard back with HTML text overlay receiving scene lighting
- All desk decoration items positioned and layered correctly
- Loading sequence: brown cover → scene loads → cover removed from DOM → postcard back fades in → CTA appears

## What the Next Agent Should Do

1. **Get a final screenshot review** of the landing page from the user — confirm everything looks good
2. **Move to Phase 3: Postal UI Conversion** — see `docs/phase-plan.md`
   - Convert username screen to postal-themed UI
   - Convert quiz form elements to handwritten/stationery style
   - Convert submit buttons to stamp/seal interactions
   - Convert selection chips to sticker-style elements
3. **Sound design** is noted as TODO in phase-plan.md — not a priority right now, focus on visual/interaction

## Key Files

| File | Role |
|------|------|
| `client/src/LandingPage.tsx` | Landing page orchestration — loading, CTA, flash transition |
| `client/src/LandingPage.css` | Landing page styles, flash animation, CTA, page-fade-in |
| `client/src/App.tsx` | App routing, fadingIn state for page transitions |
| `client/src/components/three/DeskScene.tsx` | R3F Canvas, lighting, CameraZoom, PostcardBack (3D + Html), scene composition |
| `client/src/components/three/DeskEnvelope.tsx` | Interactive postcard (slide physics) + static envelope decoration |
| `client/src/components/three/DeskObjects.tsx` | Desk items: stamp, pencil, pen, eraser, passport, world map, destination postcards |
| `client/src/components/three/DeskSurface.tsx` | Wood texture desk surface |
| `client/src/assets/card-texture.png` | Paper texture for center postcard back |
| `client/src/assets/postcard_stamp.png` | Post office cancellation mark |
| `client/src/assets/postage_sticker.png` | Vintage flower postage stamp sticker |
| `client/src/assets/world_map.png` | World map image for desk decoration |
| `client/src/assets/backgrounds/` | Destination postcard images (camel, fox forest, polar bear, sloth) |
| `client/src/assets/models/` | GLB models (envelope, stamp, pencil, pen, eraser, passport) |
| `docs/concept.md` | Core app concept and postal metaphor |
| `docs/design-direction.md` | Visual design, motion, sound specs |
| `docs/phase-plan.md` | Full phase roadmap with physics tuning guide + sound TODO |

## Axes Reference (for 3D positioning)

```
Camera: orthographic, position [0, 20, 0], zoom 70, looking straight down

     -Z (screen top)
          ↑
          |
-X ←————— + ————→ +X
(left)    |      (right)
          ↓
     +Z (screen bottom)

Y axis: toward camera (+Y) / toward desk (-Y)
Objects at Y ≈ 0 are flat on the desk surface
```

## Approach That Did NOT Work

- **Procedural envelope flap animation** — single-mesh GLB with 414K verts, no separable flap or seal. Clipping planes exposed interior teal lining. Procedural triangle flap didn't match baked geometry. Hours spent debugging coordinate mapping, rotation axes, and flap positioning. Pivoted to postcard-only approach.
- **HTML/CSS postcard overlay on top of WebGL canvas** — the HTML element doesn't receive 3D scene lighting, so it appeared brighter than the desk and broke visual cohesion. Fixed by making it a 3D plane in the scene with drei `Html` for text.
- **Guessing Three.js Html component scale** — the `scale` prop on drei's `Html` with `transform` is extremely sensitive. Use `distanceFactor` instead for orthographic cameras.
- **Loading cover with opacity:0** — even at opacity 0, the full-screen div at z-index 15 caused compositing artifacts dimming the canvas. Fixed by removing from DOM entirely when hidden.

## Environment

- React 19.1 + TypeScript 5.8 + Vite 6.3
- Three.js + @react-three/fiber + @react-three/drei
- GLB models from Meshy.ai, compressed with gltf-transform (Draco + WebP textures)
- Node.js backend with Anthropic SDK (not relevant to current work)
