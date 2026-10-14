"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { NavSidebar, type NavLink } from "./NavSidebar";
import { FolderOpen, BookOpen, User, Package, Settings } from "lucide-react";

const links: NavLink[] = [
  { href: "/projects", label: "Proyectos", Icon: FolderOpen },
  { href: "/editor", label: "Nuevo libro", Icon: BookOpen },
  { href: "/profile", label: "Mi Perfil", Icon: User },
  { href: "/orders", label: "Mis Órdenes", Icon: Package },
];

export function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <NavSidebar links={links}>
      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="px-3 text-xs text-neutral-400 mb-2 uppercase tracking-wide">
            Admin
          </p>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Panel Admin
          </Link>
        </div>
      )}
    </NavSidebar>
  );
}
