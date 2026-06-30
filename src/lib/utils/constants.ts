export const APP_NAME = "PICFOTO FOTOLIBROS";
export const BASE_PAGES = 10;
export const MAX_PAGES = 40;
export const FORMATS = ["10x10", "8.5x11", "8x10"] as const;
export const COVER_TYPES = ["soft", "hard"] as const;
export const STATUSES = ["draft", "paid", "exported"] as const;

export const SUPABASE_BUCKETS = {
  HIGH_RES: "photos_highres",
  LOW_RES: "photos_lowres",
  EXPORTS: "exports",
} as const;
