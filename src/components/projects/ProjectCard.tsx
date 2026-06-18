"use client";

import Link from "next/link";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils/cn";

interface ProjectCardProps {
  project: Project;
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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={
        project.status === "paid" || project.status === "exported"
          ? `/editor/${project.id}`
          : `/editor/${project.id}`
      }
      className="block rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
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

      <h3 className="text-sm font-semibold text-neutral-900 truncate">
        {project.title}
      </h3>

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
    </Link>
  );
}
