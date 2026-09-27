import { ListGroup, ListRow } from "@/components/list-row";
import type { LegalContact } from "@/content/legal";
import { site } from "@/content/site";
import { contact } from "@/utils/links";

/** The page's mailto / tel / maps anchors as real actions at the end of the document. */
export function LegalContactGroup({ kinds }: { kinds: LegalContact[] }) {
  if (kinds.length === 0) return null;

  return (
    <ListGroup header="Contact">
      {kinds.map((kind, index) => {
        const separator = index < kinds.length - 1;
        switch (kind) {
          case "email":
            return (
              <ListRow
                key={kind}
                icon="email"
                title="Email Robbie"
                subtitle={site.email}
                onPress={() => contact.email()}
                external
                separator={separator}
              />
            );
          case "call":
            return (
              <ListRow
                key={kind}
                icon="phone"
                title="Call"
                value={site.phone}
                onPress={contact.call}
                external
                separator={separator}
              />
            );
          case "directions":
            return (
              <ListRow
                key={kind}
                icon="directions"
                title="Get directions"
                subtitle={site.address.full}
                onPress={contact.directions}
                external
                separator={separator}
              />
            );
          default: {
            const unknown: never = kind;
            return unknown;
          }
        }
      })}
    </ListGroup>
  );
}
