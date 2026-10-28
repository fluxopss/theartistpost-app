import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import {
  useAdminEvent,
  useAdminEvents,
  useCreateAdminEvent,
  useUpdateAdminEvent,
  useUploadEventCover,
} from "@/api/hooks";
import { Button } from "@/components/button";
import { FilterChips } from "@/components/filter-chips";
import { ModalBar } from "@/components/modal-bar";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import {
  emptyEventForm,
  type EventFormValues,
  formFromAdminEvent,
  parseEventForm,
  supportsSponsors,
  whenPreview,
} from "@/domain/events/event-form";
import { eventMediumOptions, isEventMedium, type LaneOption } from "@/domain/events/lanes";
import { radius, screenMargin, spacing, useBrandColors } from "@/theme";
import { pickImageForUpload, type PickedImage } from "@/utils/pick-image";

import { SponsorFields } from "./sponsor-fields";
import { VendorEditor } from "./vendor-editor";

const COVER_MAX_SIDE = 1600;
const LOGO_MAX_SIDE = 600;

/** Server field keys that live under a different name in this form. */
const SERVER_FIELD: Record<string, string> = { startsAt: "startTime", endsAt: "endTime" };

/** `vendors.N.x` from the server indexes the list sent (blank rows skipped); point it at the form row. */
function formFieldKey(key: string, vendorRows: number[]): string {
  const match = /^vendors\.(\d+)\.(.+)$/.exec(key);
  if (match) {
    const row = vendorRows[Number(match[1])];
    return row === undefined ? "vendors" : `vendors.${row}.${match[2]}`;
  }
  return SERVER_FIELD[key] ?? key;
}

/** Create or edit a night. Times are house time (Eastern); the server does the zone math. */
export function EventFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const palette = useBrandColors();
  const existing = useAdminEvent(id ?? "", Boolean(id));
  // A new night: the manage list (usually cached) shows whether the server has sponsor fields yet.
  const list = useAdminEvents(!id);

  if (id && !existing.data) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <ModalBar title="Edit night" />
        <View style={{ padding: screenMargin, gap: spacing.md }}>
          {existing.error ? (
            <ThemedText variant="body" tone="danger" accessibilityRole="alert">
              Couldn’t load that night. Close this and try again.
            </ThemedText>
          ) : (
            <Skeleton height={160} rounded={radius.md} />
          )}
        </View>
      </View>
    );
  }

  const sample = existing.data?.event ?? list.data?.items[0];
  const sponsorsReady = sample ? supportsSponsors(sample) : true;

  return (
    <EventForm
      id={id}
      initial={existing.data ? formFromAdminEvent(existing.data.event) : emptyEventForm()}
      sponsorsReady={sponsorsReady}
    />
  );
}

function EventForm({ id, initial, sponsorsReady }: { id?: string; initial: EventFormValues; sponsorsReady: boolean }) {
  const editing = Boolean(id);
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();
  const create = useCreateAdminEvent();
  const update = useUpdateAdminEvent(id ?? "");
  const upload = useUploadEventCover();

  const [values, setValues] = useState<EventFormValues>(initial);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [logo, setLogo] = useState<PickedImage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: Exclude<keyof EventFormValues, "vendors">) =>
    (text: string) =>
      setValues((prev) => ({ ...prev, [key]: text }));
  // An older night may carry a free-text medium; keep it selectable so saving doesn't change it.
  const mediumOptions = useMemo<LaneOption[]>(
    () =>
      initial.medium && !isEventMedium(initial.medium)
        ? [{ id: initial.medium, label: initial.medium }, ...eventMediumOptions]
        : [...eventMediumOptions],
    [initial.medium],
  );
  const preview = useMemo(() => whenPreview(values), [values]);
  const busy = create.isPending || update.isPending || upload.isPending;

  const choosePhoto = async () => {
    try {
      const picked = await pickImageForUpload({ maxSide: COVER_MAX_SIDE });
      if (picked) setPhoto(picked);
    } catch {
      Alert.alert("Couldn’t use that photo", "Try a different one.");
    }
  };

  const chooseLogo = async () => {
    try {
      const picked = await pickImageForUpload({ maxSide: LOGO_MAX_SIDE });
      if (picked) setLogo(picked);
    } catch {
      Alert.alert("Couldn’t use that logo", "Try a different image.");
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setValues((prev) => ({ ...prev, sponsorLogoUrl: "" }));
  };

  const save = async () => {
    const parsed = parseEventForm(values, editing ? initial : undefined, { pendingLogo: Boolean(logo) });
    if (!parsed.ok) {
      setFieldErrors(parsed.fields);
      setError("Check the highlighted fields.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setFieldErrors({});
    setError(null);
    try {
      const body = { ...parsed.payload };
      if (photo) body.coverImageUrl = (await upload.mutateAsync(photo)).url;
      // The logo goes through the same upload as the cover; the server only accepts its own upload URLs.
      if (logo) body.sponsorLogoUrl = (await upload.mutateAsync(logo)).url;
      const result = editing ? await update.mutateAsync(body) : await create.mutateAsync(body);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (editing) router.back();
      else router.replace({ pathname: "/manage-event/[id]", params: { id: result.event.id } });
    } catch (cause) {
      if (isApiError(cause)) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(cause.fields ?? {}).map(([key, message]) => [formFieldKey(key, parsed.vendorRows), message]),
          ),
        );
        setError(cause.message);
      } else {
        setError("Couldn’t save the night. Try again in a moment.");
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ModalBar title={editing ? "Edit night" : "New night"} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={spacing.xl}
        contentContainerStyle={{
          padding: screenMargin,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
      >
        <TextField label="Title" value={values.title} onChangeText={set("title")} maxLength={120} error={fieldErrors.title} />

        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="subheadline">Lane</ThemedText>
          <FilterChips label="Lane" options={mediumOptions} value={values.medium} onChange={set("medium")} />
          {fieldErrors.medium ? (
            <ThemedText variant="footnote" tone="danger" accessibilityRole="alert">
              {fieldErrors.medium}
            </ThemedText>
          ) : (
            <ThemedText variant="footnote" tone="muted">
              Where the night shows when people filter the schedule.
            </ThemedText>
          )}
        </View>

        <TextField
          label="Date"
          value={values.date}
          onChangeText={set("date")}
          placeholder="2026-10-30"
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
          maxLength={10}
          error={fieldErrors.date}
        />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Starts"
              value={values.startTime}
              onChangeText={set("startTime")}
              placeholder="6:00 PM"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              error={fieldErrors.startTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Ends"
              value={values.endTime}
              onChangeText={set("endTime")}
              placeholder="9:00 PM"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              error={fieldErrors.endTime}
            />
          </View>
        </View>
        {preview ? (
          <ThemedText variant="footnote" tone="muted" accessibilityLiveRegion="polite">
            {preview}
          </ThemedText>
        ) : null}

        <TextField
          label="Venue"
          value={values.venueName}
          onChangeText={set("venueName")}
          placeholder="Hacienda"
          maxLength={120}
          error={fieldErrors.venueName}
        />
        <TextField
          label="Address (optional)"
          value={values.venueAddress}
          onChangeText={set("venueAddress")}
          placeholder="522 Clematis St, West Palm Beach, FL"
          maxLength={200}
          error={fieldErrors.venueAddress}
        />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Latitude"
              value={values.latitude}
              onChangeText={set("latitude")}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              error={fieldErrors.latitude}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Longitude"
              value={values.longitude}
              onChangeText={set("longitude")}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              error={fieldErrors.longitude}
            />
          </View>
        </View>
        <ThemedText variant="footnote" tone="muted">
          Optional. With a venue point, “I’m here” can confirm people are within about 300 m of the door. Without one,
          check-ins are recorded without location.
        </ThemedText>

        <TextField
          label="Seats (optional)"
          value={values.capacity}
          onChangeText={set("capacity")}
          keyboardType="number-pad"
          maxLength={4}
          helper="Leave empty for no limit. Extra answers join a waitlist."
          error={fieldErrors.capacity}
        />

        <TextField
          label="About this night (optional)"
          value={values.description}
          onChangeText={set("description")}
          multiline
          maxLength={2000}
          showCount
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />

        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="subheadline">Cover photo (optional)</ThemedText>
          {photo || values.coverImageUrl ? (
            <Image
              source={photo?.uri ?? values.coverImageUrl}
              contentFit="cover"
              accessibilityLabel="Cover photo preview"
              style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: radius.md }}
            />
          ) : null}
          <Button
            title={photo || values.coverImageUrl ? "Choose a different photo" : "Choose a photo"}
            variant="secondary"
            icon="photo"
            disabled={busy}
            onPress={() => void choosePhoto()}
          />
        </View>

        {sponsorsReady ? (
          <>
            <SponsorFields
              name={values.sponsorName}
              url={values.sponsorUrl}
              logoUri={logo?.uri ?? (values.sponsorLogoUrl || null)}
              onName={set("sponsorName")}
              onUrl={set("sponsorUrl")}
              onChooseLogo={() => void chooseLogo()}
              onRemoveLogo={removeLogo}
              errors={fieldErrors}
              disabled={busy}
            />
            <VendorEditor
              rows={values.vendors}
              onChange={(vendors) => setValues((prev) => ({ ...prev, vendors }))}
              errors={fieldErrors}
              disabled={busy}
            />
          </>
        ) : (
          <ThemedText variant="footnote" tone="muted">
            “Presented by” and food & vendors can be added here once the house’s next update is live.
          </ThemedText>
        )}

        {error ? (
          <ThemedText variant="footnote" tone="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        ) : null}

        <Button
          title={editing ? "Save changes" : "Save as draft"}
          tone="coral"
          size="lg"
          loading={busy}
          onPress={() => void save()}
        />
        {!editing ? (
          <ThemedText variant="footnote" tone="muted">
            Drafts aren’t public. You publish from the night’s page.
          </ThemedText>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}
