import { router, Stack } from "expo-router";
import { Alert, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useActOnReport, useAdminReports, useMe } from "@/api/hooks";
import type { ReportAction, ReportDTO, ReportTargetType } from "@/api/types";
import { useAuth } from "@/auth";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { reportReasonLabel } from "@/domain/safety/reasons";
import { moderationActionsFor } from "@/domain/admin/moderation-actions";
import { radius, spacing, useBrandColors } from "@/theme";

const TARGET_LABEL: Record<ReportTargetType, string> = {
  POST: "Work",
  COMMENT: "Wall note",
  COMMUNITY_POST: "Community post",
  USER: "Person",
};

const BUTTON_LABEL: Record<ReportAction, string> = {
  hide: "Hide",
  dismiss: "Dismiss",
  suspend_user: "Suspend",
};

const BUTTON_VARIANT: Record<ReportAction, "secondary" | "ghost" | "destructive"> = {
  hide: "secondary",
  dismiss: "ghost",
  suspend_user: "destructive",
};

const CONFIRM: Record<ReportAction, { title: string; body: string; button: string }> = {
  hide: {
    title: "Hide this?",
    body: "It stops showing to everyone else. The reports stay open until you dismiss them.",
    button: "Hide",
  },
  dismiss: {
    title: "Dismiss these reports?",
    body: "Nothing is removed. The reports are closed.",
    button: "Dismiss",
  },
  suspend_user: {
    title: "Suspend this account?",
    body: "They can still read and delete their account, but can’t post, comment or like.",
    button: "Suspend",
  },
};

/** Admin-only: open reports, grouped by target. Admins only; everyone else sees an honest note. */
export function ModerationScreen() {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  return (
    <>
      <Stack.Screen options={{ title: "Moderation" }} />
      <ScreenScroll>
        {!user ? (
          <EmptyState icon="flag" title="Sign in to continue" body="The moderation queue is for house admins." />
        ) : me.isPending ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={120} rounded={radius.md} />
          </View>
        ) : me.data?.permissions.admin ? (
          <ModerationQueue />
        ) : (
          <EmptyState
            icon="flag"
            title="Not for this pass"
            body="The moderation queue is for house admins. Reports you send still reach the house team."
          />
        )}
        <ThemedText variant="footnote" tone="muted">
          Reports are reviewed within 24 hours.
        </ThemedText>
      </ScreenScroll>
    </>
  );
}

function ModerationQueue() {
  const query = useAdminReports("OPEN");
  const act = useActOnReport();
  const items: ReportDTO[] | undefined = query.data?.pages.flatMap((page) => page.items);

  const run = (report: ReportDTO, action: ReportAction) => {
    const copy = CONFIRM[action];
    Alert.alert(copy.title, copy.body, [
      { text: "Cancel", style: "cancel" },
      {
        text: copy.button,
        style: action === "hide" || action === "suspend_user" ? "destructive" : "default",
        onPress: () => {
          act.mutate(
            { id: report.id, action },
            {
              onError: (cause) =>
                Alert.alert(
                  "Could not complete that",
                  isApiError(cause) ? cause.message : "Try again in a moment.",
                ),
            },
          );
        },
      },
    ]);
  };

  return (
    <AsyncView
      data={items}
      isPending={query.isPending}
      error={query.error}
      onRetry={() => void query.refetch()}
      isRefetching={query.isRefetching}
      isEmpty={(list) => list.length === 0}
      loading={<Skeleton height={120} rounded={radius.md} />}
      empty={
        <EmptyState icon="flag" title="No open reports" body="The house is quiet right now." />
      }
    >
      {(list) => (
        <View style={{ gap: spacing.md }}>
          {list.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              busy={act.isPending}
              onAction={(action) => run(report, action)}
            />
          ))}
        </View>
      )}
    </AsyncView>
  );
}

function ReportCard({
  report,
  busy,
  onAction,
}: {
  report: ReportDTO;
  busy: boolean;
  onAction: (action: ReportAction) => void;
}) {
  const palette = useBrandColors();
  const count = `${report.reportCount} report${report.reportCount === 1 ? "" : "s"}`;
  return (
    <View
      style={{
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: palette.bgElevated,
      }}
    >
      <ThemedText variant="headline">
        {TARGET_LABEL[report.targetType]} · {reportReasonLabel(report.reason)}
      </ThemedText>
      <ThemedText variant="footnote" tone="muted">
        {count} · reported by {report.reporter.name}
        {report.reporter.handle ? ` (@${report.reporter.handle})` : ""}
      </ThemedText>
      {report.preview ? (
        <ThemedText variant="callout" selectable>
          “{report.preview}”
        </ThemedText>
      ) : (
        <ThemedText variant="footnote" tone="muted">
          No preview available.
        </ThemedText>
      )}
      {report.note ? (
        <ThemedText variant="footnote" tone="muted" selectable>
          Reporter’s note: {report.note}
        </ThemedText>
      ) : null}
      {report.owner ? (
        <Button
          title={`See ${report.owner.name}`}
          variant="ghost"
          icon="people"
          accessibilityLabel={`See ${report.owner.name}${report.owner.handle ? `, @${report.owner.handle}` : ""} in People`}
          accessibilityHint="Opens their history and the actions you can take"
          onPress={() => router.push({ pathname: "/manage-person/[id]", params: { id: report.owner?.id ?? "" } })}
        />
      ) : null}
      <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
        {moderationActionsFor(report.targetType).map((action) => (
          <Button
            key={action}
            title={BUTTON_LABEL[action]}
            variant={BUTTON_VARIANT[action]}
            disabled={busy}
            accessibilityLabel={`${BUTTON_LABEL[action]} ${TARGET_LABEL[report.targetType].toLowerCase()}`}
            onPress={() => onAction(action)}
            style={{ flexGrow: 1 }}
          />
        ))}
      </View>
    </View>
  );
}
