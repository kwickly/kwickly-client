/**
 * Image optimization utilities for Kwickly storefront.
 *
 * Provides:
 *  - shimmer SVG blur placeholder (LQIP) — prevents layout shift and
 *    gives a professional skeleton-like loading effect while the image loads
 *  - toBase64 helper for converting SVG to a data URL
 *  - getCategoryFallbackUrl — canonical food image URLs keyed by category
 */

/* ─── Shimmer placeholder ────────────────────────────────────────────── */

/**
 * Generates an animated shimmer SVG scaled to the given dimensions.
 * Uses a soft warm gradient to match food imagery tones.
 */
function shimmer(w: number, h: number): string {
  return `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3ede4" offset="20%" />
      <stop stop-color="#ede3d6" offset="50%" />
      <stop stop-color="#f3ede4" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3ede4" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)">
    <animate attributeName="x" from="-${w}" to="${w}" dur="1.4s"
             repeatCount="indefinite" />
  </rect>
</svg>`;
}

function toBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use Buffer
    return Buffer.from(str).toString('base64');
  }
  // Client-side: use btoa
  return window.btoa(str);
}

/**
 * A data URL containing a warm shimmer animation.
 * Pass this as `blurDataURL` to Next.js `<Image placeholder="blur">`.
 */
export const blurDataURL = (w = 100, h = 100): string =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

/** Pre-computed 100×100 blur data URL — safe to use as a module constant */
export const FOOD_BLUR_PLACEHOLDER = blurDataURL(100, 100);

/* ─── Category fallback images ──────────────────────────────────────── */

/**
 * Returns the best-matching Unsplash food photo URL for a category name.
 * All URLs include `auto=format&fit=crop` — required by the Unsplash CDN
 * to serve images (without it many photo IDs return 404).
 * Next.js <Image> will further re-encode to AVIF/WebP via the optimisation pipeline.
 */
export function getCategoryFallbackUrl(categoryName: string): string {
  const n = categoryName.toLowerCase();

  if (n.includes('beverage') || n.includes('drink') || n.includes('lassi') ||
      n.includes('chaas') || n.includes('shikanji'))
    return 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=400&q=75';

  if (n.includes('fast food') || n.includes('pav') || n.includes('bhaji') ||
      n.includes('sandwich') || n.includes('roll') || n.includes('burger'))
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=75';

  if (n.includes('starter') || n.includes('tikka') || n.includes('kebab') ||
      n.includes('pakoda') || n.includes('kurkure'))
    return 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=75';

  if (n.includes('paneer') || n.includes('shahi') || n.includes('malai') ||
      n.includes('curry') || n.includes('masala'))
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=75';

  if (n.includes('dal') || n.includes('lentil'))
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=75';

  if (n.includes('rice') || n.includes('chawal') || n.includes('biryani') ||
      n.includes('pulao'))
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=75';

  if (n.includes('roti') || n.includes('naan') || n.includes('kulcha') ||
      n.includes('paratha') || n.includes('bread'))
    return 'https://images.unsplash.com/photo-1619894991209-9f9694be045a?auto=format&fit=crop&w=400&q=75';

  if (n.includes('combo') || n.includes('meal') || n.includes('thali') ||
      n.includes('plate'))
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=75';

  if (n.includes('dessert') || n.includes('sweet') || n.includes('mithai') ||
      n.includes('jamun'))
    return 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=75';

  // Generic food fallback
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=75';
}

