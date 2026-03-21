# UI/UX Foundations

> These are timeless design principles — not a specific design system. Use them as a foundation to guide whatever system your team builds.

## Core Principles

### 1. Visual Hierarchy
Every screen should have a clear reading order. The user's eye should naturally flow from most important to least important. Achieve this through:
- **Size** — bigger = more important
- **Weight** — bolder = more important
- **Contrast** — higher contrast against background = more important
- **Spacing** — more whitespace around something = more important (isolation draws attention)

### 2. Consistency
Same action = same appearance everywhere. If your primary button is blue and rounded in one place, it's blue and rounded everywhere. Inconsistency signals "different behavior" to users — if the behavior is the same, the appearance must be too.

### 3. Feedback
Every user action needs a visible response:
- Click → visual press state
- Submit → loading indicator
- Error → clear message with what to do
- Success → confirmation (toast, redirect, visual change)
- Hover → cursor change + subtle visual shift on interactive elements

Silent failures are the worst UX bug. If something breaks, tell the user.

### 4. Spacing and Alignment
- Pick a base unit (4px or 8px) and use only multiples of it
- Elements that are related should be closer together; unrelated elements should have more space between them (Law of Proximity)
- Align everything to a grid — misaligned elements are immediately noticeable even to non-designers

### 5. Color with Purpose
- Use color to communicate meaning, not decoration
- Limit your palette: 1 primary action color, 1 neutral scale, 1 destructive/error color, maybe 1 accent
- Ensure sufficient contrast for readability (WCAG AA minimum: 4.5:1 for body text)

### 6. Typography
- Max 2 font families (1 is usually enough)
- Establish a type scale and stick to it (e.g., 14 / 16 / 20 / 24 / 32)
- Line height for body text: 1.5–1.6. For headings: 1.1–1.3

### 7. Loading and Empty States
- Every async operation needs a loading state (skeletons > spinners)
- Every list/collection needs an empty state — not a blank screen
- Loading states should match the layout of the loaded content to prevent layout shift

## References
These are well-established resources worth skimming if you want deeper grounding:
- **Nielsen's 10 Usability Heuristics** — the foundational UX checklist (nngroup.com)
- **Refactoring UI** (refactoringui.com) — practical visual design for developers
- **Laws of UX** (lawsofux.com) — psychology-backed design principles
- **Google Material Design Guidelines** — not the components, but the principles sections on color, typography, spacing

## Pre-Demo Polish Checklist
Before presenting, verify:
- [ ] All text is readable (contrast, font size)
- [ ] All interactive elements have hover/focus states
- [ ] Loading states for async operations
- [ ] No horizontal scrollbar at any viewport size
- [ ] Consistent spacing and border-radius
- [ ] Favicon is set (not the default framework logo)
