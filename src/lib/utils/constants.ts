import { FORMAT_KEYS } from "@/lib/editor/formats";

export const APP_NAME = "PICFOTO FOTOLIBROS";
export const BASE_PAGES = 10;
export const MAX_PAGES = 40;
export const FORMATS = FORMAT_KEYS;
export const STATUSES = ["draft", "paid", "exported"] as const;

export const SUPABASE_BUCKETS = {
  HIGH_RES: "photos_highres",
  LOW_RES: "photos_lowres",
  EXPORTS: "exports",
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
};
