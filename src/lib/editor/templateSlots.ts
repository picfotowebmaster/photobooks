import type { PageTemplate, PhotoPlacement } from "@/types/editor";

export type TemplateSlot = PageTemplate["slots"][number];

export function getPhotoPlacementForSlot(
  photo: Pick<PhotoPlacement, "width" | "height">,
  slot: TemplateSlot
) {
  const scale = Math.max(slot.w / photo.width, slot.h / photo.height);
  const width = photo.width * scale;
  const height = photo.height * scale;

  return {
    x: slot.x + (slot.w - width) / 2,
    y: slot.y + (slot.h - height) / 2,
    scaleX: scale,
    scaleY: scale,
    rotation: 0,
  };
}

export function photoOverlapsSlot(photo: PhotoPlacement, slot: TemplateSlot) {
  const photoRight = photo.x + photo.width * photo.scaleX;
  const photoBottom = photo.y + photo.height * photo.scaleY;

  return (
    photo.x < slot.x + slot.w &&
    photoRight > slot.x &&
    photo.y < slot.y + slot.h &&
    photoBottom > slot.y
  );
}

export function isPhotoInSlot(
  photo: PhotoPlacement,
  slot: TemplateSlot,
  slotIndex: number
) {
  if (photo.inLibrary) return false;
  if (photo.slotIndex !== undefined) return photo.slotIndex === slotIndex;

  const centerX = photo.x + (photo.width * photo.scaleX) / 2;
  const centerY = photo.y + (photo.height * photo.scaleY) / 2;

  return (
    centerX >= slot.x &&
    centerX <= slot.x + slot.w &&
    centerY >= slot.y &&
    centerY <= slot.y + slot.h
  );
}

export function findAvailableSlot(
  photos: PhotoPlacement[],
  pageIndex: number,
  template?: PageTemplate,
  ignoredPhotoId?: string
) {
  if (!template) return undefined;

  return template.slots.find((slot, slotIndex) =>
    !photos.some(
      (photo) =>
        photo.pageIndex === pageIndex &&
        photo.id !== ignoredPhotoId &&
        isPhotoInSlot(photo, slot, slotIndex)
    )
  );
}

export function findSnapSlot(
  photos: PhotoPlacement[],
  photo: PhotoPlacement,
  x: number,
  y: number,
  template?: PageTemplate
) {
  if (!template) return undefined;

  const width = photo.width * photo.scaleX;
  const height = photo.height * photo.scaleY;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return template.slots.find((slot, slotIndex) => {
    const slotCenterX = slot.x + slot.w / 2;
    const slotCenterY = slot.y + slot.h / 2;
    const snapDistance = Math.max(80, Math.min(slot.w, slot.h) * 0.3);
    const distance = Math.hypot(centerX - slotCenterX, centerY - slotCenterY);

    return (
      distance <= snapDistance &&
      !photos.some(
        (otherPhoto) =>
          otherPhoto.pageIndex === photo.pageIndex &&
          otherPhoto.id !== photo.id &&
          isPhotoInSlot(otherPhoto, slot, slotIndex)
      )
    );
  });
}