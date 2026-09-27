import { router } from "expo-router";

import { ListGroup, ListRow } from "@/components/list-row";
import { history } from "@/content/history";
import { useSaves } from "@/storage/saves";

/**
 * Every room in the house that isn't a tab. Row details follow the web
 * `moreMenu` descriptions (theartistpost@f604e5f:src/content/site.ts).
 */
export function HouseDestinations() {
  const { count } = useSaves();

  return (
    <ListGroup header="In the house">
      <ListRow
        icon="ticket"
        title="The next night"
        subtitle="Hold a seat and carry a pass"
        onPress={() => router.push("/night")}
      />
      <ListRow
        icon="door"
        title="Get Involved"
        subtitle="Showcase, partner, volunteer, give"
        onPress={() => router.push("/get-involved")}
      />
      <ListRow icon="info" title="About" subtitle="Mission & nonprofit" onPress={() => router.push("/about")} />
      <ListRow icon="history" title="History" subtitle={history.kicker} onPress={() => router.push("/history")} />
      <ListRow
        icon="people"
        title="Supporters"
        subtitle="Chapters nationwide"
        onPress={() => router.push("/supporters")}
      />
      <ListRow
        icon="bookmark"
        title="Saved"
        subtitle="Works and nights you kept"
        value={count > 0 ? String(count) : undefined}
        accessibilityHint={count > 0 ? `${count} saved on this phone` : "Nothing saved yet"}
        onPress={() => router.push("/saved")}
      />
      <ListRow
        icon="settings"
        title="Settings"
        subtitle="Theme, studio, data"
        onPress={() => router.push("/settings")}
        separator={false}
      />
    </ListGroup>
  );
}
