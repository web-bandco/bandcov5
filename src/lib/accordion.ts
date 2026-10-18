/**
 * Smooth open and close for <details> accordions (the Accordion component and the
 * product page). Without JavaScript the details elements still work - they just
 * open and close at once. This script animates the height between the two states.
 *
 * Mark each item with data-accordion-item. The chevron (.accordion-icon) and the
 * content fade are styled in global.css; data-state lets the chevron turn as soon as
 * an item starts to close (the open attribute only goes when the animation ends).
 */

const DURATION = 300;
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const running = new WeakMap<HTMLDetailsElement, Animation>();

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Height of the item with only its summary showing */
function closedHeight(details: HTMLDetailsElement) {
  const summary = details.querySelector<HTMLElement>(':scope > summary');
  const style = getComputedStyle(details);
  const frame = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'] as const;
  return (summary?.offsetHeight ?? 0) + frame.reduce((sum, key) => sum + parseFloat(style[key]), 0);
}

function animateTo(details: HTMLDetailsElement, open: boolean): Animation | undefined {
  details.dataset.state = open ? 'open' : 'closed';

  // Start from the current height, even part-way through an earlier animation
  const start = details.getBoundingClientRect().height;
  running.get(details)?.cancel();
  if (open) details.open = true;
  const end = open ? details.getBoundingClientRect().height : closedHeight(details);

  details.style.overflow = 'hidden';
  const animation = details.animate({ height: [`${start}px`, `${end}px`] }, { duration: DURATION, easing: EASING });
  running.set(details, animation);
  animation.onfinish = () => {
    running.delete(details);
    details.style.overflow = '';
    if (!open) details.open = false;
  };
  return animation;
}

function toggle(details: HTMLDetailsElement) {
  const open = details.dataset.state ? details.dataset.state !== 'open' : !details.open;

  if (reduceMotion()) {
    details.open = open;
    return;
  }

  // Exclusive groups share a name, and the browser closes the other items at once.
  // Take the name off the group while the items animate, then put it back.
  const name = details.getAttribute('name');
  if (!open || !name) {
    animateTo(details, open);
    return;
  }

  const group = [...document.querySelectorAll<HTMLDetailsElement>(`details[name="${CSS.escape(name)}"]`)];
  group.forEach((item) => item.removeAttribute('name'));
  const animations = group
    .filter((item) => item !== details && item.open && item.dataset.state !== 'closed')
    .map((item) => animateTo(item, false));
  animations.push(animateTo(details, true));
  // The finished promise settles before the finish event, so close the items that
  // animated shut first. Otherwise the browser would close the newly opened item
  // when the shared name comes back.
  Promise.allSettled(animations.map((animation) => animation?.finished)).then(() => {
    group.forEach((item) => {
      if (item.dataset.state === 'closed') item.open = false;
      item.setAttribute('name', name);
    });
  });
}

export function initAccordions() {
  document.querySelectorAll<HTMLDetailsElement>('details[data-accordion-item]').forEach((details) => {
    if (details.dataset.accordionReady) return;
    details.dataset.accordionReady = 'true';
    details.dataset.state = details.open ? 'open' : 'closed';

    details.querySelector(':scope > summary')?.addEventListener('click', (event) => {
      event.preventDefault();
      toggle(details);
    });

    // Keep the state in step when something else opens or closes the item
    // (a link to a policy section, find in page, or another item in the group)
    details.addEventListener('toggle', () => {
      if (!running.has(details)) details.dataset.state = details.open ? 'open' : 'closed';
    });
  });
}
