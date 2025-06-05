// Utility to check if a color is too light for white text
export function isColorTooLight(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  // Expand short form (e.g. #abc)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  // Parse r, g, b
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  // Perceived luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 180; // threshold for white text
}
