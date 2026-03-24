# App Concept

> Source of truth for the core concept and creative direction. All design and implementation decisions should trace back to this document.

## One-Liner

A travel planning app that feels like exchanging postcards with a well-traveled friend — not using a chatbot.

## The Premise

Planning group trips is stressful. Coordinating schedules, preferences, interests, and activities across multiple people scattered around the world takes too much time and mental energy. Existing AI travel tools are just chat windows — functional, but generic and forgettable.

This app makes travel planning **feel like something** — specifically, like writing and receiving postcards from a knowledgeable, well-traveled friend who handles all the hard parts for you.

## Core Metaphor: Postal Correspondence

The entire app is framed as an exchange of postcards and letters. There is no "dashboard." There are no "forms." There are postcards you write, envelopes you seal and stamp, and letters you receive and open.

**Who's writing to whom:**
- Each traveler writes postcards to **Ellis** — the AI travel agent (a well-traveled, knowledgeable friend)
- Ellis reads everyone's postcards, does research, and writes back with curated destination suggestions
- The group opens Ellis's letter together and decides where to go

**This is NOT:**
- Friends writing to each other (they write to Ellis independently)
- A book with pages you turn (this is mail, not a book)
- A traditional chatbot interface (no chat window, no message bubbles)

## Who Uses This

Friends, family, couples, or groups who want to plan a trip together but don't want to spend hours coordinating. The app handles the grunt work — information gathering, preference alignment, destination research — so the humans just have to show up and pick.

**Group size:** 2+ people. The concept and architecture should support groups, not just pairs.

## The Flow (as Postal Metaphor)

| Step | What the User Experiences | Postal Metaphor |
|------|--------------------------|-----------------|
| Landing | An envelope arrives on screen | Receiving your invitation to plan |
| Username | Write your name | Your return address |
| Create/join trip | Start or join a planning session | Addressing the envelope / accepting the invitation |
| Quizzes (basics, persona, preferences) | Fill out travel info | Writing the contents of your postcard to Ellis |
| Submit | Confirm your answers | Stamp it, seal it, send it off |
| Waiting | Partner(s) still writing | Mail in transit |
| AI generates options | Ellis reads all postcards, researches | Ellis at work |
| 5 options arrive | Destination cards appear | A letter arrives — unseal it to reveal destination cards |
| Voting | Mark which destinations you like | Pressing stamps/stickers on your favorites |
| Final result | Winning destination + full itinerary | A special sealed letter — the final recommendation — opened together |

## Emotional Arc

**Invitation → Writing → Sending → Anticipation → Discovery → Decision**

The experience should feel leisurely and warm, not transactional. You're not "submitting a form" — you're writing to a friend. You're not "waiting for results" — you're waiting for the mail to arrive.

## Origin Story

One team member had a brother living in Australia while she lived in America. Planning trips together across that distance was exhausting — hours of back-and-forth just to figure out where to eat, what to see, when to go. This app exists to take that friction away.

## Open Questions

- **App name**: "Ellis" is the project name. Final app name TBD.
- **Landing page animation**: What happens before the envelope slides in? Needs dedicated brainstorm session.
- **Invitation mechanism**: Room codes vs. email/link invitations. See `docs/design-direction.md` for analysis.
