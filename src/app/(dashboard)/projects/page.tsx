"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/ui/PageTitle";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { projects, setProjects, removeProject } = useProjectStore();

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setProjects(data as Project[]);
        }
        setLoading(false);
      });
  }, [setProjects]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleting(true);
      try {
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || "Error al eliminar el proyecto");
          return;
        }

        removeProject(id);
        toast.success("Proyecto eliminado");
      } catch {
        toast.error("Error de conexión al eliminar");
      } finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    },
    [removeProject]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Mis proyectos</PageTitle>
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Nuevo fotolibro
        </Link>
      </div>
      <ProjectList
        projects={projects}
        loading={loading}
        onDelete={(id) => setDeleteTarget(id)}
      />

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar proyecto"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            ¿Estás seguro de que quieres eliminar este fotolibro? Se perderán todas las fotos, páginas y archivos asociados. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
