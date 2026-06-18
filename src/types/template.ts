export interface Template {
  id: string;
  name: string;
  description: string | null;
  format: string;
  thumbnail_url: string | null;
  slots: { x: number; y: number; w: number; h: number }[];
  is_active: boolean;
}
