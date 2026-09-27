import Constants from "expo-constants";
import { router } from "expo-router";

import { ListGroup, ListRow } from "@/components/list-row";
import type { LegalDocId } from "@/content/legal";

const openLegal = (doc: LegalDocId) => router.push({ pathname: "/legal/[doc]", params: { doc } });

/** The build, and the house's legal and help pages. */
export function AboutAppGroup() {
  const version = Constants.expoConfig?.version;

  return (
    <ListGroup header="About this app">
      {version ? <ListRow title="Version" value={version} /> : null}
      <ListRow title="Privacy" onPress={() => openLegal("privacy")} />
      <ListRow title="Terms" onPress={() => openLegal("terms")} />
      <ListRow title="Support" onPress={() => openLegal("support")} separator={false} />
    </ListGroup>
  );
}
