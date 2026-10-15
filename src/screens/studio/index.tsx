import { router } from "expo-router";

import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";

import { AccountBlock } from "./account-block";
import { HouseDestinations } from "./house-destinations";
import { IdentityCard } from "./identity-card";
import { ProfileBlock } from "./profile-block";
import { ReachTheHouse } from "./reach-the-house";
import { RoadmapList } from "./roadmap-list";
import { StudioFooter } from "./studio-footer";
import { VisitBlock } from "./visit-block";

/**
 * The You tab: your community profile, pass / identity, compose when approved, the live room,
 * every other room in the house, and how to reach it.
 */
export function StudioScreen() {
  return (
    <ScreenScroll>
      <ProfileBlock />
      <IdentityCard />
      <AccountBlock />
      <VisitBlock />
      <HouseDestinations />
      <ReachTheHouse />
      <RoadmapList />
      {__DEV__ ? (
        <ListGroup header="Development">
          <ListRow
            icon="sparkle"
            title="Styleguide"
            subtitle="Tokens and components"
            onPress={() => router.push("/styleguide")}
            separator={false}
          />
        </ListGroup>
      ) : null}
      <StudioFooter />
    </ScreenScroll>
  );
}
