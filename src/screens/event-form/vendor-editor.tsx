import { Pressable, View } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import {
  VENDOR_NAME_MAX,
  VENDOR_OFFERING_MAX,
  VENDOR_URL_MAX,
  VENDORS_MAX,
} from "@/domain/events/sponsors";
import { addVendorRow, canAddVendor, removeVendorRow, type VendorDraft } from "@/domain/events/vendor-editor";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

/** Add, edit and remove the night's food & vendor rows (up to 12). Errors sit on the row they belong to. */
export function VendorEditor({
  rows,
  onChange,
  errors,
  disabled,
}: {
  rows: VendorDraft[];
  onChange: (rows: VendorDraft[]) => void;
  /** Keyed like the server: `vendors.0.name`, plus `vendors` for the list. */
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const palette = useBrandColors();
  const setRow = (index: number, key: keyof VendorDraft) => (text: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: text } : row)));

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="headline" accessibilityRole="header">
          Food & vendors (optional)
        </ThemedText>
        <ThemedText variant="footnote" tone="muted">
          Who’s cooking or selling on the night. Only list people who have said yes.
        </ThemedText>
      </View>

      {rows.map((row, index) => (
        <View
          key={index}
          style={{
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.md,
            borderCurve: "continuous",
            backgroundColor: palette.bgElevated,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <ThemedText variant="subheadline" tone="muted">
              Vendor {index + 1}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove vendor ${index + 1}${row.name.trim() ? `, ${row.name.trim()}` : ""}`}
              disabled={disabled}
              hitSlop={spacing.xs}
              onPress={() => onChange(removeVendorRow(rows, index))}
              style={({ pressed }) => ({
                minWidth: minTapTarget,
                minHeight: minTapTarget,
                alignItems: "flex-end",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Icon name="minusCircle" size={22} color={palette.danger} />
            </Pressable>
          </View>
          <TextField
            label="Name"
            value={row.name}
            onChangeText={setRow(index, "name")}
            placeholder="Who they are"
            maxLength={VENDOR_NAME_MAX}
            editable={!disabled}
            error={errors[`vendors.${index}.name`]}
          />
          <TextField
            label="What they serve (optional)"
            value={row.offering}
            onChangeText={setRow(index, "offering")}
            placeholder="Street tacos, cold brew, pastries…"
            maxLength={VENDOR_OFFERING_MAX}
            editable={!disabled}
            error={errors[`vendors.${index}.offering`]}
          />
          <TextField
            label="Their link (optional)"
            value={row.url}
            onChangeText={setRow(index, "url")}
            placeholder="https://"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={VENDOR_URL_MAX}
            editable={!disabled}
            error={errors[`vendors.${index}.url`]}
          />
        </View>
      ))}

      {errors.vendors ? (
        <ThemedText variant="footnote" tone="danger" accessibilityRole="alert">
          {errors.vendors}
        </ThemedText>
      ) : null}

      {canAddVendor(rows) ? (
        <Button
          title={rows.length === 0 ? "Add a vendor" : "Add another vendor"}
          variant="secondary"
          icon="plus"
          disabled={disabled}
          onPress={() => onChange(addVendorRow(rows))}
        />
      ) : (
        <ThemedText variant="footnote" tone="muted">
          That’s the most a night can list ({VENDORS_MAX}).
        </ThemedText>
      )}
    </View>
  );
}
