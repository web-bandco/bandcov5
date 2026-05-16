/**
 * Navigation Configuration
 *
 * Defines which pages appear in the site navigation and their display order.
 * Astro handles routing via the filesystem — this only controls nav menus.
 */

export interface NavItem {
  label: string;
  href: string;
  order: number;
}

export const navItems: NavItem[] = [
  { label: 'About', href: '/about', order: 1 },
  { label: 'Shop', href: '/shop', order: 2 },
  { label: 'Blog', href: '/blog', order: 3 },
  { label: 'Photography', href: '/photography', order: 4 },
  { label: 'Contact', href: '/contact', order: 5 },
  { label: 'Components', href: '/components', order: 8 },

];

/**
 * Get navigation items sorted by order
 */
export function getNavItems(): NavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order);
}
