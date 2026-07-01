"use client";

import Link from "next/link";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

const statusLabels: Record<Project["status"], string> = {
  draft: "Borrador",
  paid: "Pagado",
  exported: "Exportado",
};

const statusStyles: Record<Project["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  exported: "bg-blue-100 text-blue-800",
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all group relative"
    >
      <div className="aspect-square rounded-lg bg-neutral-100 mb-3 flex items-center justify-center">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-2xl text-neutral-300">📖</span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-neutral-900 truncate pr-8">
        {project.title}
      </h3>

      {project.description && (
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2 pr-8">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-neutral-500">
          {project.format} · {project.cover_type}
        </span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            statusStyles[project.status]
          )}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      {onDelete && (
        <Button
          variant="danger"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(project.id);
          }}
        >
          Eliminar
        </Button>
      )}
    </Link>
  );
}
