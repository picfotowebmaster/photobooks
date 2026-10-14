import type { ProjectFormat } from "@/lib/editor/formats";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  format: ProjectFormat;
  cover_type: string;
  cover_image_url: string | null;
  current_page: number;
  total_pages: number;
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
