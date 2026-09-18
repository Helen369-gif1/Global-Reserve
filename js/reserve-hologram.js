// Screen 5.5 — Reserve Hologram in the Vault (Build Spec Section 5.5a).
// Independent of Screen 1's scroll-scrub (js/scrub.js) and of Screen 4.5's
// mask reveal (js/video-reveal.js) — this file imports nothing from either
// and is not imported by them. One local initReserveHologram(section)
// bootstrapped only for #screen-5-5; no globals.
//
// Progress model: a single paused GSAP timeline whose "seconds" are treated
// as a 0-1 fraction of the section's own scroll range (same trick as
// js/video-reveal.js's headline timeline). tl.time(value) — not
// tl.progress(value) — renders the exact visual state for that fraction:
// .time() takes the literal internal time value, while .progress() would
// normalize against the timeline's own total duration, which is no longer
// 1 now that the exit-fade tweens are gone (the last tween finishes around
// internal time 0.81, so tl.duration() < 1). Using .time() keeps every
// phase boundary below matching its documented scroll-progress number
// regardless of where the last tween happens to end, and scrubbing it
// backward on upward scroll is correct by construction — there is no
// separate reverse path.
//
// There is no exit fade: every tween below only ever brings something IN.
// Once the last one finishes (around progress ~0.78), nothing further is
// scheduled, so the fully assembled panel simply holds through progress 1 —
// it only leaves the viewport because the sticky pin itself ends.
//
// Unlike js/video-reveal.js, there is no continuous requestAnimationFrame
// loop running while this section is off-screen: a scroll/resize event
// schedules at most one rAF-batched update, and that's it.

function initReserveHologram(section) {
  const wrapper = section.querySelector('.reserve-hologram__wrapper');
  const panel = section.querySelector('.reserve-hologram__panel');
  const beam = section.querySelector('.reserve-hologram__beam');
  const baseGlow = section.querySelector('.reserve-hologram__base-glow');
  const headerLines = section.querySelector('.reserve-hologram__header-lines');
  const eyebrow = section.querySelector('.reserve-hologram__eyebrow');
  const heading = section.querySelector('.reserve-hologram__heading');
  const disclaimer = section.querySelector('.reserve-hologram__disclaimer');
  const dividers = Array.from(section.querySelectorAll('.reserve-hologram__divider'));
  const footerAccent = section.querySelector('.reserve-hologram__footer-accent');
  const ringProgress = section.querySelector('.reserve-hologram__ring-progress');
  const ringPercent = section.querySelector('.reserve-hologram__ring-percent');
  const ringLabel = section.querySelector('.reserve-hologram__ring-label');

  const statOrder = ['ready', 'reserved', 'scheduled', 'committed'];
  const stats = statOrder
    .map((state) => section.querySelector(`.reserve-hologram__stat[data-state="${state}"]`))
    .filter(Boolean);

  if (!wrapper || !panel || !ringProgress) return;

  const CIRCUMFERENCE = 703.72;
  const RING_FINAL_OFFSET = 126.67; // 82% drawn

  const tl = gsap.timeline({ paused: true });

  // 0.00-0.10 — vault and rest state only; nothing scheduled here.

  // 0.10-0.24 — light source appears: projector glow and the beam cone
  tl.fromTo([beam, baseGlow], { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'power1.out' }, 0.1);

  // 0.18-0.44 — the panel frame gradually builds
  tl.fromTo(
    panel,
    { opacity: 0, y: 26, scaleY: 0.94 },
    { opacity: 1, y: 0, scaleY: 1, duration: 0.26, ease: 'power2.out' },
    0.18
  );

  // 0.30-0.50 — heading and its decorative lines (header rules + dividers)
  tl.fromTo(
    [headerLines, eyebrow, heading, disclaimer, ...dividers],
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out', stagger: 0.015 },
    0.3
  );

  // 0.40-0.64 — the ring draws to 82%, then the centre value and label
  tl.fromTo(
    ringProgress,
    { strokeDashoffset: CIRCUMFERENCE },
    { strokeDashoffset: RING_FINAL_OFFSET, duration: 0.24, ease: 'power2.out' },
    0.4
  );
  tl.fromTo(
    [ringPercent, ringLabel],
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out', stagger: 0.04 },
    0.46
  );

  // 0.52-0.78 — state summaries reveal in order: Ready, Reserved, Scheduled,
  // Committed (locked reveal order from Build Spec Section 5.5a), plus the
  // small footer accent line.
  if (stats.length) {
    tl.fromTo(
      [...stats, footerAccent],
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.11, ease: 'power2.out', stagger: 0.045 },
      0.52
    );
  }

  // 0.78-1.00 — the complete composition holds. No exit fade: nothing is
  // scheduled here or beyond, so every element simply stays at the value
  // its last tween left it at.

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    // Fully static hold: no pin (handled by the reduced-motion CSS), no
    // scroll listener, no beam/glow motion. Land the timeline past every
    // reveal so the ring, header, dividers, and all four summaries render
    // at their resting, fully-visible state in one render.
    tl.time(0.85);
    return;
  }

  function getProgress() {
    const rect = wrapper.getBoundingClientRect();
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max(-rect.top / scrollable, 0), 1);
  }

  function applyProgress() {
    tl.time(getProgress());
  }

  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      applyProgress();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  applyProgress();
}

(function bootstrap() {
  const section = document.getElementById('screen-5-5');
  if (section) initReserveHologram(section);
})();
