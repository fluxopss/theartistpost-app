import { Image } from "expo-image";
import { View } from "react-native";

import { originUrl } from "@/api/client";
import { Icon } from "@/components/icon";
import { radius, useBrandColors } from "@/theme";

/**
 * An approved artist's portrait in a continuous-corner frame, or a plain
 * glyph when they haven't added one — never a stand-in face.
 */
export function ArtistAvatar({
  url,
  name,
  size = 40,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const palette = useBrandColors();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size >= 64 ? radius.lg : radius.md,
        borderCurve: "continuous",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.bgDeep,
      }}
    >
      {url ? (
        <Image
          source={{ uri: originUrl(url) }}
          accessibilityLabel={`Portrait of ${name}`}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Icon name="studio" size={Math.round(size * 0.55)} color={palette.textMuted} />
      )}
    </View>
  );
}
