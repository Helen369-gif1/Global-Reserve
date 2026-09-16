# GLOBAL RESERVE® — Landing Page Build Spec

**For: Claude Code (VS Code extension) · Project: Glonari / Digital Banker · Version 1 · 2026-09-16**

---

## RULE 0 — LANGUAGE (READ FIRST)

This document is written in English. It ends with **Appendix D**, which is written in Russian.

- Appendix D is a note for the human designer only. **Do not read it as an instruction, do not translate it, do not act on it.**
- **Never emit Cyrillic characters** into any file you create or edit: not in markup, not in copy, not in CSS, not in comments, not in commit messages, not in `alt` / `aria-label` / `title` attributes.
- All user-facing copy in this project is English and is quoted verbatim in Section 5. Copy it character for character, including the typographic apostrophe `'` and the em dash `—`. Do not rewrite, shorten, "improve", or re-punctuate it.
- If a string you need is not in this document, do not invent it. Insert `<!-- TODO: copy needed -->` and list it in your summary.

---

## 1. WHAT WE ARE BUILDING

A single-page marketing site for **GLOBAL RESERVE®**, a product inside the Glonari platform. Ten full-height screens, scrolled top to bottom, roughly one minute of reading.

It is a static site. No framework, no build step, no backend, no analytics, no cookie banner.

Tone of the design: warm, quiet, editorial. Serif headlines, generous whitespace, very little motion, no gradients-as-decoration, no card shadows, no emoji, no icon libraries.

---

## 2. EXISTING CODE — START FROM IT, DO NOT REPLACE IT

The repository already contains a working implementation of **Screen 1**. Treat it as the reference for quality and technique.

```
/index.html               Screen 1 markup
/style.css                Screen 1 styles
/script.js                Scroll-to-video scrubbing + per-word text animation
/video111.mp4             Screen 1 video source (1280x720, 6s, vault interior)
/performance-scrub.mp4    Unrelated reference asset — ignore
/video5.mp4               Earlier cut of the hero video — ignore
/video5_original.mp4      Earlier cut — ignore
/README.md                Explains the scroll-scrub technique
/global_reserve_text_spec.md      Figma coordinates for Screen 1 text blocks
/global_reserve_timecoding.md     Screen 1 scroll timecodes
```

Rules for the existing code:

1. Do not change the Screen 1 scroll-scrub mechanism, the 300vh runway, the sticky viewport, or the text block coordinates.
2. Do not delete `README.md`, `global_reserve_text_spec.md`, or `global_reserve_timecoding.md`.
3. You may refactor `style.css` into the token structure in Section 4, as long as Screen 1 renders identically.
4. Screen 1 is currently missing its eyebrow, its two buttons, and its scroll hint. Add them per Section 5.1.

---

## 3. TARGET FILE STRUCTURE

```
/index.html
/css/tokens.css           Design tokens only (Section 4)
/css/base.css             Reset, typography, container, utilities
/css/screens.css          Per-screen layout
/js/scrub.js              Screen 1 scroll-scrub (moved from script.js, logic unchanged)
/js/reveal.js             IntersectionObserver reveal for screens 2-10
/js/ticker.js             Screen 8 marquee
/js/counter.js            Screen 4 counter animation (see Section 7)
/js/timescale.js          Screen 2 balance-to-time animation (see Section 7)
/media/                   All video and image assets
```

- Vanilla HTML/CSS/JS. No npm, no bundler, no TypeScript, no Tailwind, no React.
- One `<section>` per screen, with `id="screen-1"` through `id="screen-10"`.
- Each section gets a `data-screen` attribute with its slug: `hero`, `question`, `red`, `rewards`, `states`, `path`, `gia`, `transparency`, `honest`, `cta`.
- Serve locally with `python3 -m http.server`. The blob fetch in the scrub script does not work over `file://`.

---

## 4. DESIGN TOKENS

Put these in `/css/tokens.css` as custom properties on `:root`.

### Color

| Token | Value | Used for |
|---|---|---|
| `--gr-ink` | `#16130F` | Primary text on light |
| `--gr-ink-2` | `#5C554C` | Secondary text, captions |
| `--gr-paper` | `#F5F2ED` | Page background |
| `--gr-paper-2` | `#EDE8E0` | Alternating section background |
| `--gr-line` | `#D7D0C4` | Hairlines, dividers |
| `--gr-dark` | `#17140F` | Screen 9 background |
| `--gr-dark-ink` | `#F1EBE1` | Screen 9 text |
| `--gr-accent` | `#B98A3C` | Warm gold. Hairline accents and focus rings only — never large fills |
| `--gr-on-media` | `#FFFFFF` | Text placed over video |

Text over video also gets `text-shadow: 0 2px 24px rgba(0,0,0,.35)`.

### Type

Headlines: `'Playfair Display', Georgia, serif` (Google Fonts, weights 500 and 700, `display=swap`).
Everything else: system sans stack, already defined in the current `style.css`.

Sizes are given for a 1920px-wide reference frame. Use `clamp()` so they scale down; the min values are the mobile sizes.

| Token | Desktop | Line height | Weight | Mobile min |
|---|---|---|---|---|
| `--fs-h1` | 64px | 120% | 500 | 30px |
| `--fs-h2` | 48px | 120% | 500 | 26px |
| `--fs-hero-body` | 36px | 150% | 700 | 17px |
| `--fs-body` | 20px | 160% | 400 | 16px |
| `--fs-lead` | 24px | 150% | 500 | 17px |
| `--fs-stat` | 72px | 100% | 500 | 34px |
| `--fs-item-title` | 20px | 140% | 600 | 17px |
| `--fs-small` | 16px | 150% | 400 | 15px |
| `--fs-caption` | 14px | 150% | 400 | 13px |
| `--fs-eyebrow` | 14px | 100% | 600 | 12px, `letter-spacing: .2em`, uppercase |

Letter spacing is `0` everywhere except the eyebrow.

### Layout

- Content container: `max-width: 1200px`, side padding `clamp(20px, 5vw, 80px)`.
- Screen 1 text column: `width: 47.5%` (912/1920), `left: 26.25%` (504/1920) — already implemented, do not change.
- Vertical rhythm inside a screen: `--space-s: 16px`, `--space-m: 32px`, `--space-l: 64px`, `--space-xl: 120px`.
- Screens 2-10 are `min-height: 100vh` with vertically centered content, except Screens 4 and 8, which are `min-height: 60vh`.
- Single breakpoint at `768px`. Below it: every two-column layout stacks to one column, media goes above text, the Screen 5 bar becomes vertical, the Screen 6 stepper becomes a vertical list, buttons go full width and stack.

### Buttons

Two variants only.

- `.btn--primary`: filled `--gr-ink`, text `--gr-paper`, `border-radius: 999px`, padding `18px 40px`, font-size 16px, weight 600.
- `.btn--secondary`: transparent, 1.5px border `--gr-line`, text inherits screen foreground.
- Both: `<a>` elements with `href="#"` for now, `transition: opacity .2s`, visible focus ring in `--gr-accent`.
- No third variant, no icons inside buttons.

---

## 5. SCREEN-BY-SCREEN SPEC

Copy below is final. Reproduce it verbatim.

### 5.1 Screen 1 — Hero (already built, needs completion)

Full-bleed scroll-scrubbed video, text centered over it, 300vh runway, sticky viewport. Two text blocks appear in sequence as the user scrolls.

| Element | Copy | Style | Position |
|---|---|---|---|
| Eyebrow | `GLOBAL RESERVE®` | `--fs-eyebrow` | centered, above H1 |
| H1 | `Your Asset Control Center` | `--fs-h1`, Playfair 500 | centered, top 10.556% |
| Body | `Think of it as the smart hub behind your Glonari participation — one place that tracks your housing payments, rewards, and reserves, so you don't have to juggle them yourself.` | `--fs-hero-body`, Playfair 700 | centered, top 40% |
| Button 1 | `See How It Works` | primary | centered, 48px under body |
| Button 2 | `Meet Gia` | secondary | centered, beside button 1 |
| Scroll hint | `Scroll — it takes about a minute` | `--fs-caption` | centered, 64px from bottom |

Timing, unchanged from `global_reserve_timecoding.md`:

- Text block 1 (eyebrow + H1): visible `0.00s – 2.00s` of the 5s scroll timeline.
- Text block 2 (body + buttons): fades in at `2.00s`, holds from `2.50s` to `5.00s`.
- Crossfade `0.5s` between blocks.
- Buttons belong to block 2 and fade with it, but must be clickable whenever they are visible.

No balances, no numbers anywhere on this screen.

### 5.2 Screen 2 — The Question

Two columns, 50/50. Text left, media right. Media slot: `--media-question` (see Section 6).

| Element | Copy | Style | Align |
|---|---|---|---|
| H2 | `Everyone asks how much they have.`<br>`Almost nobody can answer how long they're covered.` | `--fs-h2`, two lines, `<br>` between them | left |
| Body | `A balance tells you about today. It doesn't tell you how many years your housing is financially covered. Global Reserve answers the second question — it reads everything you hold, everything you owe on housing, and turns it into time.` | `--fs-body`, max-width 560px | left |
| Stat label | `Years of housing covered` | `--fs-caption`, `--gr-ink-2` | left |
| Stat value | `8.5 years` | `--fs-stat`, color `--gr-ink-2` | left |
| Caption | `Your own number depends on what you hold and what you owe.` | `--fs-caption`, `--gr-ink-2` | left |

The stat block sits below the body with a 1px top hairline in `--gr-line`.

### 5.3 Screen 3 — What RED actually is

Centered header, then one wide card. Inside the card: illustration left (40%), text right (60%). Three short lines in a 3-column row below the card.

Card: 1.5px border `--gr-line`, `border-radius: 8px`, padding 40px, no shadow, no fill.
Media slot: `--media-red`.

| Element | Copy | Style | Align |
|---|---|---|---|
| Eyebrow | `THE PART EVERYONE ASKS ABOUT FIRST` | `--fs-eyebrow` | center |
| H2 | `RED isn't money. It's housing, paid forward.` | `--fs-h2` | center |
| Body (in card) | `RED — Real Estate Dollars — are credits that exist for one purpose: covering your housing inside Glonari. Your monthly housing fee comes out of them, and they're what stands behind you when you move on a property. They're used, not traded — which is exactly why they hold their job instead of drifting off into something else.` | `--fs-body` | left |
| Line 1 | `Made for housing, and nothing else` | `--fs-small` | left in column |
| Line 2 | `Spent as you live, not held as an investment` | `--fs-small` | left in column |
| Line 3 | `The more you hold, the longer you're covered` | `--fs-small` | left in column |

One card, not a three-token grid.

### 5.4 Screen 4 — Rewards

Short screen, `min-height: 60vh`. Everything centered, max-width 720px. A full-width counter strip sits at the bottom of the section.
Media slot: `--media-counter` (or the generated animation, Section 7).

| Element | Copy | Style | Align |
|---|---|---|---|
| H2 | `When the system saves you money, you keep it.` | `--fs-h2` | center |
| Body | `Glonari is always looking for a better price, a better term, a smaller fee. When it finds one, the saving doesn't disappear into the platform — it comes back to you as rewards, and those rewards work on the same thing everything else here works on: your housing.` | `--fs-body` | center |
| Lead line | `Nothing to claim. Nothing to chase. It happens whether you're watching or not.` | `--fs-lead` | center, 32px above the strip |

The counter strip shows motion only. No currency, no digits that read as a real balance.

### 5.5 Screen 5 — What your reserve is doing right now

Centered header (max-width 720px), then a horizontal 4-segment bar at full container width, then a 4-column row of labels, then a centered closing line. No media.

Bar: height 56px, `border-radius: 999px`, 1.5px border `--gr-line`, four segments split `1.2fr 1fr .9fr .6fr`, divided by 1.5px vertical rules. Fills step through `--gr-paper-2` to `--gr-line`. On hover a segment lifts to full opacity; the effect is decorative only and must not shift layout.

| Element | Copy | Style | Align |
|---|---|---|---|
| H2 | `Your reserve is never just sitting there.` | `--fs-h2` | center |
| Body | `At any moment, part of what you hold is free, part is set aside for a home you're working toward, and part is holding a home you already have. Global Reserve labels every piece, all the time, so you always know what you can use and what's already spoken for.` | `--fs-body` | center |
| Segment labels | `Ready` · `Committed` · `Reserved` · `Scheduled` | `--fs-caption` | center of segment |
| Column 1 | `Ready` / `Free to cover your housing or grow your position.` | `--fs-item-title` / `--fs-small` | left |
| Column 2 | `Committed` / `Held while you work toward a property.` | same | left |
| Column 3 | `Reserved` / `Holding a home that's already yours.` | same | left |
| Column 4 | `Scheduled` / `Arriving later, managed for you.` | same | left |
| Closing line | `No hidden totals. No number that means two things at once.` | `--fs-small` | center |

The four state names are product terminology. Do not rename them to `Available`, `Locked`, `Pending`, or anything else.

### 5.6 Screen 6 — The path to a home

Two columns, 50/50: photo left, text right. Below both, a horizontal 4-step stepper at full container width, then a highlighted line.
Media slot: `--media-home`.

Stepper: a 1.5px horizontal rule with four 14px circles sitting on it, label left-aligned under each circle. Static — no progress fill, no percentages.

| Element | Copy | Style | Align |
|---|---|---|---|
| H2 | `A home here doesn't start with a signature.`<br>`It starts with holding steady.` | `--fs-h2`, two lines | left |
| Body | `Before you take on a property, you go through a qualifying period: you set aside what's required and you keep it there. That's it. No credit theatre, no paperwork marathon — the proof is that you held your position. Global Reserve runs the clock, watches the threshold, and shows you the home you're working toward the whole way through.` | `--fs-body` | left |
| Step 1 | `Choose the home you're working toward` | `--fs-small` | left |
| Step 2 | `Set aside what it requires` | `--fs-small` | left |
| Step 3 | `Hold — and watch the days come down` | `--fs-small` | left |
| Step 4 | `Qualify, and move` | `--fs-small` | left |
| Note line | `If your position slips below what's required, the clock resets. You'll hear about it early, while it's still easy to fix.` | `--fs-small`, 2px left rule in `--gr-line`, 12px padding | left |

The note line stays at full body size and full contrast. Do not shrink it, grey it out, or move it into a footer.

### 5.7 Screen 7 — Gia

Two columns, 40/60: video left, text right. This video is required; it is the only human presence on the page. Do not substitute an illustration, an avatar, or an animation.
Media slot: `--media-gia`.

Over the video, in its lower third, two quote bubbles fade in one after another, 3s each, looping. Bubbles: 1px border `--gr-line`, `border-radius: 14px`, padding `10px 16px`, `--fs-small`, background `rgba(255,255,255,.9)`.

Right column: eyebrow, H2, body, then five items in a two-column grid with the fifth spanning both columns, then a closing line above a 1px top hairline.

| Element | Copy |
|---|---|
| Bubble 1 | `"Your housing is covered into the mid-2030s."` |
| Bubble 2 | `"Nothing needs your attention today."` |
| Eyebrow | `THE PART THAT THINKS` |
| H2 | `Gia isn't a chat window. She's the reason this feels simple.` |
| Body | `Gia is the intelligence running underneath Global Reserve. She's mostly invisible, and that's the point — you should be living your life, not administering it.` |
| Item 1 title | `She explains.` |
| Item 1 text | `Every change gets one sentence in plain language. Not a log entry, an answer: "At your current position, your housing is covered into the mid-2030s."` |
| Item 2 title | `She watches.` |
| Item 2 text | `If your qualifying position starts drifting toward trouble, you hear it while it's still small.` |
| Item 3 title | `She handles.` |
| Item 3 text | `Your monthly housing fee is taken care of in the background. No transfers, no reminders, no late anything.` |
| Item 4 title | `She looks ahead.` |
| Item 4 text | `She keeps an eye on what your housing will need later and quietly keeps your position moving in that direction.` |
| Item 5 title | `She marks the moments.` |
| Item 5 text | `First foundation. First qualification. First home secured. Years of work shouldn't end up as a line in a transaction list.` |
| Closing line | `Gia never moves anything without your permission. She just makes sure you never have to guess.` |

Video element: `autoplay muted loop playsinline preload="metadata"`, `poster` attribute pointing at the poster frame, `object-fit: cover`, `aspect-ratio: 4/5`, `border-radius: 8px`. Add a small mute/unmute toggle in the top-right corner of the video and an English `<track kind="captions" srclang="en" label="English" default>` if a VTT file is present in `/media/`.

### 5.8 Screen 8 — Transparency

Short screen, `min-height: 60vh`. Centered header, max-width 720px. Below it a marquee at full viewport width, edge to edge, breaking out of the container. No media.

| Element | Copy | Align |
|---|---|---|
| H2 | `Nothing happens quietly.` | center |
| Body | `Every movement in your reserve is written down the moment it happens, with the date and the reason attached. Not a statement that arrives at the end of the month — a history you can open right now, at two in the morning, for no reason at all.` | center |

Marquee items, in this order, repeated to fill the loop:

`Housing fee covered` · `Rewards earned` · `Position committed` · `Qualification started` · `Qualification complete` · `Home reserved`

Each item is a pill: 1px border `--gr-line`, `border-radius: 999px`, padding `8px 18px`, `--fs-caption`, `--gr-ink-2`, `white-space: nowrap`.

Marquee behaviour: one direction, constant speed, 40-60s per cycle, no pause on hover, no drag. Fade the left and right 120px with a mask so pills do not clip hard at the edges. Implement by duplicating the item list once and translating the track by -50%; `aria-hidden="true"` on the duplicate.

### 5.9 Screen 9 — The honest part

Inverted screen: background `--gr-dark`, text `--gr-dark-ink`. Everything centered in a 640px column, section padding 1.5x normal. Bullets are left-aligned inside the centered block. No media, no graphics.

| Element | Copy | Align |
|---|---|---|
| H2 | `Here's what this isn't.` | center |
| Body | `Global Reserve is built for one thing: managing your participation in Glonari's housing world. That focus is the whole advantage, and it comes with limits we'd rather say out loud than bury in a footnote.` | center |
| Bullet 1 | `It's not a bank account, a deposit, or an investment product` | left |
| Bullet 2 | `There's no yield, and no promise you can cash it out` | left |
| Bullet 3 | `RED is a housing credit — it's used, not traded` | left |
| Lead line | `Purpose-built beats general-purpose. That's the entire idea.` | center |

Bullet marker is an em dash in `--gr-ink-2`, not a disc, not an icon. Body text stays at `--fs-body`. This screen must not read like fine print.

### 5.10 Screen 10 — CTA

Full-bleed video background, same warm object as the hero, centered content, max-width 760px.
Media slot: `--media-cta`.

| Element | Copy | Style | Align |
|---|---|---|---|
| H2 | `You don't need a plan yet.`<br>`You just need to see where you stand.` | `--fs-h1` scaled to 56px, two lines | center |
| Body | `Open Global Reserve and you'll see how long you're covered, what's already working for you, and what the next step looks like — with Gia already watching the parts you'd rather not think about.` | `--fs-body` | center |
| Button 1 | `Open Your Reserve` | primary | center |
| Button 2 | `Talk to Gia First` | secondary | center, beside button 1 |

This video autoplays and loops normally. It is not scroll-scrubbed. Both buttons are required; do not drop the secondary one.

---

## 6. MEDIA CONTRACT

Every media slot is a `<div class="media-slot" data-slot="...">` with a fixed `aspect-ratio`. If the asset file is missing, the slot renders a neutral placeholder: `--gr-paper-2` fill, 1.5px dashed `--gr-line` border, and a centered English label reading `Media pending` plus the expected filename. The page must never break because an asset is absent.

| Slot | Screen | File | Format | Length | Behaviour |
|---|---|---|---|---|---|
| `--media-hero` | 1 | `media/hero-vault.mp4` | 1280x720 | 6s | Scroll-scrubbed. Already present as `video111.mp4`; re-encode with `ffmpeg -i video111.mp4 -g 1 -an media/hero-vault.mp4` |
| `--media-question` | 2 | `media/time-scale.mp4` | 1080x1080 | 4-6s | Plays once when the section reaches 40% of the viewport, then holds the last frame. May be generated instead — Section 7.1 |
| `--media-red` | 3 | `media/red-object.webp` | 800x800, transparent | still | Static. Optional 8-10s loop if a video version is supplied |
| `--media-counter` | 4 | `media/rewards-ticker.mp4` | 1920x200 | 8s | Loop. May be generated instead — Section 7.2 |
| `--media-home` | 6 | `media/home.jpg` | 1200x1400, 4:5 | still | Static photograph |
| `--media-gia` | 7 | `media/gia.mp4` | 1080x1350, 4:5 | 12-18s | Loop, muted, `playsinline`, poster `media/gia-poster.jpg` |
| `--media-cta` | 10 | `media/cta-vault.mp4` | 1280x720 | 8-10s | Loop, muted, slowed |

All videos: no audio track except Gia, `preload="metadata"`, `playsinline`, and `muted` before `autoplay`. Total page weight target under 12MB on desktop; on viewports under 768px, load poster images instead of the decorative videos on Screens 2, 4, and 10.

---

## 7. GENERATED ANIMATIONS

Two assets may be built in code instead of supplied as video. Build them only when explicitly asked in the prompt. Until then, the slot shows the placeholder from Section 6.

Both must be self-contained, dependency-free, canvas or SVG, under 150 lines, and must respect `prefers-reduced-motion: reduce` by rendering their final frame statically.

### 7.1 Screen 2 — balance-to-time animation (`js/timescale.js`)

A vertical stack of bars representing an amount dissolves and re-forms as a horizontal timeline. Duration 4s, ease-out, plays once when the section crosses 40% of the viewport, then holds the final frame.

- Colors from tokens only: bars `--gr-line`, timeline rule `--gr-ink-2`, one accent tick in `--gr-accent`.
- No axis labels, no numbers, no currency symbols, no tooltips. The only number on this screen is the English stat line in the markup.
- Square canvas, `aspect-ratio: 1/1`, responsive to container width, drawn at `devicePixelRatio`.
- Export a single `initTimeScale(el)` function. No globals.

### 7.2 Screen 4 — rewards counter (`js/counter.js`)

A horizontal strip suggesting continuous accrual: small marks drifting right at constant speed, occasionally brightening.

- Strip is `1920x200` in proportion, full container width, height clamped to 120px.
- **No digits at all.** No currency, no percentages, no plus signs. Motion only.
- Speed: one full traversal in 8s, `linear`, seamless loop.
- Colors: marks `--gr-line`, highlight `--gr-accent` at 40% opacity.
- Export a single `initCounter(el)` function. No globals.

---

## 8. MOTION, ACCESSIBILITY, PERFORMANCE

1. Scroll reveal for Screens 2-10: opacity `0 -> 1` and `translateY(24px -> 0)`, 600ms, `cubic-bezier(.22,.61,.36,1)`, triggered once at 25% visibility via `IntersectionObserver`. Nothing else animates on scroll.
2. No parallax, no pinned sections other than Screen 1, no horizontal scroll, no scroll hijacking.
3. `@media (prefers-reduced-motion: reduce)`: disable reveal, marquee, bubbles, and generated animations; show final frames; Screen 1 shows a single static frame with both text blocks visible.
4. Semantic markup: one `<h1>` (Screen 1) and `<h2>` for every other screen. Buttons that navigate are `<a>`. Decorative media gets `aria-hidden="true"` and empty `alt`.
5. Keyboard: visible focus ring, logical tab order, no positive `tabindex`.
6. Contrast: all text meets WCAG AA. Over video, rely on the text shadow plus a `rgba(0,0,0,.25)` overlay if a measurement fails.
7. Fonts: `display=swap`, preconnect to Google Fonts, one family, two weights.
8. Images: `loading="lazy"` on everything below the fold, explicit `width` and `height` to prevent layout shift.
9. No console errors or warnings on load.

---

## 9. ACCEPTANCE CHECKLIST

Before reporting done, verify each item and state the result:

- [ ] No Cyrillic character exists anywhere in the repository output. Verify with `grep -rPl "[\x{0400}-\x{04FF}]" --include=* .` over the files you created or edited, excluding the three original `.md` reference files.
- [ ] All ten sections exist with correct ids and `data-screen` values.
- [ ] Every string on the page matches Section 5 character for character.
- [ ] Screen 1 still scrubs on scroll and its text coordinates are unchanged.
- [ ] Missing media assets render the placeholder, and the page still lays out correctly.
- [ ] Screens 4 and 8 contain no digits.
- [ ] The Gia video element exists with `muted`, `loop`, `playsinline`, and a poster.
- [ ] Layout is correct at 1920, 1440, 1024, 768, and 375 CSS pixels.
- [ ] `prefers-reduced-motion` produces a fully static, readable page.
- [ ] No framework, no build step, no package manager files added.

---

## APPENDIX A — PROMPTS TO PASTE INTO CLAUDE CODE

Use these in order. Each assumes this document is open in the workspace as `BUILD-SPEC.md`.

**A1 — Scaffold**

> Read BUILD-SPEC.md. Follow Rule 0 strictly: English only in all output, no Cyrillic anywhere. Restructure the project per Section 3 without changing how Screen 1 behaves, create the token files from Section 4, and scaffold empty sections for Screens 2-10 with correct ids, `data-screen` values, and headings only. Do not write any copy yet beyond the headings.

**A2 — Copy and layout, in batches**

> Read BUILD-SPEC.md Section 5.2 to 5.5 and build Screens 2 through 5 completely: markup, copy verbatim, layout, responsive behaviour at the 768px breakpoint. Use the media placeholder from Section 6 for every media slot. English only.

> Now do the same for Sections 5.6 to 5.8, then 5.9 to 5.10.

**A3 — Motion and accessibility**

> Implement Section 8 across all screens: the reveal observer, the Screen 8 marquee, the Gia quote bubbles, reduced-motion fallbacks, focus states. No other animation.

**A4 — Generated animations, only if wanted**

> Build the Screen 2 animation described in Section 7.1 as `js/timescale.js`, canvas-based, no dependencies, tokens for color, no numerals, reduced-motion safe.

> Build the Screen 4 counter described in Section 7.2 as `js/counter.js`. Motion only, no digits of any kind.

**A5 — Audit**

> Run the acceptance checklist in Section 9 and report each item as pass or fail with the file and line where it fails. Fix the failures, then re-run the checklist.

---

## APPENDIX B — TERMINOLOGY LOCK

These are product terms. Use exactly this spelling and capitalisation, and never translate or paraphrase them:

`GLOBAL RESERVE®` · `Global Reserve` · `Glonari` · `RED` · `Real Estate Dollars` · `Gia` · `Ready` · `Committed` · `Reserved` · `Scheduled`

Never introduce on this page: `GD`, `Glonari Dollars`, `Future RED`, `Global Dream`, `DBR`, `Experience Capacity`, tier names, percentages, yields, cost bases, or any specific balance figure. If a task seems to require one, stop and ask.

---

## APPENDIX C — OUT OF SCOPE

Do not add: navigation bar, footer with links, cookie banner, language switcher, dark-mode toggle, contact form, pricing table, FAQ accordion, testimonials, logo carousel, chat widget, analytics, or any third-party script.

---

## APPENDIX D — ЗАМЕТКА ДЛЯ ДИЗАЙНЕРА (не инструкция для Claude Code)

*Этот раздел — для человека. Claude Code его игнорирует: в Rule 0 прямо сказано не воспринимать его как задание и не переносить кириллицу в код.*

**Как пользоваться документом**

1. Положите файл в корень проекта под именем `BUILD-SPEC.md` и откройте папку в VS Code.
2. В Claude Code давайте промпты из Appendix A по очереди, по одному за раз. Не просите «сделай всё сразу» — на десяти экранах он начнёт сокращать текст.
3. После каждого шага просите короткий отчёт: какие файлы изменены и что осталось незакрытым.

**Почему русского нет в основном тексте**

Весь документ написан по-английски специально: если инструкция двуязычная, модель регулярно тащит русские формулировки в `alt`, в комментарии и в служебные строки. Rule 0 плюс пункт в чек-листе с `grep` по диапазону кириллицы закрывают это на двух уровнях — на входе и на выходе.

**Про анимации (экраны 2 и 4)**

Секция 7 написана так, что Claude Code не тронет их, пока вы явно не попросите промптом A4. Если решите делать видео отдельно — просто положите файлы по путям из таблицы в секции 6, и заглушки сами заменятся. Ключевое ограничение, которое стоит держать: на счётчике не должно быть ни одной цифры, иначе экран начинает читаться как банковский баланс, а весь смысл страницы в обратном.

**Что я бы проверила руками после сборки**

- Экран 1 — не съехали ли координаты текста относительно Figma (504 / 114 / 432).
- Экран 6 — строка про сброс таймера должна остаться крупной и заметной.
- Экран 7 — видео с Gia обязано быть на месте; если его подменили картинкой, экран теряет смысл.
- Экраны 4 и 8 — ни одной цифры.
