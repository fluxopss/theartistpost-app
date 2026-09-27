import { Image, type ImageContentFit, type ImageSource } from "expo-image";
import { type StyleProp, View, type ViewStyle } from "react-native";

import { radius as radii, useBrandColors } from "@/theme";

/**
 * An image in a continuous-corner frame. expo-image can't take `borderCurve`,
 * so the frame view clips it. The frame's own fill shows while loading.
 */
export function FramedImage({
  source,
  alt,
  aspectRatio = 4 / 3,
  radius = radii.lg,
  contentFit = "cover",
  style,
}: {
  source: ImageSource | string;
  alt: string;
  aspectRatio?: number;
  radius?: number;
  contentFit?: ImageContentFit;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useBrandColors();
  return (
    <View
      style={[
        {
          aspectRatio,
          width: "100%",
          borderRadius: radius,
          borderCurve: "continuous",
          overflow: "hidden",
          backgroundColor: palette.bgElevated,
        },
        style,
      ]}
    >
      <Image
        source={source}
        contentFit={contentFit}
        transition={200}
        accessibilityLabel={alt}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
