export async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;



  const targetUrl = `https://api.shorebird.dev${pathname}${search}`;

  try {
    const headers = new Headers(request.headers);
    // Remove headers that might cause issues with the upstream
    headers.delete('host');
    // headers.delete('cf-connecting-ip'); // Cloudflare specific, maybe keep? usually fine to keep.

    console.log(`Proxying to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow'
    });

    console.log(`Response status: ${response.status}`);

    const responseHeaders = new Headers(response.headers);

    // Clean up hop-by-hop headers
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');
    responseHeaders.delete('keep-alive');
    responseHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Failed to fetch:', error);
    return new Response('Internal Server Error\n' + error?.stack, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
