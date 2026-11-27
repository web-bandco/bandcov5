/**
 * Continuous loop for a CSS scroll-snap row (home hero, photo carousels,
 * lightboxes, the product photo row on a phone).
 *
 * It adds a hidden copy of the last slide before the first, and of the first
 * slide after the last. The row always moves in the direction asked. To leave a
 * copy, the row moves by the width of all the real slides at once: the copy and
 * the real slide look the same, so the move cannot be seen, even mid-animation.
 * Copies are not headings and cannot be reached by screen readers or Tab.
 *
 * - Arrow buttons and keys: snap is off while the row animates, so a press during
 *   an animation continues from where the row is (no jump to a slide).
 * - Swipe and trackpad: the row leaves a copy only when it has stopped and no
 *   finger is on it, so the browser's own scrolling is never interrupted.
 *
 *   const row = loop(track, { onChange: (index) => ... });
 *   row.go(1); row.jump(3); row.index();
 */
export interface Loop {
  /** Move by a number of slides (-1 = previous, 1 = next) */
  go(step: number): void;
  /** Show a slide at once, with no animation (index from 0) */
  jump(index: number): void;
  /** The real slide shown now (index from 0) */
  index(): number;
}

interface Options {
  /** Called when a different real slide shows (index from 0) */
  onChange?: (index: number) => void;
  /** 'center' for a row with snap-center slides */
  align?: 'start' | 'center';
  /** Classes for the copies, for example to hide them where the row is a grid */
  copyClass?: string;
}

export function loop(track: HTMLElement, { onChange, align = 'start', copyClass }: Options = {}): Loop {
  const slides = [...track.children] as HTMLElement[];
  const count = slides.length;
  if (count < 2) return { go: () => {}, jump: () => {}, index: () => 0 };

  const copy = (slide: HTMLElement) => {
    const clone = slide.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('h1, h2, h3').forEach((h) => {
      const p = document.createElement('p');
      p.className = h.className;
      p.innerHTML = h.innerHTML;
      h.replaceWith(p);
    });
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    if (copyClass) clone.classList.add(...copyClass.split(' '));
    return clone;
  };
  track.prepend(copy(slides[count - 1]));
  track.append(copy(slides[0]));
  const all = [...track.children] as HTMLElement[];

  // Positions in the row: 0 = copy of the last slide, 1..count = real slides, count + 1 = copy of the first.
  let position = 1; // the slide nearest to the view
  let target = 1; // where the arrows are taking the row (quick presses add up)
  let animating = false; // an arrow animation is running (snap is off)
  let touching = false; // a finger is on the row
  let stall = 0; // timer: an arrow animation that stopped part way
  const real = (p: number) => (p - 1 + count) % count;
  const smooth: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';

  // The scroll position that shows slide p
  const left = (p: number, row = track.getBoundingClientRect()) => {
    const slide = all[p].getBoundingClientRect();
    const offset = track.scrollLeft + slide.left - row.left;
    return align === 'center' ? offset - (track.clientWidth - slide.width) / 2 : offset;
  };
  const instant = (x: number) => track.scrollTo({ left: x, behavior: 'instant' });
  const width = () => left(2) - left(1); // one slide and its gap
  const at = () => 1 + (track.scrollLeft - left(1)) / (width() || 1); // position with a fraction, e.g. 3.6
  const nearest = () => {
    const row = track.getBoundingClientRect();
    const distance = (p: number) => Math.abs(left(p, row) - track.scrollLeft);
    let best = 0;
    for (let p = 1; p < all.length; p++) if (distance(p) < distance(best)) best = p;
    return best;
  };
  const snap = (on: boolean) => {
    track.style.scrollSnapType = on ? '' : 'none';
  };
  // Move by all the real slides (1 = forward). A copy and its real slide look the same.
  const wrap = (direction: 1 | -1) => instant(track.scrollLeft + direction * count * width());

  // Arrow animation: scroll towards the target. A target past a copy waits at the copy.
  const aim = () => track.scrollTo({ left: left(Math.max(0, Math.min(count + 1, target))), behavior: smooth });
  // When the row reaches the last (or first) real slide on its way past it, move by all
  // the slides, so that the next slides are ahead (cannot be seen). True if it moved.
  const rebase = () => {
    const now = at();
    if (target > count && now >= count) {
      wrap(-1);
      target -= count;
      return true;
    }
    if (target < 1 && now <= 1) {
      wrap(1);
      target += count;
      return true;
    }
    return false;
  };

  // When the row has stopped: leave a copy, and turn snap back on
  const settle = () => {
    if (touching || !track.clientWidth) return;
    if (animating && rebase()) aim(); // more presses are waiting (if none, the row is already there)
    const p = at();
    const goal = left(Math.max(0, Math.min(count + 1, target)));
    if (animating && Math.abs(track.scrollLeft - goal) > 2) {
      // Still on the way: Chrome also sends scrollend when an animation is replaced. If the
      // row has really stopped short (the animation was cancelled), accept where it is.
      const x = track.scrollLeft;
      clearTimeout(stall);
      stall = window.setTimeout(() => {
        if (animating && track.scrollLeft === x) {
          animating = false;
          settle();
        }
      }, 100);
      return;
    }
    animating = false;
    let n = Math.round(p);
    if (n <= 0) {
      wrap(1);
      n += count;
    } else if (n >= count + 1) {
      wrap(-1);
      n -= count;
    }
    target = n; // the scroll event sets `position` (and calls onChange if the slide changed)
    snap(true);
  };

  // 'scrollend' waits for the finger to lift and the snap to finish. A short wait after the
  // last movement or finger lift is also needed: when a finger is still down as the row stops
  // on an end copy (fast swipes), 'scrollend' has already fired, and at the end of the row no
  // more scrolling (so no new 'scrollend') can happen. Browsers without 'scrollend' use only the wait.
  // The wait acts only on a row that rests on a slide: between two slides, the browser's snap
  // has still to move it (its scroll events start the wait again).
  let timer = 0;
  const rest = () => {
    const p = at();
    if (animating || Math.abs(p - Math.round(p)) < 0.02) settle();
  };
  const later = () => {
    clearTimeout(timer);
    timer = window.setTimeout(rest, 150);
  };
  track.addEventListener('scrollend', settle);

  track.addEventListener(
    'scroll',
    () => {
      if (!track.clientWidth) return; // hidden (a closed lightbox)
      const p = nearest();
      const changed = real(p) !== real(position);
      position = p;
      if (changed) onChange?.(real(p));
      if (animating && (target > count + 1 || target < 0) && rebase()) aim(); // quick presses past a copy
      later();
    },
    { passive: true },
  );

  // A finger, trackpad or mouse wheel on the row takes over from an arrow animation
  const stopArrows = () => {
    if (!animating) return;
    animating = false;
    snap(true);
  };
  track.addEventListener(
    'touchstart',
    () => {
      touching = true;
      stopArrows();
    },
    { passive: true },
  );
  track.addEventListener('wheel', stopArrows, { passive: true });

  const lift = () => {
    touching = false;
    later();
  };
  track.addEventListener('touchend', lift, { passive: true });
  track.addEventListener('touchcancel', lift, { passive: true });

  // Keep the slide in place when the width changes (not when a phone's address bar moves)
  let rowWidth = track.clientWidth;
  window.addEventListener('resize', () => {
    if (track.clientWidth === rowWidth) return;
    rowWidth = track.clientWidth;
    stopArrows();
    if (rowWidth) instant(left(position));
  });

  instant(left(1));

  return {
    go(step) {
      clearTimeout(timer);
      clearTimeout(stall);
      const now = at();
      if (!animating) target = Math.round(now);
      animating = true;
      snap(false);
      // Every press counts (at most two full turns ahead of the row)
      target = Math.max(Math.floor(now) - 2 * count, Math.min(Math.ceil(now) + 2 * count, target + step));
      rebase();
      aim();
      if (smooth === 'instant') settle();
    },
    jump(index) {
      clearTimeout(timer);
      clearTimeout(stall);
      animating = false;
      snap(true);
      position = target = index + 1;
      instant(left(position));
    },
    index: () => real(position),
  };
}
