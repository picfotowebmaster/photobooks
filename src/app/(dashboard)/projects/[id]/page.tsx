"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/stores/editorStore";
import { PageTitle } from "@/components/ui/PageTitle";
import { getFormatLabel } from "@/lib/editor/formats";
import { getDefaultCoverName } from "@/lib/pricing/defaults";
import type { Project } from "@/types/project";
import type { PhotoPlacement, PageTemplate, PageBackground } from "@/types/editor";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const projectData = data as Project;
          setProject(projectData);
          if (projectData.total_pages) {
            useEditorStore.getState().setTotalPages(projectData.total_pages);
          }
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();

    supabase
      .from("project_pages")
      .select("page_index, template_id, background_fill, background")
      .eq("project_id", id)
      .order("page_index")
      .then(({ data: pages }) => {
        const typedPages = pages as {
          page_index: number;
          background_fill: string | null;
          background: PageBackground | null;
          template_id: string | null;
        }[] | null;
        if (typedPages && typedPages.length > 0) {
          const store = useEditorStore.getState();
          typedPages.forEach((p) => {
            if (p.background) {
              store.setPageBackground(p.page_index, p.background);
            } else if (p.background_fill) {
              store.setPageBackground(p.page_index, { type: "color", color: p.background_fill });
            }
          });
        }
      });

    supabase
      .from("project_pages")
      .select("id")
      .eq("project_id", id)
      .then(({ data: projectPages }) => {
        const typedProjectPages = projectPages as { id: string }[] | null;
        if (typedProjectPages && typedProjectPages.length > 0) {
          const pageIds = typedProjectPages.map((p) => p.id);
          supabase
            .from("photo_placements")
            .select("*, photos(bucket_path_lowres, bucket_path_highres, original_width, original_height)")
            .in("page_id", pageIds)
            .then(({ data: placements }) => {
              if (placements) {
                const mapped: PhotoPlacement[] = placements.map((pl: Record<string, unknown>) => {
                  const photo = pl.photos as Record<string, unknown> | undefined;
                  return {
                    id: pl.id as string,
                    photoId: pl.photo_id as string,
                    pageIndex: (pl as unknown as { pageIndex: number }).pageIndex || 0,
                    x: pl.x as number,
                    y: pl.y as number,
                    width: photo?.original_width as number || 200,
                    height: photo?.original_height as number || 200,
                    scaleX: pl.scale_x as number,
                    scaleY: pl.scale_y as number,
                    rotation: pl.rotation as number,
                    zIndex: pl.z_index as number,
                    lowResUrl: photo?.bucket_path_lowres as string || "",
                    highResUrl: photo?.bucket_path_highres as string || "",
                  };
                });
                useEditorStore.getState().photos = mapped;
              }
            });
        }
      });
  }, [id]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!project) return <div className="p-8">Proyecto no encontrado</div>;

  return (
    <div>
      <PageTitle>{project.title}</PageTitle>
      <p className="text-sm text-neutral-500 mt-1">
        Formato: {getFormatLabel(project.format)} · Tapa: {getDefaultCoverName(project.cover_type)} · Estado: {project.status}
      </p>
    </div>
  );
}
