import { FramedImage } from "@/components/framed-image";
import { type InvolveDoor, involveImagePlate } from "@/content/involve";
import { paper, spacing, stageInk } from "@/theme";
import { brandImages } from "@/utils/brand-images";

/**
 * The door's hero. Photographs hang edge to edge; marks and posters are
 * matted like prints — cream paper for light artwork, stage ink for dark.
 */
export function DoorPlate({ door }: { door: InvolveDoor }) {
  if (door.imageFit === "cover") {
    return <FramedImage source={brandImages[door.image]} alt={door.imageAlt} />;
  }
  const mat = involveImagePlate(door.id) === "paper" ? paper.ticket.bg : stageInk;
  return (
    <FramedImage
      source={brandImages[door.image]}
      alt={door.imageAlt}
      contentFit="contain"
      style={{ backgroundColor: mat, padding: spacing.xl }}
    />
  );
}
