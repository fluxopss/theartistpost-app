import type { ImageSource } from "expo-image";

import type { BrandImage } from "@/content/site";

/**
 * Brand images bundled with the app so the house renders offline. Keys match
 * `BrandImage` in content/site; web paths live in `remoteImagePath`.
 */
export const brandImages: Record<BrandImage, ImageSource> = {
  logo: require("@/assets/images/brand/logo.webp"),
  logo3d: require("@/assets/images/brand/logo-3d.webp"),
  cover: require("@/assets/images/brand/cover-opt.webp"),
  hacienda: require("@/assets/images/brand/hacienda.webp"),
  haciendaHero: require("@/assets/images/brand/hacienda-hero.webp"),
  comingSoon: require("@/assets/images/brand/coming-soon.webp"),
  aboutHero: require("@/assets/images/brand/about-hero.webp"),
  kindnessTrademark: require("@/assets/images/brand/kindness-trademark.webp"),
  loveAll: require("@/assets/images/brand/love-all.webp"),
  supportersMap: require("@/assets/images/brand/supporters-map.webp"),
  donations: require("@/assets/images/brand/donations-appreciated.webp"),
  partnerSubCulture: require("@/assets/images/brand/partner-subculture.webp"),
  merchLockup: require("@/assets/images/merch/tap-merch-site.webp"),
  merch1: require("@/assets/images/merch/img-1605.webp"),
  merch2: require("@/assets/images/merch/img-5690.webp"),
  merch3: require("@/assets/images/merch/gallery.webp"),
};
