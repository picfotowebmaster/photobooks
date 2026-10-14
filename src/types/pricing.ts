import type { ProjectFormat } from "@/lib/editor/formats";

export interface FormatPrice {
  format: ProjectFormat;
  basePrice: number;
  extraPagePrice: number;
  extraSpreadPrice: number;
  isActive: boolean;
}

export interface CoverType {
  id: string;
  key: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

export interface PricingSettings {
  basePages: number;
  maxPages: number;
  currency: string;
  defaultCoverKey: string;
}

export interface PricingConfig {
  settings: PricingSettings;
  formats: FormatPrice[];
  covers: CoverType[];
}

export interface PricingInput {
  totalPages: number;
  coverType: string;
  format: ProjectFormat;
}

export interface PricingOutput {
  basePrice: number;
  basePages: number;
  totalPages: number;
  /** Extra pages beyond the base page count (totalPages - basePages) */
  extraPages: number;
  /** Extra spreads = floor(extraPages / 2) */
  extraSpreads: number;
  extraSpreadsCost: number;
  /** Remaining odd page charged at the per-page price */
  extraPageRemainder: number;
  /** Total cost of every extra page (spreads + remainder) */
  extraPagesCost: number;
  format: ProjectFormat;
  coverType: string;
  coverName: string;
  coverSurcharge: number;
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  user_id: string;
  project_id: string;
  total_pages: number;
  base_price: number;
  extra_pages_cost: number;
  cover_surcharge: number;
  total_amount: number;
  stripe_session_id: string | null;
  payment_status: "pending" | "paid" | "failed";
  export_url: string | null;
  created_at: string;
  paid_at: string | null;
}
