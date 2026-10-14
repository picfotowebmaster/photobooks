"use client";

import { PhotoLibrary } from "./PhotoLibrary";

interface EditorSidebarProps {
  projectId: string;
}

export function EditorSidebar({ projectId }: EditorSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-l border-neutral-200 bg-white">
      <PhotoLibrary projectId={projectId} />
    </aside>
  );
}
