import { SITE_URL, GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION } from 'astro:env/server';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    region: string;
    zip: string;
    country: string;
  };
  socialLinks: string[];
  twitter?: {
    site: string;
    creator: string;
  };
  verification?: {
    google?: string;
    bing?: string;
  };
  /**
   * Branding configuration
   * Logo files: Replace SVGs in src/assets/branding/
   * Favicon: Replace in public/favicon.svg
   */
  branding: {
    /** Logo alt text for accessibility */
    logo: {
      alt: string;
    };
    /** Favicon path (lives in public/) */
    favicon: {
      svg: string;
    };
    /** Theme colors for manifest and browser UI */
    colors: {
      /** Browser toolbar color (hex) */
      themeColor: string;
      /** PWA splash screen background (hex) */
      backgroundColor: string;
    };
  };
}

const siteConfig: SiteConfig = {
  name: 'B&Co',
  description: 'Brighton and Co - the personal website of Harry Brighton',
  url: SITE_URL || 'https://new.brightonandco.co.uk',
  ogImage: '/og-default.png',
  author: 'Harry B',
  // Demo contact info - replace with your actual business details
  email: 'contact@web.bandco.uk',
  phone: '',
  address: {
    street: '',
    city: '',
    region: 'Yorkshire',
    zip: '',
    country: 'United Kingdom',
  },
  socialLinks: [
    'https://github.com/web-bandco',
    'https://www.vinted.co.uk/member/272494517',
    'https://www.linkedin.com/in/harry-brighton-8a2b971a4/',
    'https://www.ebay.co.uk/usr/itsharryb',
    'https://instagram.com/ItsHarryB_',
  ],
  // Twitter metadata - update with your actual handles or remove
  // twitter: {
  //   site: '@yourhandle',
  //   creator: '@yourhandle',
  // },
  twitter: {
    site: '@ItsHarryB_',
    creator: '@ItsHarryB_',
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    bing: BING_SITE_VERIFICATION,
  },
  // Branding: Logo files live in src/assets/branding/
  // Replace the SVG files there with your own branding
  branding: {
    logo: {
      alt: 'Brighton and Co',
    },
    favicon: {
      svg: '/bncofavicon-light.png',
    },
    colors: {
      themeColor: '#009ec2',
      backgroundColor: '#ffffff',
    },
  },
};

export default siteConfig;
