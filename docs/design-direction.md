# Design Direction

> Source of truth for visual design, motion, sound, and interaction patterns. Companion to `docs/concept.md`.

## Visual Identity

### Art Style
- **Illustrated / painterly** — watercolor-esque landscapes, not photographic
- **Storybook feel** — cute animals, wildflowers, soft colors, hand-painted textures
- **Paper and mail materials** — parchment textures, envelope paper, postage stamps, wax seals, ink

### Typography
- **Domine** (serif) — body text, headings. Old-world, grounded.
- **Dancing Script** (cursive) — branding, accents, handwritten elements. Warm, personal.
- These two fonts together = "handwritten letter from a literate friend"

### Color
- Dark green (#344a37) — primary action color (like forest ink)
- Warm neutrals — parchment, cream, kraft paper tones
- Palette should feel like natural materials: ink, paper, wax, dried flowers

---

## Postal UI Elements

Every UI element should map to a postal/stationery object:

| UI Element | Postal Object |
|-----------|---------------|
| Card container | Postcard or envelope |
| Text inputs | Handwritten fields (lined paper feel, pen-stroke underlines) |
| Submit buttons | Wax seal press / postage stamp |
| Selection chips | Stickers |
| Vote buttons (up/down) | Rubber stamps (approved / rejected) |
| Progress indicator | Stamps collected on envelope, or distance-along-a-mail-route |
| Loading state | Mail in transit (envelope moving, truck driving, etc.) |
| Results reveal | Sealed letter being opened |

---

## Illustrated Backgrounds

### Current Assets
- `bg-landscape.png` — meadow with fox (original, default)
- `backgrounds/fox_forest_bg.png` — forest with fox
- `backgrounds/camel_desert_bg.png` — desert with camel

### Target Set (reactive to destination results)
All should follow the established style: painted landscape, animal character, pond reflection, flowers/plants in foreground.

- [ ] **Tropical / beach** — ocean, palm trees, tropical bird or sea turtle
- [ ] **Alpine / snowy** — mountains, snow, maybe a mountain goat or snow fox
- [ ] **Urban / city** — illustrated cityscape with rooftop garden vibes, cat on a windowsill
- [ ] **Countryside / rural** — rolling hills, vineyard or farm, maybe a rabbit
- [ ] Current: forest, desert, meadow (covered)

### How Backgrounds React
Background shifts based on the destination that emerges from the AI's recommendations. During the quiz phase, show a neutral/default scene. Once results are generated, transition to the scene matching the winning destination's climate/geography.

---

## Motion & Physics

### Envelope Slide-In (Landing Page)
The signature animation: an envelope enters the screen and settles, like someone slid it across a table toward you.

**Physics model:** Deceleration with friction — NOT linear, NOT a simple ease-out.
- Initial velocity (fast entry from off-screen)
- Deceleration from surface friction (slowing down)
- Optional: micro-overshoot + settle (slides slightly past center, drifts back)
- CSS approach: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` gets close to paper-on-surface friction
- WebGL approach: proper rigid body with friction coefficient, slight rotation during slide, shadow casting, 3D depth as it lands flat

**WebGL adds:**
- Subtle 3D rotation during the slide (envelope isn't perfectly flat as it moves)
- Dynamic shadow underneath that changes with position
- Ambient lighting interaction (warm light on the envelope surface)
- Paper material shader (subtle fiber texture, light response)

### Stamp Press
- Quick downward motion → contact → slight bounce/squish
- Scale: 1.0 → 0.95 (press) → 1.02 (bounce) → 1.0 (settle)
- Duration: ~300ms total
- Optional: ink spread effect on contact (radial gradient that appears)

### Envelope Open / Letter Reveal
- Flap lifts open (rotate on bottom edge)
- Letter slides up and out
- Content fades/scales in as letter reaches full position
- NOT a page turn — it's an extraction from an envelope

### Screen Transitions
- Between quiz sections: current postcard slides off-screen (mailed away), new blank one slides in
- Between major phases: envelope seal → send animation → new envelope arrives
- NOT fade transitions, NOT page turns

---

## Sound Design

### Ambient Layer
- Soft nature sounds (birds, gentle wind, water) — always present, low volume
- Should match the current background scene (forest = birds + leaves, desert = wind, beach = waves)

### Interaction Sounds
| Action | Sound |
|--------|-------|
| Typing in fields | Pen scratching on paper |
| Submitting / stamping | Stamp press thud + ink spread |
| Sealing envelope | Paper folding + wax seal press |
| Sending mail | Whoosh / paper sliding |
| Receiving mail | Paper landing on surface (soft thwap) |
| Opening envelope | Paper tearing / envelope flap |
| Selecting chips/stickers | Soft peel + stick |
| Vote stamp | Rubber stamp press |

### Sourcing Strategy
- **AI generation**: Tools like ElevenLabs SFX, Stable Audio, or Suno for custom ambient loops
- **Sound libraries**: Freesound.org (CC-licensed), Pixabay audio, Zapsplat — search for "paper", "envelope", "stamp", "writing" foley
- **Recording**: Some sounds (pen on paper, envelope opening) are easy to record with a phone mic and sound authentic
- Needs a dedicated sound sourcing session to build the audio asset library

---

## Room System: Codes vs. Invitations

### Current: Room Codes
User creates a room → gets a 6-character code → shares it with friend who enters it manually.

**Pros:** Simple to build, no external services needed, works now.
**Cons:** Feels like joining a video game lobby, not receiving a postcard invitation. Breaks the postal metaphor.

### Alternative: Invitation Links
User creates a trip → gets a shareable link (or sends an email invite styled as a postcard). Friend opens the link and lands directly in the session.

**Pros:** Reinforces the postal metaphor (you're literally sending an invitation). Lower friction (click > type code). Scales naturally to groups (share link in group chat).
**Cons:** Requires URL routing, and email invitations need an email service. Link sharing is simpler than email but still more work than codes.

### Recommendation
**Start with shareable links, style them as postcard invitations.** The link itself can include the session code in the URL (`/trip/ABC123`), so the backend barely changes. The UX upgrade is huge: instead of "tell your friend to type ABC123," you send them a link that, when opened, shows a postcard invitation with the trip creator's name on it. Email invites are a v2 feature — link sharing via any messaging platform covers 90% of use cases.

---

## Open Design Questions

- **Landing page sequence**: What happens before the envelope slides in? Needs brainstorm session.
- **Loading screen**: What visual treatment during app initialization?
- **Group scaling UI**: How does the "waiting for others" experience work with 3-4+ people? Progress indicators per person?
- **WebGL scope**: Which animations justify WebGL vs. CSS? Envelope landing is the strongest candidate.
