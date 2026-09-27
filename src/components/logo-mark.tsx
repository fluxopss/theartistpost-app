import { Image } from "expo-image";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { springs } from "@/theme";
import { brandImages } from "@/utils/brand-images";

/**
 * The claymorphic 3D mark. `settle` plays a single gentle spring into place —
 * the native stand-in for the web's logo intro — and never under Reduce Motion.
 */
export function LogoMark({
  size = 96,
  settle = false,
}: {
  size?: number;
  settle?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(settle && !reduceMotion ? 0.92 : 1);

  useEffect(() => {
    if (settle && !reduceMotion) {
      scale.value = withSpring(1, springs.gentle);
    }
  }, [reduceMotion, scale, settle]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, animated]}>
      <Image
        source={brandImages.logo3d}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel="The Artist Post logo"
      />
    </Animated.View>
  );
}
