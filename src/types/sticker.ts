export interface StickerDef {
  id: string;
  name: string;
  category: string;
  imagePath: string;
}

export interface StickerCategory {
  id: string;
  name: string;
}

export const STICKERS: StickerDef[] = [
  { id: "heart01", name: "Corazón 1", category: "hearts", imagePath: "/stickers/hearts/heart01.png" },
  { id: "heart02", name: "Corazón 2", category: "hearts", imagePath: "/stickers/hearts/heart02.png" },
  { id: "heart03", name: "Corazón 3", category: "hearts", imagePath: "/stickers/hearts/heart03.png" },
  { id: "heart04", name: "Corazón 4", category: "hearts", imagePath: "/stickers/hearts/heart04.png" },
  { id: "heart05", name: "Corazón 5", category: "hearts", imagePath: "/stickers/hearts/heart05.png" },
];

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: "hearts", name: "Corazones" },
];

export function getStickerById(id: string | undefined): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id);
}

export function getStickersByCategory(category: string): StickerDef[] {
  return STICKERS.filter((s) => s.category === category);
}
