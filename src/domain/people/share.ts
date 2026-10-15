/** The live public site. Shared links never point at a dev API origin. */
const SITE_ORIGIN = "https://theartistpost.fluxlab.agency";

export function profileShareUrl(handle: string): string {
  return `${SITE_ORIGIN}/u/${handle.trim().toLowerCase()}`;
}

export function profileShareMessage(name: string, handle: string): string {
  return `${name} on The Artist Post: ${profileShareUrl(handle)}`;
}
