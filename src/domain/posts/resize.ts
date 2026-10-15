/**
 * How to shrink an image so its longer side is at most `max` pixels.
 * Returns the single dimension to pass to the image manipulator (the other
 * follows the aspect ratio), or null when the image already fits.
 */
export function resizeToFit(
  width: number,
  height: number,
  max: number,
): { width: number } | { height: number } | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  if (Math.max(width, height) <= max) return null;
  return width >= height ? { width: max } : { height: max };
}
