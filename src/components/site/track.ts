/**
 * track(): sends one Google Analytics 4 event.
 *
 * It sends nothing unless GA4 is set up (PUBLIC_GA_MEASUREMENT_ID) and the visitor
 * accepted analytics in the cookie banner. The consent scripts (Velocity's
 * Analytics and ConsentBanner) set window.__consentState. In 'strict' mode GA4
 * loads only after "Accept", and it reads the queued events from dataLayer.
 *
 * Use it in a component <script>: import { track } from '@/components/site/track';
 */
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  __consentState?: { decided: boolean; categories: Record<string, boolean> };
};

export function track(name: string, params: Record<string, string | number> = {}) {
  const w = window as AnalyticsWindow;
  if (!document.getElementById('analytics-data') || !w.__consentState?.categories.analytics) return;
  const layer = (w.dataLayer ??= []);
  // GA4 reads an Arguments object from dataLayer (as gtag() does), not a plain array
  (function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params -- GA4 requires the Arguments object
    layer.push(arguments);
  })('event', name, params);
}
