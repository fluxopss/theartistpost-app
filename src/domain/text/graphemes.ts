/**
 * Character counting the way a person counts: an emoji, a skin-toned hand, a
 * flag or a ZWJ family is ONE character, not 2-11 UTF-16 code units. Hermes has
 * no reliable Intl.Segmenter, so this walks code points and joins the usual
 * extenders. It is deliberately a touch lenient so the app never rejects text
 * the server (which uses a full segmenter) would accept.
 */

const ZWJ = 0x200d;

function isRegionalIndicator(cp: number): boolean {
  return cp >= 0x1f1e6 && cp <= 0x1f1ff;
}

/** Marks, variation selectors, skin tones, keycap/enclosing marks and tags. */
function isExtender(cp: number): boolean {
  return (
    (cp >= 0x0300 && cp <= 0x036f) ||
    (cp >= 0x1ab0 && cp <= 0x1aff) ||
    (cp >= 0x1dc0 && cp <= 0x1dff) ||
    (cp >= 0x20d0 && cp <= 0x20ff) ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0xfe20 && cp <= 0xfe2f) ||
    cp === 0x200c ||
    (cp >= 0x1f3fb && cp <= 0x1f3ff) ||
    (cp >= 0xe0020 && cp <= 0xe007f) ||
    (cp >= 0xe0100 && cp <= 0xe01ef)
  );
}

/** Split into user-perceived characters. */
export function graphemes(text: string): string[] {
  const points = Array.from(text);
  const out: string[] = [];
  let i = 0;
  while (i < points.length) {
    let cluster = points[i]!;
    const first = cluster.codePointAt(0)!;
    i += 1;

    if (first === 0x0d && points[i] === "\n") {
      cluster += points[i]!;
      i += 1;
    } else if (isRegionalIndicator(first) && i < points.length && isRegionalIndicator(points[i]!.codePointAt(0)!)) {
      cluster += points[i]!;
      i += 1;
    }

    while (i < points.length) {
      const next = points[i]!.codePointAt(0)!;
      if (isExtender(next)) {
        cluster += points[i]!;
        i += 1;
      } else if (next === ZWJ) {
        cluster += points[i]!;
        i += 1;
        if (i < points.length) {
          cluster += points[i]!;
          i += 1;
        }
      } else {
        break;
      }
    }
    out.push(cluster);
  }
  return out;
}

export function graphemeCount(text: string): number {
  return graphemes(text).length;
}

/** First `max` characters; never cuts an emoji in half. */
export function truncateGraphemes(text: string, max: number): string {
  const parts = graphemes(text);
  return parts.length <= max ? text : parts.slice(0, max).join("");
}

/**
 * Native `maxLength` ceiling (UTF-16 units) for a field limited to `max`
 * characters. TextInput's own `maxLength` counts code units, so using `max`
 * there would stop people at ~250 emoji. Generous enough for 12 units per
 * character (a ZWJ family is 11) while still stopping combining-mark floods.
 */
export function nativeMaxLength(max: number): number {
  return max * 12;
}
