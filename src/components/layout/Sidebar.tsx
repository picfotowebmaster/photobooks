"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { FolderOpen, BookOpen, User, Package, Settings } from "lucide-react";

const links = [
  { href: "/projects", label: "Proyectos", Icon: FolderOpen },
  { href: "/editor", label: "Nuevo libro", Icon: BookOpen },
  { href: "/profile", label: "Mi Perfil", Icon: User },
  { href: "/orders", label: "Mis Órdenes", Icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => setIsAdmin(d.data?.role === "admin"))
        .catch(() => {});
    }
  }, [user]);

  return (
    <aside className="w-56 border-r border-neutral-200 bg-neutral-50 flex flex-col p-4 gap-1">
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith(link.href)
                ? "bg-neutral-200 text-neutral-900 font-medium"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
            >
              <link.Icon className="w-4 h-4" />
              {link.label}
          </Link>
        ))}
      </nav>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="px-3 text-xs text-neutral-400 mb-2 uppercase tracking-wide">Admin</p>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Panel Admin
          </Link>
        </div>
      )}
    </aside>
  );
}
