/**
 * Policy content helpers
 *
 * Build the HTML strings rendered inside the policy sections (PolicyLayout),
 * matching the clause formatting used by the Terms and Conditions.
 */

export interface PolicySection {
  id: string;
  tocLabel: string;
  title: string;
  content: string[];
  defaultOpen?: boolean;
}

/** Numbered clause, e.g. clause('1.1', 'Text') */
export const clause = (num: string, html: string) =>
  `<strong class='text-foreground font-semibold'>${num}</strong> ${html}`;

/** Indented sub-clause, e.g. subclause('1.1.1', 'Text') */
export const subclause = (num: string, html: string) =>
  `<div class='ml-6 md:ml-8 flex items-start gap-2'><strong class='text-foreground font-semibold shrink-0'>${num}</strong> <span>${html}</span></div>`;

/** Internal link */
export const link = (href: string, text: string) =>
  `<a href='${href}' class='text-accent font-medium hover:underline'>${text}</a>`;

/** Button that reopens the cookie consent settings (the footer script handles every [data-cookie-settings]) */
export const cookieSettingsButton = () =>
  `<button type='button' data-cookie-settings class='text-accent font-medium hover:underline cursor-pointer'>Cookie Preferences</button>`;

/** External link: opens in a new tab and shows its domain on hover */
export const externalLink = (href: string, text: string) => {
  const domain = new URL(href).hostname.replace('www.', '');
  return `<a href='${href}' target='_blank' rel='noopener noreferrer' class='group relative inline-flex items-center gap-1 text-accent font-medium hover:underline'>${text}<span class='sr-only'> (opens in a new tab)</span><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='opacity-60 relative top-[1px]' aria-hidden='true'><path d='M15 3h6v6'/><path d='M10 14 21 3'/><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/></svg><span aria-hidden='true' class='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:md:block w-auto whitespace-nowrap p-3 bg-background border border-border shadow-md rounded-xl z-50 text-sm text-foreground font-normal cursor-default pointer-events-none'>Opens an external site: <strong class='text-foreground font-semibold'>${domain}</strong></span></a>`;
};
