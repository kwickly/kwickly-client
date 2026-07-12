import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. swamys.kwickly.app, swamys.com)
  const hostname = req.headers
    .get('host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'kwickly.app'}`);

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // If running locally or on the main domain, don't rewrite if no subdomain
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'kwickly.app';
  if (
    hostname === 'localhost:3000' ||
    hostname === rootDomain ||
    hostname === `www.${rootDomain}`
  ) {
    // Let the standard /app/page.tsx handle the landing page
    return NextResponse.next();
  }

  // Handle subdomain (e.g. swamys.kwickly.app)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const tenantSlug = hostname.replace(`.${rootDomain}`, '');
    return NextResponse.rewrite(new URL(`/${tenantSlug}${path}`, req.url));
  }

  // Handle custom domain (e.g. swamys.com)
  // For now, we mock the custom domain mapping. In production, 
  // you would query this mapping from Redis or the API.
  const customDomainMap: Record<string, string> = {
    'swamys.com': 'swamys',
  };

  const mappedSlug = customDomainMap[hostname];
  if (mappedSlug) {
    return NextResponse.rewrite(new URL(`/${mappedSlug}${path}`, req.url));
  }

  // Fallback if domain is not recognized
  return NextResponse.next();
}
