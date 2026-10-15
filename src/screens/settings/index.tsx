import { router, Stack } from "expo-router";

import { useMe } from "@/api/hooks";
import { useAuth } from "@/auth";
import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";

import { AboutAppGroup } from "./about-app-group";
import { AccountProfileGroup } from "./account-profile-group";
import { AppearanceGroup } from "./appearance-group";
import { BlockedGroup } from "./blocked-group";
import { DeleteAccountGroup } from "./delete-account-group";
import { DeviceDataGroup } from "./device-data-group";
import { StudioFields } from "./studio-fields";

/**
 * Settings: account pass, on-device studio, appearance, device data, legal.
 */
export function SettingsScreen() {
  const { user, signOut, gate } = useAuth();
  const me = useMe(Boolean(user));
  const isAdmin = me.data?.permissions.admin === true;

  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScreenScroll>
        <ListGroup header="Account">
          {user ? (
            <>
              <ListRow icon="studio" title={user.name} subtitle={user.email} showChevron={false} />
              <ListRow
                icon="info"
                title={
                  gate.kind === "artist_pending"
                    ? "Artist approval pending"
                    : gate.kind === "artist" || gate.kind === "admin"
                      ? "Studio publish open"
                      : "Member pass"
                }
                showChevron={false}
              />
              <ListRow
                icon="close"
                title="Sign out"
                subtitle="Removes the house pass from this phone"
                onPress={() => void signOut()}
                separator={false}
              />
            </>
          ) : (
            <ListRow
              icon="people"
              title="Join the house"
              subtitle="Passwordless member or artist door"
              onPress={() => router.push("/join")}
              separator={false}
            />
          )}
        </ListGroup>
        {isAdmin ? (
          <ListGroup header="Manage the house" footer="Only house admins see this group.">
            <ListRow
              icon="studio"
              title="Artist requests"
              subtitle="Approve artists who want to publish to The Wall"
              onPress={() => router.push("/artist-requests")}
            />
            <ListRow
              icon="schedule"
              title="Manage events"
              subtitle="Create nights, seats, check-ins and attendees"
              onPress={() => router.push("/manage-events")}
            />
            <ListRow
              icon="flag"
              title="Moderation"
              subtitle="Open reports from the community"
              onPress={() => router.push("/moderation")}
              separator={false}
            />
          </ListGroup>
        ) : null}
        <AccountProfileGroup />
        <BlockedGroup />
        <StudioFields />
        <AppearanceGroup />
        <DeviceDataGroup />
        <DeleteAccountGroup />
        <AboutAppGroup />
      </ScreenScroll>
    </>
  );
}
