export interface Template {
  id: string;
  name: string;
  description: string | null;
  format: string;
  thumbnail_url: string | null;
  scope: "page" | "spread";
  kind: string;
  /** "seed" for the system catalog, "custom" for user-created templates. */
  source?: "seed" | "custom";
  slots: {
    x: number;
    y: number;
    w: number;
    h: number;
    page?: number;
    span?: "spread";
    bleed?: Partial<Record<"top" | "right" | "bottom" | "left", boolean>>;
  }[];
  is_active: boolean;
}
