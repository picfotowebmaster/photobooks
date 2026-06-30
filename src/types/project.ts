export interface Project {
  id: string;
  user_id: string;
  title: string;
  format: "10x10" | "8.5x11" | "8x10";
  cover_type: "soft" | "hard";
  cover_image_url: string | null;
  current_page: number;
  status: "draft" | "paid" | "exported";
  created_at: string;
  updated_at: string;
}

export interface ProjectPage {
  id: string;
  project_id: string;
  page_index: number;
  template_id: string | null;
  background_fill: string | null;
  sort_order: number;
  created_at: string;
}
