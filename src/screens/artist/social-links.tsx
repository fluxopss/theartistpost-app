import { ListGroup, ListRow } from "@/components/list-row";
import { openExternal } from "@/utils/links";

/** The link fields the API passes through, in the order the web lists them. */
const LABELS: Record<string, string> = {
  website: "Website",
  instagram: "Instagram",
  twitter: "Twitter",
  behance: "Behance",
};
const ORDER = Object.keys(LABELS);

function labelFor(key: string) {
  return LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/** "instagram.com/name" — the address without its scheme or trailing slash. */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/** Where else the artist lives online. Each opens in the in-app browser. */
export function SocialLinks({ links }: { links: Record<string, string> | null }) {
  const entries = Object.entries(links ?? {})
    .filter(([, url]) => /^https?:\/\//i.test(url))
    .sort(([a], [b]) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      return (ia === -1 ? ORDER.length : ia) - (ib === -1 ? ORDER.length : ib);
    });
  if (entries.length === 0) return null;

  return (
    <ListGroup header="Elsewhere">
      {entries.map(([key, url], index) => (
        <ListRow
          key={key}
          title={labelFor(key)}
          subtitle={displayUrl(url)}
          accessibilityHint="Opens in the browser"
          onPress={() => void openExternal(url)}
          external
          separator={index < entries.length - 1}
        />
      ))}
    </ListGroup>
  );
}
