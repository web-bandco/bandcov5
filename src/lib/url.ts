/**
 * Clean path for the current page: no ".html", "/index" or trailing slash.
 * Pages are built as files (about.html) and served at clean URLs (/about),
 * but during the build Astro.url.pathname includes the ".html".
 */
export function cleanPath(url: URL): string {
  const path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '');
  return path || '/';
}
