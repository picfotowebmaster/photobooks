"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const { projects, setProjects } = useProjectStore();
  const router = useRouter();

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

  const createProject = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id } as Record<string, unknown>)
      .select()
      .single();

    if (!error && data) {
      router.push(`/editor/${(data as { id: string }).id}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mis proyectos</h1>
        <Button onClick={createProject}>Nuevo fotolibro</Button>
      </div>
      <ProjectList projects={projects} loading={loading} />
    </div>
  );
}
