# Ellis — Agent Instructions

## Read First

Before writing ANY code, read every file in `docs/`:
- `docs/handoff.md` — **START HERE** — Current session state, what works, what's broken, what to do next
- `docs/concept.md` — The core app concept and postal correspondence metaphor
- `docs/design-direction.md` — Visual design, motion, sound, and interaction patterns
- `docs/phase-plan.md` — Full phase roadmap with implementation steps and physics tuning guide
- `docs/3d-workflow.md` — **REQUIRED** — Rules for 3D positioning, axes reference, rotation gotchas. Read before touching any Three.js code.
- `docs/3d-tools.md` — **READ BEFORE VISUAL WORK** — List of R3F debug/editing tools (leva, TransformControls, Triplex, etc.). Pick the right tool for the task instead of manual code edits for positioning.
- `docs/git-rules.md` — How we branch and merge
- `docs/ui-foundations.md` — UI/UX principles to build from
- `docs/gotchas.md` — Known pitfalls. Read before debugging. Write when you hit something unexpected.

---

## How We Work

- **Polish matters.** UX and visual quality matter as much as functionality. A working feature that looks bad is half-done.
- **The postal metaphor is the north star.** Every UI element, transition, and interaction should feel like writing, sending, or receiving physical mail. If it feels like a generic web app, it's wrong. See `docs/concept.md`.
- **Don't over-engineer.** Simplest thing that works and looks good. No premature abstractions.
- **Verify before advising.** Training data has a cutoff. For library APIs, framework versions, or anything that changes fast — check official docs before giving guidance.

---

## Gotchas Protocol

When you encounter something unexpected — a bug, library quirk, CSS gotcha, config issue — **add it to `docs/gotchas.md` immediately** before moving on.

Use this format:
```markdown
### [Short title]
**Symptom:** What you observed
**Cause:** Root cause
**Fix:** What solved it
**Avoid:** How to not hit this again
```

---

## Communication

- Concise. No preamble.
- When blocked, say what's blocking you and what you need.
- Don't add features that weren't asked for.
- Don't summarize what you just did — the diff speaks for itself.

---

## 3D / Visual Work Rules

### Screen-to-Axes Translation
The user sees the screen. You work in 3D coordinates. **Always bridge the gap explicitly.** In this project's top-down orthographic camera setup:

```
What the user sees          →  3D axis
─────────────────────────────────────────
Left / Right on screen      →  X axis (-X = left, +X = right)
Up / Down on screen         →  Z axis (-Z = up/top, +Z = down/bottom)
The desk surface            →  XZ plane (Y ≈ 0)
Objects floating above desk →  +Y (toward camera)
```

When the user says "move it up" they mean **toward -Z** (screen top). When they say "move it down" they mean **toward +Z** (screen bottom). When they say "move it left" they mean **toward -X**. All desk objects sit on the **XZ plane**. Always confirm directions in your response so the user knows you understood correctly.

### Investigate Before Coding
- **GLB models:** Before attempting to animate or modify parts of a GLB, ALWAYS traverse and log the mesh structure first (`scene.traverse` + log names/vertex counts). If it's a single mesh, you cannot separate parts — pivot immediately.
- **Positioning:** Log bounding boxes, add colored debug markers, or ask for screenshots BEFORE writing positioning code. Never estimate 3D values. One investigation round saves five guess-and-check rounds.
- **Debug markers:** When working with unfamiliar coordinate systems, add colored spheres at known positions before writing any real code. Remove them when done.

### Build in the Scene, Not Over It
If the page is primarily a WebGL/R3F canvas, visual elements should live **IN the 3D scene** by default, not as HTML/CSS overlays. HTML overlays don't receive 3D lighting and will always look disconnected. Use drei's `Html` component for text on 3D surfaces.

### 2-Strike Rule
If a visual approach doesn't work after 2 iterations, **stop and propose an alternative approach**. Don't keep polishing a fundamentally constrained setup. Suggest the pivot — don't wait for the user to make the call.
