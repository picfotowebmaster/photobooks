"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/Button";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { projects, setProjects } = useProjectStore();

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mis proyectos</h1>
        <Button onClick={() => setModalOpen(true)}>Nuevo fotolibro</Button>
      </div>
      <ProjectList projects={projects} loading={loading} />

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
