/**
 * track(): sends one Google Analytics 4 event, only with analytics consent.
 *
 * Velocity's track() (src/lib/analytics.ts) sends the event, and does nothing unless
 * GA4 is set up (PUBLIC_GA_MEASUREMENT_ID). It does not check consent, so this
 * wrapper does: the consent scripts (Velocity's Analytics and ConsentBanner) set
 * window.__consentState. In 'strict' mode GA4 loads only after "Accept"; an event
 * sent before then would stay in dataLayer and go to Google after a later "Accept".
 *
 * Use it in a component <script>: import { track } from '@/components/site/track';
 */
import { track as send } from '@/lib/analytics';

type ConsentWindow = Window & {
  __consentState?: { decided: boolean; categories: Record<string, boolean> };
};

export function track(name: string, params: Record<string, string | number> = {}) {
  if (!(window as ConsentWindow).__consentState?.categories.analytics) return;
  send(name, params);
}
