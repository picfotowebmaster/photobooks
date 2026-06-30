export interface PricingInput {
  totalPages: number;
  coverType: "soft" | "hard";
  format: "10x10" | "8.5x11" | "8x10";
}

export interface PricingOutput {
  basePrice: number;
  extraPages: number;
  extraPagesCost: number;
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
