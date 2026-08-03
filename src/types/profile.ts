import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Address = Database["public"]["Tables"]["addresses"]["Row"];

export type { Profile, Address };

export interface Invoice {
  id: string;
  user_id: string;
  project_id: string;
  total_pages: number;
  base_price: number;
  extra_pages_cost: number;
  cover_surcharge: number;
  total_amount: number;
  payment_status: string;
  invoice_number: string | null;
  paid_at: string | null;
  created_at: string;
  projects?: { title: string; format: string; cover_type: string } | { title: string; format: string; cover_type: string }[];
}
