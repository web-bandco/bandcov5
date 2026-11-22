import type { ConsentConfig } from '@/lib/consent.types';

const consentConfig: ConsentConfig = {
  /** Bump to force re-consent when categories change */
  version: 2,

  /** 'consent_mode_v2' = scripts load with denied defaults, cookieless pings
   *  'strict' = scripts fully blocked until consent granted */
  mode: 'strict',

  /** localStorage key for stored preferences */
  storageKey: 'velocity-consent',

  categories: {
    necessary: {
      label: 'Necessary',
      description:
        'Remembers your cookie choices and your light or dark mode setting. These are saved only in your browser and cannot be turned off.',
      required: true,
      defaultEnabled: true,
      gcmTypes: ['security_storage'],
    },
    analytics: {
      label: 'Analytics',
      description: 'Google Analytics counts visits and shows how pages are used. It loads only if you accept.',
      required: false,
      defaultEnabled: false,
      // No advert category: the site has no adverts, and GA4 has Google signals and ads personalisation off
      gcmTypes: ['analytics_storage'],
    },
  },

  ui: {
    heading: 'Cookie preferences',
    description:
      'With your permission, we use Google Analytics cookies to understand how visitors use this site. We do not show adverts.',
    acceptAll: 'Accept all',
    declineAll: 'Decline all',
    customize: 'Customise',
    savePreferences: 'Save preferences',
    settingsHeading: 'Cookie settings',
    alwaysOnLabel: 'Always on',
    privacyPolicyLabel: 'Privacy Policy',
  },

  /** Milliseconds before banner slides in */
  showDelay: 500,
};

export default consentConfig;
