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
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          format: string;
          cover_type: string;
          cover_image_url: string | null;
          current_page: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string | null;
          format?: string;
          cover_type?: string;
          cover_image_url?: string | null;
          current_page?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          format?: string;
          cover_type?: string;
          cover_image_url?: string | null;
          current_page?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_pages: {
        Row: {
          id: string;
          project_id: string;
          page_index: number;
          template_id: string | null;
          background_fill: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          page_index: number;
          template_id?: string | null;
          background_fill?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          page_index?: number;
          template_id?: string | null;
          background_fill?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          bucket_path_highres: string;
          bucket_path_lowres: string;
          original_width: number;
          original_height: number;
          file_size: number | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          bucket_path_highres: string;
          bucket_path_lowres: string;
          original_width: number;
          original_height: number;
          file_size?: number | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          bucket_path_highres?: string;
          bucket_path_lowres?: string;
          original_width?: number;
          original_height?: number;
          file_size?: number | null;
          uploaded_at?: string;
        };
      };
      photo_placements: {
        Row: {
          id: string;
          photo_id: string;
          page_id: string;
          x: number;
          y: number;
          width: number;
          height: number;
          scale_x: number;
          scale_y: number;
          rotation: number;
          z_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          page_id: string;
          x?: number;
          y?: number;
          width: number;
          height: number;
          scale_x?: number;
          scale_y?: number;
          rotation?: number;
          z_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          page_id?: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          scale_x?: number;
          scale_y?: number;
          rotation?: number;
          z_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          format: string;
          thumbnail_url: string | null;
          slots: Json;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          format: string;
          thumbnail_url?: string | null;
          slots?: Json;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          format?: string;
          thumbnail_url?: string | null;
          slots?: Json;
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          total_pages: number;
          base_price: number;
          extra_pages_cost: number;
          cover_surcharge: number;
          total_amount: number;
          stripe_session_id: string | null;
          payment_status: string;
          export_url: string | null;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          total_pages: number;
          base_price: number;
          extra_pages_cost?: number;
          cover_surcharge?: number;
          total_amount: number;
          stripe_session_id?: string | null;
          payment_status?: string;
          export_url?: string | null;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          total_pages?: number;
          base_price?: number;
          extra_pages_cost?: number;
          cover_surcharge?: number;
          total_amount?: number;
          stripe_session_id?: string | null;
          payment_status?: string;
          export_url?: string | null;
          created_at?: string;
          paid_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
