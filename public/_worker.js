export default {
  async fetch(request, env) {
    // 1. Attempt to fetch the requested URL from your deployed static assets
    let response = await env.ASSETS.fetch(request);

    // 2. If Cloudflare doesn't find the page, it defaults to an empty 404
    if (response.status === 404) {
      // 3. Explicitly construct the path to your compiled 404.html file
      const url = new URL(request.url);
      url.pathname = '/404.html';
      
      // 4. Fetch the 404.html file from your static assets
      const custom404 = await env.ASSETS.fetch(url);
      
      // 5. Serve your beautiful custom HTML while maintaining the correct 404 SEO status
      if (custom404.status === 200) {
        return new Response(custom404.body, {
          status: 404,
          headers: custom404.headers,
        });
      }
    }

    // Return all normal, working pages untouched
    return response;
  }
};