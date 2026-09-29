import { ListGroup, ListRow } from "@/components/list-row";
import { links, site } from "@/content/site";
import { contact, openExternal } from "@/utils/links";

/** "@the_artist_post" — read off the profile URL so the two never drift. */
const instagramHandle = `@${links.social.instagram.split("/").filter(Boolean).pop()}`;

/** Every way to reach Robbie and the house from outside the app. */
export function ReachTheHouse() {
  return (
    <ListGroup header="Reach the house">
      <ListRow
        icon="email"
        title="Email Robbie"
        subtitle={site.email}
        onPress={() => contact.email()}
        external
      />
      <ListRow
        // No Instagram glyph in the icon vocabulary yet; the camera stands in.
        icon="photo"
        title="Instagram"
        subtitle={instagramHandle}
        onPress={() => void openExternal(links.social.instagram)}
        external
      />
      <ListRow
        // No merch/bag glyph yet; Kindness Always wears the sparkle.
        icon="kindness"
        title="Buy merch"
        subtitle="Kindness Always on Bonfire"
        onPress={contact.merch}
        external
      />
      <ListRow
        icon="donate"
        title="Donate"
        subtitle="Support the house"
        accessibilityHint="Opens the donate screen"
        onPress={contact.donate}
        separator={false}
      />
    </ListGroup>
  );
}
