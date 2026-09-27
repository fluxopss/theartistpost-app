import { View } from "react-native";

import { FramedImage } from "@/components/framed-image";
import { radius, spacing } from "@/theme";
import { brandImages } from "@/utils/brand-images";

// Intrinsic aspect ratios of the bundled mark files (width / height).
const KINDNESS_RATIO = 384 / 480;
const LOVE_ALL_RATIO = 480 / 243;

/**
 * The registered marks hung side by side at one shared height: each frame's
 * flex weight is its aspect ratio, so neither print is cropped or letterboxed.
 */
export function MarksWall() {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm }}>
      <FramedImage
        source={brandImages.kindnessTrademark}
        alt="Kindness Always® mark: Be Kind, Shine Bright!"
        aspectRatio={KINDNESS_RATIO}
        radius={radius.md}
        style={{ flex: KINDNESS_RATIO, width: "auto" }}
      />
      <FramedImage
        source={brandImages.loveAll}
        alt="Love ALL · Dream TOGETHER · Create AS ONE™ mark"
        aspectRatio={LOVE_ALL_RATIO}
        radius={radius.md}
        style={{ flex: LOVE_ALL_RATIO, width: "auto" }}
      />
    </View>
  );
}
