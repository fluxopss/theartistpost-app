import { ListGroup, ListRow } from "@/components/list-row";
import type { InvolveDoorLink } from "@/content/involve";

import { doorLinkIcon, openDoorLink } from "./door-links";

/** A door's own links (agreement, schedule, email) as one grouped list. */
export function DoorLinkGroup({
  links,
  footer,
}: {
  links: readonly InvolveDoorLink[];
  footer?: string;
}) {
  return (
    <ListGroup footer={footer}>
      {links.map((link, i) => (
        <ListRow
          key={link.href}
          icon={doorLinkIcon(link)}
          title={link.label}
          external={link.external}
          onPress={() => openDoorLink(link)}
          separator={i < links.length - 1}
        />
      ))}
    </ListGroup>
  );
}
