import { router } from "expo-router";
import { View } from "react-native";

import { displayHandle, useAuth } from "@/auth";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { appCopy } from "@/content/site";
import { useStudio } from "@/storage/studio";
import {
  radius,
  spacing,
  spark,
  stageGlow,
  stageLine,
  stageNavy,
  stageSurface,
  stageText,
} from "@/theme";

/** Diameter of the studio monogram. */
const MONOGRAM = 56;

function gateCopy(kind: ReturnType<typeof useAuth>["gate"]["kind"]): { kicker: string; body: string } {
  switch (kind) {
    case "guest":
      return { kicker: appCopy.studioKicker, body: appCopy.guestLine };
    case "member":
      return { kicker: "Member pass", body: appCopy.sessionMemberLine };
    case "artist_pending":
      return { kicker: "Studio pending", body: appCopy.sessionArtistLine };
    case "artist":
      return { kicker: "Approved studio", body: "You can put work on The Wall from this phone." };
    case "admin":
      return { kicker: "House admin", body: "Full studio access on this device." };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/**
 * The studio nameplate — lit in the house's always-night palette.
 * Prefer the signed-in session when present; otherwise the on-device guest card.
 */
export function IdentityCard() {
  const { studio, isGuest } = useStudio();
  const { user, gate, canCompose, status } = useAuth();
  const copy = gateCopy(gate.kind);

  const displayName = user?.name ?? studio.displayName;
  const handle = displayHandle(user);
  const subtitle = handle ? `@${handle}` : user?.email ? user.email : studio.city;
  const initial = displayName.trim().charAt(0).toUpperCase();
  const summary = [copy.kicker, displayName, subtitle].filter(Boolean).join(". ");

  return (
    <View
      style={{
        backgroundColor: stageNavy,
        experimental_backgroundImage: stageGlow,
        borderRadius: radius.xl,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: stageLine,
        overflow: "hidden",
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: MONOGRAM,
            height: MONOGRAM,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: stageLine,
            backgroundColor: stageSurface,
          }}
        >
          {!user && (isGuest || !initial) ? (
            <Icon name="studio" size={28} color={stageText} />
          ) : (
            <ThemedText variant="title1" maxFontSizeMultiplier={1} style={{ color: spark.teal }}>
              {initial || "·"}
            </ThemedText>
          )}
        </View>
        {user ? (
          <Button
            title="Settings"
            variant="onStage"
            icon="settings"
            accessibilityLabel="Open settings"
            onPress={() => router.push("/settings")}
          />
        ) : (
          <Button
            title="Edit"
            variant="onStage"
            icon="pencil"
            accessibilityLabel="Edit studio"
            accessibilityHint="Opens Settings"
            onPress={() => router.push("/settings")}
          />
        )}
      </View>

      <View accessible accessibilityLabel={summary} style={{ gap: spacing.xxs }}>
        <ThemedText variant="eyebrow" style={{ color: spark.coral }}>
          {status === "loading" ? "Restoring pass…" : copy.kicker}
        </ThemedText>
        <ThemedText variant="title1" tone="onStage" selectable>
          {displayName}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="subheadline" tone="onStageMuted" selectable>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <ThemedText variant="footnote" tone="onStageMuted">
        {copy.body}
      </ThemedText>

      <View style={{ gap: spacing.sm }}>
        {!user ? (
          <Button title="Join the house" tone="coral" onPress={() => router.push("/join")} />
        ) : null}
        {canCompose ? (
          <Button title="New piece" tone="teal" icon="plus" onPress={() => router.push("/compose-studio")} />
        ) : null}
        {gate.kind === "artist_pending" ? (
          <Button title="View join status" variant="onStage" onPress={() => router.push("/join")} />
        ) : null}
        {user && !canCompose && gate.kind === "member" ? (
          <Button title="Request artist studio" variant="onStage" onPress={() => router.push("/join")} />
        ) : null}
      </View>
    </View>
  );
}
