/**
 * Utility to convert hex colors to OKLCH coordinate strings.
 * Converted values comply with Tailwind CSS v4's custom color variable format.
 */
export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0.03, g: 0.04, b: 0.90 }; // default indigo-like fallback
}

export function rgbToOklch(r: number, g: number, b: number) {
  // sRGB linear-to-non-linear
  const fn = (c: number) => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  const lR = fn(r);
  const lG = fn(g);
  const lB = fn(b);

  // Cone response (LMS)
  const l = 0.4122214708 * lR + 0.5363325363 * lG + 0.0514459929 * lB;
  const m = 0.2119034982 * lR + 0.6806995451 * lG + 0.1073969566 * lB;
  const s = 0.0883024619 * lR + 0.2817188376 * lG + 0.6299787005 * lB;

  // Non-linear response
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // OKLCH coordinates
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let h = Math.atan2(b_, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L, C, h };
}

export function hexToOklchString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { L, C, h } = rgbToOklch(r, g, b);
  return `${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)}`;
}
