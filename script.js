(() => {
  const video = document.getElementById('scrub-video');
  const wrapper = document.querySelector('.chapters-wrapper');

  let videoDuration = 0;
  let videoReady = false;
  let latestProgress = 0;

  // ── Text block timecoding (global_reserve_timecoding.md) ──
  // Each block's words fade/slide in over CROSSFADE seconds (staggered,
  // bottom-to-top), optionally hold, then — except the last block —
  // fade/slide out over CROSSFADE seconds before the next block's
  // window begins.
  const CROSSFADE = 0.5;
  const WORD_IN_Y = 40;   // px, fade-in starts this far below rest position
  const WORD_OUT_Y = -30; // px, fade-out ends this far above rest position
  const WORD_DURATION_RATIO = 0.6; // fraction of CROSSFADE each word's own tween takes

  const pageLoadTime = performance.now() / 1000;

  function splitTextIntoWords(el) {
    const text = el.textContent;
    el.innerHTML = text
      .split(/(\s+)/)
      .map(chunk => (chunk.trim() ? `<span class="word">${chunk}</span>` : chunk))
      .join('');
    return Array.from(el.querySelectorAll('.word'));
  }

  const textBlocks = [
    { el: document.getElementById('text-block-1'), start: 0.0, end: 2.0 },
    { el: document.getElementById('text-block-2'), start: 2.0, end: 5.0 },
  ]
    .filter(b => b.el)
    .map(b => ({ ...b, words: splitTextIntoWords(b.el.querySelector('p')) }));

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  // power3.out-style ease: fast start, gentle settle.
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // power2.in-style ease: gentle start, fast finish.
  function easeInQuad(x) {
    return x * x;
  }

  // Words are staggered evenly across the window, each animating over
  // its own slice, so the first word starts exactly at the window's
  // start and the last word finishes exactly at the window's end.
  function wordTiming(count) {
    const wordDuration = CROSSFADE * WORD_DURATION_RATIO;
    const spread = CROSSFADE - wordDuration;
    const perWordDelay = count > 1 ? spread / (count - 1) : 0;
    return { wordDuration, perWordDelay };
  }

  function applyBlock(block, t, isLast) {
    const { words, start, end } = block;
    if (!words.length) return;

    const fadeInStart = start;
    const fadeInEnd = start + CROSSFADE;
    const fadeOutStart = isLast ? Infinity : end - CROSSFADE;
    const fadeOutEnd = end;
    const inTiming = wordTiming(words.length);
    const outTiming = wordTiming(words.length);

    words.forEach((word, i) => {
      let opacity;
      let y;

      if (t <= fadeInStart) {
        opacity = 0;
        y = WORD_IN_Y;
      } else if (t < fadeInEnd) {
        const localStart = fadeInStart + i * inTiming.perWordDelay;
        const eased = easeOutCubic(clamp((t - localStart) / inTiming.wordDuration, 0, 1));
        opacity = eased;
        y = WORD_IN_Y * (1 - eased);
      } else if (!isLast && t > fadeOutStart) {
        const localStart = fadeOutStart + i * outTiming.perWordDelay;
        const eased = easeInQuad(clamp((t - localStart) / outTiming.wordDuration, 0, 1));
        opacity = 1 - eased;
        y = WORD_OUT_Y * eased;
      } else {
        opacity = 1;
        y = 0;
      }

      word.style.opacity = opacity;
      word.style.transform = `translateY(${y}px)`;
    });
  }

  function updateTextBlocks(currentTime) {
    // The very first block must start appearing as soon as the page loads,
    // even before the user scrolls — so its effective time is whichever is
    // further along: real time elapsed since load, or scroll-driven time.
    const elapsedSinceLoad = clamp(performance.now() / 1000 - pageLoadTime, 0, CROSSFADE);

    textBlocks.forEach((block, i) => {
      const isFirst = i === 0;
      const isLast = i === textBlocks.length - 1;
      const t = isFirst ? Math.max(currentTime, elapsedSinceLoad) : currentTime;
      applyBlock(block, t, isLast);
    });
  }

  // ── Load video as blob ──
  // Fetching the entire file into memory guarantees it's fully buffered
  // before scrubbing starts. preload="auto" is just a hint that browsers
  // often ignore for large files.

  fetch('video5.mp4')
    .then(r => r.blob())
    .then(blob => {
      video.src = URL.createObjectURL(blob);
    });

  video.addEventListener('loadedmetadata', () => {
    videoDuration = video.duration;
    videoReady = true;
    update();
  });

  // ── Scroll progress (0–1) ──
  // Maps how far you've scrolled through the 700vh wrapper.

  function getProgress() {
    const rect = wrapper.getBoundingClientRect();
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max(-rect.top / scrollable, 0), 1);
  }

  // ── Scroll loop ──

  let ticking = false;

  function update() {
    const progress = getProgress();
    latestProgress = progress;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  // ── Video scrub loop ──
  // Runs independently of the scroll handler, on every animation frame.
  // Only issues a new seek once the previous one has finished (!video.seeking) —
  // requesting currentTime faster than the browser can seek just queues up
  // and causes visible jitter, so this always seeks toward the latest
  // scroll progress rather than replaying every intermediate value.

  function videoLoop() {
    // Text timing runs even before the video's metadata has loaded (target
    // is simply 0 until then), so the first block can start appearing
    // immediately on page load rather than waiting on the blob fetch.
    const target = videoReady ? latestProgress * videoDuration : 0;
    if (videoReady && !video.seeking && Math.abs(video.currentTime - target) > 1 / 24) {
      video.currentTime = target;
    }
    updateTextBlocks(target);
    requestAnimationFrame(videoLoop);
  }
  requestAnimationFrame(videoLoop);
})();
