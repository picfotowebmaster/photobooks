export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          phone: string | null;
          is_active: boolean;
          rfc: string | null;
          razon_social: string | null;
          regimen_fiscal: string | null;
          cp_fiscal: string | null;
          uso_cfdi: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          phone?: string | null;
          is_active?: boolean;
          rfc?: string | null;
          razon_social?: string | null;
          regimen_fiscal?: string | null;
          cp_fiscal?: string | null;
          uso_cfdi?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          phone?: string | null;
          is_active?: boolean;
          rfc?: string | null;
          razon_social?: string | null;
          regimen_fiscal?: string | null;
          cp_fiscal?: string | null;
          uso_cfdi?: string | null;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string | null;
          phone: string | null;
          street: string;
          ext_number: string | null;
          int_number: string | null;
          neighborhood: string | null;
          city: string;
          state: string;
          zip: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          full_name?: string | null;
          phone?: string | null;
          street: string;
          ext_number?: string | null;
          int_number?: string | null;
          neighborhood?: string | null;
          city: string;
          state: string;
          zip: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          full_name?: string | null;
          phone?: string | null;
          street?: string;
          ext_number?: string | null;
          int_number?: string | null;
          neighborhood?: string | null;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      saved_cards: {
        Row: {
          id: string;
          user_id: string;
          card_brand: string;
          last4: string;
          exp_month: string;
          exp_year: string;
          cardholder_name: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_brand: string;
          last4: string;
          exp_month: string;
          exp_year: string;
          cardholder_name: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_brand?: string;
          last4?: string;
          exp_month?: string;
          exp_year?: string;
          cardholder_name?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
