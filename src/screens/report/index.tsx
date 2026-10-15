import { Stack, router, useLocalSearchParams } from "expo-router";
import { AccessibilityInfo, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

import { isApiError } from "@/api/errors";
import { useReport } from "@/api/hooks";
import type { ReportReason, ReportTargetType } from "@/api/types";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ListGroup } from "@/components/list-row";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { EmptyState } from "@/components/empty-state";
import { REPORT_NOTE_MAX, REPORT_REASONS } from "@/domain/safety/reasons";
import { radius, screenMargin, spacing, useBrandColors } from "@/theme";

export const REPORT_THANKS = "Thanks — the house team reviews reports within 24 hours.";

const TARGET_TYPES: readonly ReportTargetType[] = ["POST", "COMMENT", "COMMUNITY_POST", "USER"];

/** Report a post, Wall note, community post or person. Reason is required. */
export function ReportScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const type = TARGET_TYPES.find((t) => t === params.type);
  const id = typeof params.id === "string" ? params.id : "";
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();
  const report = useReport();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const ios = process.env.EXPO_OS === "ios";

  const sheetStyle = {
    backgroundColor: ios ? "transparent" : palette.bgElevated,
    paddingHorizontal: screenMargin,
    paddingTop: spacing.xl,
    paddingBottom: insets.bottom + spacing.lg,
    gap: spacing.lg,
  };

  if (!type || !id) {
    return (
      <View style={sheetStyle}>
        <Stack.Screen options={{ title: "Report" }} />
        <EmptyState icon="flag" title="Nothing to report" body="This item can’t be reported from here." />
      </View>
    );
  }

  const submit = async () => {
    if (!reason) return;
    setError(null);
    try {
      await report.mutateAsync({
        targetType: type,
        targetId: id,
        reason,
        note: note.trim() || undefined,
      });
      setSent(true);
      AccessibilityInfo.announceForAccessibility(REPORT_THANKS);
    } catch (cause) {
      setError(isApiError(cause) ? cause.message : "Could not send that report. Try again.");
    }
  };

  return (
    <View style={sheetStyle}>
      <Stack.Screen options={{ title: "Report" }} />
      {sent ? (
        <>
          <Icon name="checkCircle" size={36} color={palette.success} />
          <ThemedText variant="title2" accessibilityRole="header">
            Report sent
          </ThemedText>
          <ThemedText variant="callout" tone="muted">
            {REPORT_THANKS}
          </ThemedText>
          <Button title="Done" onPress={() => router.back()} />
        </>
      ) : (
        <>
          <View style={{ gap: spacing.xxs }}>
            <ThemedText variant="title2" accessibilityRole="header">
              Report this
            </ThemedText>
            <ThemedText variant="footnote" tone="muted">
              Tell the house what’s wrong. The house team reads every report.
            </ThemedText>
          </View>

          <ListGroup header="What’s wrong?">
            {REPORT_REASONS.map((option, index) => {
              const checked = reason === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked }}
                  onPress={() => setReason(option.id)}
                  style={({ pressed }) => ({
                    minHeight: 52,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingHorizontal: spacing.md,
                    backgroundColor: pressed ? palette.bgPressed : "transparent",
                  })}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: spacing.sm,
                      borderBottomWidth: index < REPORT_REASONS.length - 1 ? 0.5 : 0,
                      borderBottomColor: palette.separator,
                      alignSelf: "stretch",
                    }}
                  >
                    <ThemedText variant="body" style={{ flex: 1 }}>
                      {option.label}
                    </ThemedText>
                    {checked ? <Icon name="check" size={20} color={palette.accentText} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ListGroup>

          <TextField
            label="Anything else? (optional)"
            value={note}
            onChangeText={setNote}
            maxLength={REPORT_NOTE_MAX}
            showCount
            multiline
            textAlignVertical="top"
            style={{ minHeight: 80, borderRadius: radius.md }}
            error={error}
            editable={!report.isPending}
          />

          <Button
            title={report.isPending ? "Sending…" : "Send report"}
            disabled={!reason || report.isPending}
            loading={report.isPending}
            onPress={() => void submit()}
          />
        </>
      )}
    </View>
  );
}
