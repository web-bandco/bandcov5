/**
 * Continuous loop for a CSS scroll-snap row (home hero, photo carousels,
 * lightboxes, the product photo row on a phone).
 *
 * It adds a hidden copy of the last slide before the first, and of the first
 * slide after the last. The row always moves in the direction asked; when it
 * stops on a copy, it jumps (no animation) to the real slide the copy shows.
 * Copies are not headings and cannot be reached by screen readers or Tab.
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
  // `target` is where the last button press goes, so quick presses add up.
  let position = 1;
  let target = 1;
  const real = (p: number) => (p - 1 + count) % count;
  const smooth: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';

  // The scroll position that shows slide p
  const left = (p: number, row = track.getBoundingClientRect()) => {
    const slide = all[p].getBoundingClientRect();
    const offset = track.scrollLeft + slide.left - row.left;
    return align === 'center' ? offset - (track.clientWidth - slide.width) / 2 : offset;
  };
  const scrollTo = (p: number, behavior: ScrollBehavior) => track.scrollTo({ left: left(p), behavior });
  const nearest = () => {
    const row = track.getBoundingClientRect();
    const distance = (p: number) => Math.abs(left(p, row) - track.scrollLeft);
    let best = 0;
    for (let p = 1; p < all.length; p++) if (distance(p) < distance(best)) best = p;
    return best;
  };

  const leaveCopy = () => {
    const p = position === 0 ? count : position === count + 1 ? 1 : position;
    if (p !== position) {
      position = p;
      scrollTo(p, 'instant');
    }
    return p;
  };

  let settle = 0;
  track.addEventListener('scroll', () => {
    if (!track.clientWidth) return; // hidden (a closed lightbox)
    const p = nearest();
    const changed = real(p) !== real(position);
    position = p;
    if (changed) onChange?.(real(p));
    clearTimeout(settle);
    settle = window.setTimeout(() => { target = leaveCopy(); }, 120);
  }, { passive: true });

  // Keep the slide in place when the width changes (not when a phone's address bar moves)
  let width = track.clientWidth;
  window.addEventListener('resize', () => {
    if (track.clientWidth === width) return;
    width = track.clientWidth;
    if (width) scrollTo(position, 'instant');
  });

  scrollTo(1, 'instant');

  return {
    go(step) {
      clearTimeout(settle); // a wait from the last movement must not reset the new target
      if (target === position) target = leaveCopy();
      target = Math.max(0, Math.min(count + 1, target + step));
      scrollTo(target, smooth);
    },
    jump(index) {
      position = target = index + 1;
      scrollTo(position, 'instant');
    },
    index: () => real(position),
  };
}
