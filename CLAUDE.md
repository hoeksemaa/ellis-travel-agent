# Ellis Hackathon — Agent Instructions

## Read First

Before writing ANY code, read every file in `docs/`:
- `docs/git-rules.md` — How we branch and merge
- `docs/ui-foundations.md` — UI/UX principles to build from
- `docs/gotchas.md` — Known pitfalls. Read before debugging. Write when you hit something unexpected.

These docs are templates — some may not be filled in yet. Check what's there and respect what's been decided.

---

## How We Work

- **Polish matters.** UX and visual quality matter as much as functionality. A working feature that looks bad is half-done.
- **Don't over-engineer.** Simplest thing that works and looks good. No premature abstractions, no "just in case" features.
- **Own your area.** If `docs/architecture.md` has an ownership map, respect it. Don't touch someone else's area without a heads up.
- **Verify before advising.** Training data has a cutoff. For library APIs, framework versions, or anything that changes fast — search the web or check official docs before giving guidance. Don't present outdated info as fact.

---

## Gotchas Protocol

When you encounter something unexpected during the project — a bug, library quirk, CSS gotcha, config issue — **add it to `docs/gotchas.md` immediately** before moving on.

Use this format:
```markdown
### [Short title]
**Symptom:** What you observed
**Cause:** Root cause
**Fix:** What solved it
**Avoid:** How to not hit this again
```

This is how we compound knowledge across the team. Every agent reads gotchas before starting. If your problem is already documented there, follow the documented fix.

---

## Communication

- Concise. No preamble.
- When blocked, say what's blocking you and what you need.
- Don't add features that weren't asked for.
- Don't summarize what you just did — the diff speaks for itself.
