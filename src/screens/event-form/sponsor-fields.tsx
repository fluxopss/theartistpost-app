import { Image } from "expo-image";
import { View } from "react-native";

import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { SPONSOR_NAME_MAX, SPONSOR_URL_MAX } from "@/domain/events/sponsors";
import { radius, spacing, useBrandColors } from "@/theme";

const LOGO_PREVIEW = 64;

/**
 * "Presented by" on the night. The page says it plainly when a name is set
 * and shows nothing when it is empty. Clearing the name clears the link and
 * logo with it (the server does the same).
 */
export function SponsorFields({
  name,
  url,
  logoUri,
  onName,
  onUrl,
  onChooseLogo,
  onRemoveLogo,
  errors,
  disabled,
}: {
  name: string;
  url: string;
  /** Preview source: a newly picked file, or the saved logo URL. */
  logoUri: string | null;
  onName: (text: string) => void;
  onUrl: (text: string) => void;
  onChooseLogo: () => void;
  onRemoveLogo: () => void;
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const palette = useBrandColors();
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="headline" accessibilityRole="header">
          Presented by (optional)
        </ThemedText>
        <ThemedText variant="footnote" tone="muted">
          If a sponsor is backing this night, the page says “Presented by” with their name. Leave it empty and
          nothing shows.
        </ThemedText>
      </View>
      <TextField
        label="Sponsor name"
        value={name}
        onChangeText={onName}
        maxLength={SPONSOR_NAME_MAX}
        editable={!disabled}
        error={errors.sponsorName}
      />
      <TextField
        label="Sponsor link (optional)"
        value={url}
        onChangeText={onUrl}
        placeholder="https://"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={SPONSOR_URL_MAX}
        editable={!disabled}
        error={errors.sponsorUrl}
      />
      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="subheadline">Sponsor logo (optional)</ThemedText>
        {logoUri ? (
          <Image
            source={logoUri}
            contentFit="contain"
            accessibilityLabel="Sponsor logo preview"
            style={{
              width: LOGO_PREVIEW,
              height: LOGO_PREVIEW,
              borderRadius: radius.sm,
              backgroundColor: palette.bgElevated,
            }}
          />
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          <Button
            title={logoUri ? "Choose a different logo" : "Choose a logo"}
            variant="secondary"
            icon="photo"
            disabled={disabled}
            onPress={onChooseLogo}
            style={{ flexGrow: 1 }}
          />
          {logoUri ? (
            <Button
              title="Remove logo"
              variant="secondary"
              icon="trash"
              disabled={disabled}
              onPress={onRemoveLogo}
              style={{ flexGrow: 1 }}
            />
          ) : null}
        </View>
        {errors.sponsorLogoUrl ? (
          <ThemedText variant="footnote" tone="danger" accessibilityRole="alert">
            {errors.sponsorLogoUrl}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}
