import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { ListGroup, ListRow } from "@/components/list-row";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { doorById, type InvolveDoor } from "@/content/involve";
import { giveActions, volunteerMissions, whatThisFunds } from "@/content/participate";
import { copy, site } from "@/content/site";
import { spacing } from "@/theme";
import { contact, followHref, tabRoutes } from "@/utils/links";

import { DoorLinkGroup } from "./door-link-group";
import { NumberedList } from "@/components/numbered-list";
import { PartnerPackages } from "./partner-packages";

function doorLinks(door: InvolveDoor) {
  return door.secondary ? [door.primary, door.secondary] : [door.primary];
}

/** The one primary move on a door that collects an inquiry. */
function InquiryButton({ door }: { door: InvolveDoor }) {
  return (
    <Button
      title={copy.involve.formTitle}
      tone={door.spark}
      size="lg"
      accessibilityHint="Opens a short form Robbie reads"
      onPress={() => router.push({ pathname: "/inquiry", params: { intent: door.id } })}
    />
  );
}

/**
 * Everything below the door's story: its actions and the extras only that
 * door carries. Each door reads in the order its invitation promises.
 */
export function DoorWorld({ door }: { door: InvolveDoor }) {
  const eyebrowTone = `spark-${door.spark}` as const;

  switch (door.id) {
    case "space":
      return (
        <View style={{ gap: spacing.md }}>
          <InquiryButton door={door} />
          <DoorLinkGroup links={doorLinks(door)} footer={copy.involve.spaceAfter} />
        </View>
      );

    case "partner":
      return (
        <>
          <View style={{ gap: spacing.md }}>
            <InquiryButton door={door} />
            <DoorLinkGroup links={doorLinks(door)} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <SectionHeader eyebrow={door.kicker} eyebrowTone={eyebrowTone} title="Ways to open a door" />
            <PartnerPackages tone={door.spark} />
          </View>
        </>
      );

    case "support":
      return (
        <>
          <View style={{ gap: spacing.sm }}>
            <SectionHeader eyebrow={door.kicker} eyebrowTone={eyebrowTone} title="What a gift funds" />
            <NumberedList items={whatThisFunds} tone={door.spark} />
          </View>
          <View style={{ gap: spacing.sm }}>
            {giveActions.map((action) =>
              action.id === "paypal" ? (
                <Button
                  key={action.id}
                  title={action.label}
                  icon="donate"
                  tone={door.spark}
                  size="lg"
                  onPress={contact.donate}
                />
              ) : (
                <Button
                  key={action.id}
                  title={action.label}
                  icon="kindness"
                  variant="secondary"
                  size="lg"
                  onPress={() => followHref(action.href)}
                />
              ),
            )}
            <View style={{ gap: spacing.xxs, paddingTop: spacing.xxs }}>
              <ThemedText variant="footnote" tone="muted" selectable style={{ textAlign: "center" }}>
                Venmo {site.venmo}
              </ThemedText>
              <ThemedText variant="footnote" tone="muted" selectable style={{ textAlign: "center" }}>
                {site.nonprofitLine} EIN {site.ein}.
              </ThemedText>
            </View>
          </View>
        </>
      );

    case "volunteer":
      return (
        <>
          <View style={{ gap: spacing.sm }}>
            <SectionHeader eyebrow={door.kicker} eyebrowTone={eyebrowTone} title="Pick a mission" />
            <NumberedList items={volunteerMissions} tone={door.spark} />
          </View>
          <View style={{ gap: spacing.md }}>
            <InquiryButton door={door} />
            <DoorLinkGroup links={doorLinks(door)} />
          </View>
        </>
      );

    case "events": {
      const space = doorById("space");
      return (
        <>
          <View style={{ gap: spacing.sm }}>
            <Button
              title={door.primary.label}
              icon="ticket"
              tone={door.spark}
              size="lg"
              onPress={() => followHref(door.primary.href)}
            />
            {door.secondary ? (
              <Button
                title={door.secondary.label}
                icon="schedule"
                variant="secondary"
                size="lg"
                onPress={() => router.navigate(tabRoutes.schedule)}
              />
            ) : null}
          </View>
          <ListGroup header={copy.schedule.ready}>
            <ListRow
              icon="door"
              title={space.title}
              subtitle={space.summary}
              separator={false}
              onPress={() => router.push({ pathname: "/get-involved/[door]", params: { door: space.id } })}
            />
          </ListGroup>
        </>
      );
    }

    default: {
      const exhaustive: never = door.id;
      return exhaustive;
    }
  }
}
