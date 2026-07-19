/**
 * Helper to extract tenant slug from HTTP Host header or window location.
 * Filters out base platform domains to return null for the platform landing page.
 */
export function getTenantSlug(host: string): string | null {
  if (!host) return null;

  // Remove port numbers if present
  const cleanHost = host.split(':')[0].toLowerCase();

  // If host is the root domain, return null (renders SaaS marketing homepage)
  const platformDomains = [
    'localhost',
    'kwickly.in',
    'kwickly.com',
    'kwickly-client.vercel.app',
    'kwickly-admin-web.vercel.app',
  ];

  if (platformDomains.includes(cleanHost)) {
    return null;
  }

  // Parse subdomains
  const parts = cleanHost.split('.');

  // e.g. "swamy.localhost" -> parts = ["swamy", "localhost"]
  // e.g. "punjabi-chuska.kwickly.in" -> parts = ["punjabi-chuska", "kwickly", "in"]
  if (parts.length > 1) {
    // If the last part is a platform domain (like in kwickly.in), the first part is the tenant slug
    const firstSubdomain = parts[0];
    if (platformDomains.includes(firstSubdomain)) {
      return null;
    }
    return firstSubdomain;
  }

  return null;
}
