/**
 * Photos fade in as they load, instead of appearing suddenly. Only lazy images
 * that have not loaded yet fade, so nothing already on screen flickers. Images
 * added later (carousels, galleries) are picked up as well.
 *
 * The fade itself is in global.css (img[data-fade]). Without JavaScript the
 * images show as normal.
 */

function prepare(img: HTMLImageElement) {
  if (img.dataset.fade !== undefined || img.complete || img.loading !== 'lazy') return;
  img.dataset.fade = 'out';
  const show = () => { img.dataset.fade = 'in'; };
  img.addEventListener('load', show, { once: true });
  img.addEventListener('error', show, { once: true });
}

const LAZY = 'img[loading="lazy"]';
let observer: MutationObserver | undefined;

export function initImageFade() {
  document.querySelectorAll<HTMLImageElement>(LAZY).forEach(prepare);

  // Each page change swaps the body, so watch the new one
  observer?.disconnect();
  observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLImageElement) prepare(node);
        else if (node instanceof Element) node.querySelectorAll<HTMLImageElement>(LAZY).forEach(prepare);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
