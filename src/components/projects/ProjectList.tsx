"use client";

import { ProjectCard } from "./ProjectCard";
import { Spinner } from "@/components/ui/Spinner";
import type { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
}

export function ProjectList({ projects, loading }: ProjectListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Aún no hay proyectos. ¡Crea tu primer fotolibro!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
