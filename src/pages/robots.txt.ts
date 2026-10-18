import type { APIRoute } from 'astro';

/**
 * AI crawlers blocked from the whole site, in line with the AI Policy (/about/ai).
 * Blocking these does not affect normal search engines (Google, Bing, etc.).
 */
const aiCrawlers = [
  // OpenAI
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  // Google (Gemini training - does not affect Google Search)
  'Google-Extended',
  // Apple (Apple Intelligence training - does not affect Siri/Spotlight search)
  'Applebot-Extended',
  // Meta
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Others
  'Amazonbot',
  'Bytespider',
  'CCBot',
  'cohere-ai',
  'cohere-training-data-crawler',
  'DuckAssistBot',
  'MistralAI-User',
  'AI2Bot',
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
  'Timpibot',
  'YouBot',
  'Webzio-Extended',
];

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://brightonandco.co.uk';

  const robotsTxt = `
User-agent: *
Allow: /

# Block API routes
Disallow: /api/

# Block AI crawlers - see ${siteUrl}about/ai
${aiCrawlers.map((bot) => `User-agent: ${bot}`).join('\n')}
Disallow: /

Sitemap: ${siteUrl}sitemap-index.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
