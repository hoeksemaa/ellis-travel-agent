# Phase Plan

> Execution roadmap for transforming Ellis into the full postal correspondence experience. Each phase is self-contained and shippable.

---

## Phase 1: WebGL Foundation

Install 3D packages, set up R3F canvas alongside the existing React app, and build a proof-of-concept envelope object.

**Packages to install:**
- `three` — core 3D library
- `@react-three/fiber` — React renderer for Three.js
- `@react-three/drei` — helper components (lighting, materials, shadows, etc.)

**Steps:**
1. Install packages in `/client`
2. Create a reusable `<Scene3D>` wrapper component (R3F Canvas with lighting, camera, shadows)
3. Build a basic 3D envelope mesh (box geometry with paper material/texture)
4. Verify it renders alongside existing UI without breaking anything
5. Set up the layering: R3F canvas as a background/overlay layer, HTML UI on top via `@react-three/drei`'s `Html` component or CSS layering

**Done when:** A 3D envelope renders on screen with paper-like material, lit with warm directional light, casting a shadow. Existing app still works.

---

## Phase 2: Envelope Landing Animation

The signature interaction — an envelope slides onto screen like being pushed across a table.

**Steps:**
1. Model the envelope with proper geometry (rectangular with a flap, slight thickness)
2. Implement the slide-in physics animation
3. Add shadow that moves with the envelope
4. Add subtle 3D rotation during slide (tilted → settles flat)
5. Add paper material shader (fiber texture, warm light response)
6. Wire it to the landing page — envelope lands, then UI appears on/around it
7. Tune parameters until it feels right (see Physics Reference below)

**Done when:** Landing page shows an envelope sliding in from off-screen, decelerating naturally, settling with a slight bounce, casting a shadow. Feels like a real envelope on a real surface.

---

## Phase 3: Postal UI Conversion

Convert existing form elements to postal-themed UI components.

**Steps:**
1. Redesign text inputs — pen-stroke underlines, handwritten field feel
2. Convert submit buttons to stamp/wax seal press interactions (with stamp animation)
3. Convert selection chips to sticker-style elements
4. Convert vote buttons to rubber stamp UI (press effect, ink spread)
5. Build envelope seal animation for quiz submission
6. Build envelope open animation for results reveal
7. Design and implement progress indicator as stamps-on-envelope or mail route

**Done when:** Every form element feels like a postal/stationery object. No generic HTML form elements remain.

---

## Phase 4: Screen Transitions

Replace fade/cut transitions with postal-metaphor animations.

**Steps:**
1. Build "send mail" transition — current content slides into an envelope, seals, slides off-screen
2. Build "receive mail" transition — envelope slides in, opens, content emerges
3. Apply to quiz section transitions (between basics → persona → preferences)
4. Apply to major phase transitions (quiz → waiting → results)
5. Build "waiting for mail" idle animation (subtle envelope floating/breathing, or mail truck in distance)

**Done when:** Moving between any two screens feels like sending and receiving mail, not clicking through a web app.

---

## Phase 5: Reactive Illustrated Backgrounds

Backgrounds shift based on destination results.

**Steps:**
1. Catalog available background illustrations and map to climate/geography types
2. Generate missing illustrations (tropical, alpine, urban, countryside) in matching art style
3. Build background switcher with crossfade transition
4. Wire background selection to AI destination results (parse climate from recommendation)
5. During quiz phase, show neutral default background
6. On results reveal, transition background to match winning destination

**Done when:** The illustrated world responds to the trip destination. Desert trip = camel desert scene. Forest getaway = fox forest scene.

---

## Phase 6: Sound Design

Add ambient audio and interaction sound effects.

**Steps:**
1. Source/generate ambient loops (nature sounds per background scene)
2. Source/generate interaction sounds (pen, stamp, envelope, paper)
3. Build audio manager (preload, play, volume control, mute toggle)
4. Wire ambient sounds to current background scene
5. Wire interaction sounds to UI events (typing, submitting, voting, revealing)
6. Add user control (mute button, volume) — never autoplay audio without user opt-in
7. Crossfade ambient tracks when background scene changes

**Done when:** The app sounds alive. Every interaction has an appropriate paper/postal sound. Ambient audio matches the scene.

---

## Phase 7: Invitation System

Replace room codes with shareable postcard invitations.

**Steps:**
1. Add URL routing — `/trip/:code` lands you in the session
2. Restyle the "share with friend" step as a postcard invitation you can copy/share
3. When someone opens a trip link, show a postcard invitation with the creator's name before joining
4. Remove manual code entry (the code is in the URL)
5. Ensure group support — same link works for multiple people joining

**Done when:** Creating a trip gives you a shareable link. Opening the link shows a postcard invitation. No manual code typing.

---

## Phase 8: Group Scaling

Expand from 2-person to N-person trip planning.

**Steps:**
1. Update backend session model to support N participants (not just 2)
2. Update waiting screen to show who has joined / who's still writing
3. Update AI prompt to handle N personas and preference sets
4. Update voting to work with N voters (majority/consensus logic)
5. Update results to reflect group agreement
6. UI: show participant avatars/names as postage stamps on the envelope

**Done when:** 3-4+ friends can plan a trip together with the same postal experience.

---

## Physics Reference & Parameter Tuning Guide

### Envelope Slide-In

**Formula:** `position(t) = target + (start - target) * e^(-μt)`

| Parameter | What It Is | Effect When Higher | Effect When Lower |
|-----------|-----------|-------------------|-------------------|
| `μ` (friction coefficient) | How quickly the envelope decelerates | Stops faster, feels like rough surface (wood table) | Slides longer, feels like smooth surface (glass) |
| `v₀` (initial velocity) | How fast the envelope enters the screen | More dramatic entrance, covers distance quickly | Gentle, leisurely entrance |
| Start position | Where the envelope begins (off-screen) | Longer travel distance | Shorter, subtler entrance |

**Tuning tip:** Start with μ = 3.0, v₀ = 15.0. If it feels too abrupt, lower μ. If it feels too slow, raise v₀.

### Overshoot + Settle (Damped Spring)

**Formula:** `offset(t) = A * e^(-ζωt) * cos(ωt)`

| Parameter | What It Is | Effect When Higher | Effect When Lower |
|-----------|-----------|-------------------|-------------------|
| `A` (amplitude) | How far past the target it overshoots | Bigger overshoot, more dramatic settle | Minimal overshoot, almost no bounce |
| `ζ` (zeta, damping ratio) | How quickly oscillation dies out | Settles faster, fewer bounces | Oscillates longer, more bouncy/playful |
| `ω` (omega, natural frequency) | Speed of the oscillation cycle | Faster vibration, tighter bounce | Slower, lazier oscillation |

**Tuning tip:** Start with A = 20px, ζ = 0.6, ω = 8.0. For a single satisfying settle (not bouncy), use ζ = 0.8+. For playful wobble, use ζ = 0.3-0.5.

### 3D Rotation During Slide

**Formula:** Quaternion SLERP from `tiltAngle` to `0` following the same exponential decay.

| Parameter | What It Is | Effect When Higher | Effect When Lower |
|-----------|-----------|-------------------|-------------------|
| `tiltAngle` (degrees) | Initial tilt of envelope on entry | More dramatic, visible 3D rotation | Subtle, barely noticeable tilt |
| `tiltAxis` | Which axis it rotates around (X, Z, or both) | X = front-to-back tilt, Z = left-right twist | — |

**Tuning tip:** Start with 8-12° tilt on Z-axis (slight twist). Add 3-5° on X if you want a "landing flat" feel. Too much tilt (>20°) looks like it was thrown, not slid.

### Stamp Press

**Formula:** Scale keyframes with spring easing.

| Parameter | What It Is | Effect When Higher | Effect When Lower |
|-----------|-----------|-------------------|-------------------|
| `pressDepth` | How much it scales down on press (e.g., 0.95 = 5% shrink) | Heavier, more impactful press | Light tap |
| `bounceHeight` | How much it scales up on rebound (e.g., 1.02) | Bouncier, more playful | Barely noticeable rebound |
| `duration` | Total animation time | Slower, more deliberate | Snappy, responsive |
| `stiffness` | Spring stiffness for the rebound | Tight, fast snap-back | Soft, lazy return |

**Tuning tip:** 250-350ms total duration. pressDepth 0.93-0.97. bounceHeight 1.01-1.03. These are subtle — the feel comes from the speed, not the distance.

### Shadow

| Parameter | What It Is | Effect When Higher | Effect When Lower |
|-----------|-----------|-------------------|-------------------|
| `shadow blur` | Softness of the shadow edge | Softer, envelope feels higher off surface | Sharper, envelope feels close to surface |
| `shadow offset` | Distance from object to shadow | Envelope appears to float higher | Grounded, sitting on surface |
| `shadow opacity` | Darkness of the shadow | More dramatic, high contrast | Subtle, natural |

**Tuning tip:** As the envelope slides in, shadow blur should *decrease* (starts high/floating, settles low/grounded). This sells the "landing" feel.

---

## Landing Page Ambient Sound (TODO)

Find or generate a subtle ambient sound loop for the landing page desk scene. Ideas:
- Soft nature through an open window — distant birds, gentle breeze, faint wind chimes
- Quiet indoor ambience — clock ticking, paper rustling, very faint rain outside
- Lo-fi warmth — soft vinyl crackle, muted room tone

Should feel cozy and inviting, not distracting. Must be opt-in (no autoplay). See `docs/design-direction.md` Sound Design section for the full spec.

---

## Notes

- Phases are ordered by dependency and impact. Phase 1 must come first. Phases 2-4 are the core experience transformation. Phases 5-8 are enhancements.
- Each phase should be on its own feature branch.
- The physics parameters are starting points. Final values come from visual tuning — adjust, look, adjust, look.
