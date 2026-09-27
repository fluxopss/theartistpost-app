/**
 * boxShadow strings. Only stage props (stickers, ticket, logo, floating
 * surfaces) cast shadows — lists and rows group with background, not shadow.
 * The scheme-aware card shadow lives in the brand palette (`shadowCard`).
 */
export const shadows = {
  sticker: "0 8px 18px rgba(6, 20, 34, 0.18)",
  hairline: "0 1px 2px rgba(2, 11, 26, 0.18)",
  glow: "0 0 24px rgba(46, 196, 182, 0.28)",
  ticket: "0 18px 40px rgba(2, 11, 26, 0.35)",
} as const;
