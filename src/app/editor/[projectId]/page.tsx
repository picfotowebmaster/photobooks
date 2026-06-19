"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/stores/editorStore";
import { EditorToolbar } from "@/components/editor/EditorToolbar";

const EditorCanvas = dynamic(
  () =>
    import("@/components/editor/EditorCanvas").then((mod) => ({
      default: mod.EditorCanvas,
    })),
  { ssr: false, loading: () => <Spinner size="lg" /> }
);
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { PageThumbnails } from "@/components/editor/PageThumbnails";
import { ExportPreview } from "@/components/editor/ExportPreview";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from "@/lib/editor/canvasConfig";
import type { Project } from "@/types/project";

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const { zoom, resetEditor } = useEditorStore();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setProject(data as Project);
        }
        setLoading(false);
      });

    return () => {
      resetEditor();
    };
  }, [projectId, resetEditor]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <p>Proyecto no encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <EditorToolbar />

        <div className="flex flex-1 overflow-hidden">
          <PageThumbnails />

          <EditorCanvas
            pageWidth={PAGE_WIDTH_PX}
            pageHeight={PAGE_HEIGHT_PX}
            scale={zoom}
          />

          <EditorSidebar />
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white px-4 py-2 flex items-center justify-end gap-2">
        <button
          onClick={() => setExportOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Exportar y pagar
        </button>
      </div>

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Vista previa de exportación">
        <ExportPreview
          format={project.format as "20x20" | "21x28" | "28x21"}
          coverType={project.cover_type as "soft" | "hard"}
          onExport={() => setExportOpen(false)}
        />
      </Modal>
    </>
  );
}
