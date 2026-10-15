import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import type { UploadFile } from "@/api/types";
import { resizeToFit } from "@/domain/posts/resize";

export type PickedImage = UploadFile & { width: number; height: number };

/**
 * Photo library → resized JPEG ready to upload. Library only (no camera
 * permission needed). `square` shows the OS crop UI at 1:1 (avatars).
 * Returns null when the user cancels.
 */
export async function pickImageForUpload(options: {
  maxSide: number;
  square?: boolean;
  quality?: number;
}): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: options.square === true,
    aspect: options.square ? [1, 1] : undefined,
    quality: 1,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;

  const context = ImageManipulator.manipulate(asset.uri);
  const resize = resizeToFit(asset.width, asset.height, options.maxSide);
  if (resize) context.resize(resize);
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: options.quality ?? 0.8 });

  return {
    uri: saved.uri,
    name: `photo-${Date.now()}.jpg`,
    type: "image/jpeg",
    width: saved.width,
    height: saved.height,
  };
}
