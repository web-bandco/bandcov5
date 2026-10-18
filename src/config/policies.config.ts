/**
 * Policy Hub Configuration
 *
 * Single source of truth for the site's policies. Used by the About page
 * Policy Hub, each policy page (via PolicyLayout) and the footer.
 * Routes live in src/pages/about/ — keep `href` in sync with the filename.
 */

export interface Policy {
  id: 'terms' | 'privacy' | 'ai';
  title: string;
  href: string;
  icon: string;
  /** One-line summary for cards and meta descriptions */
  description: string;
  version: string;
  /** ISO dates (YYYY-MM-DD) */
  published: string;
  updated: string;
  /** Drafts show a review notice and are hidden from search engines */
  draft?: boolean;
}

export const policies: Policy[] = [
  {
    id: 'terms',
    title: 'Terms and Conditions',
    href: '/about/terms',
    icon: 'file-text',
    description: 'The rules for using the Brighton and Co site and its content.',
    version: '1.1.0',
    published: '2026-06-20',
    updated: '2026-10-17',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    href: '/about/privacy',
    icon: 'shield',
    description: 'What information is collected when you visit, why, and your rights over it.',
    version: '1.0.0',
    published: '2026-10-17',
    updated: '2026-10-17',
    draft: false,
  },
  {
    id: 'ai',
    title: 'AI Policy',
    href: '/about/ai',
    icon: 'sparkles',
    description: 'How AI is (and is not) used on this site, and the rules for AI use of its content.',
    version: '1.0.0',
    published: '2026-10-17',
    updated: '2026-10-17',
    draft: false,
  },
];

export function getPolicy(id: Policy['id']): Policy {
  return policies.find((p) => p.id === id)!;
}

/** Formats an ISO date as DD/MM/YYYY */
export function formatPolicyDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { timeZone: 'UTC' });
}
