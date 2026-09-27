// Ported from theartistpost@03f9a2f:src/features/wall/types.ts
import type { ArtistMedium } from "@/domain/content/types";
import type { KindnessNote } from "@/domain/kindness/types";
import type { BrandImage } from "@/content/site";

export type WallKind = "artist" | "event" | "reserved" | "venue" | "kindness";

export type WallNeighborhood = "hacienda" | "clematis" | "downtown";

export type WallAvailability = "open" | "reserved" | "upcoming";

export type WallPiece = {
  id: string;
  kind: WallKind;
  title: string;
  subtitle: string;
  story: string;
  /** Bundled brand image (venue photos, showcase placeholders). */
  brandImage?: BrandImage;
  /** Remote per-artist or per-post image URL. */
  imageUrl?: string;
  imageAlt: string;
  medium: ArtistMedium | "community" | "kindness";
  neighborhood: WallNeighborhood;
  availability: WallAvailability;
  showcaseDate?: string;
  href?: string;
  bookHref?: string;
  eventIds: string[];
  kindnessIds: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
};

export type WallFilters = {
  medium: "all" | ArtistMedium | "community" | "kindness";
  neighborhood: "all" | WallNeighborhood;
  availability: "all" | WallAvailability;
  date: "all" | "upcoming";
};

export const DEFAULT_WALL_FILTERS: WallFilters = {
  medium: "all",
  neighborhood: "all",
  availability: "all",
  date: "all",
};

export const WALL_CANVAS = { width: 2800, height: 1760 } as const;

export type WallSheetModel = {
  piece: WallPiece;
  notes: KindnessNote[];
};
