"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/images/Logo-Pic-foto.png";
import { Button } from "@/components/ui/Button";

export function AdminHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-900 text-white">
      <div className="flex items-center justify-between h-14 px-6 max-w-screen-2xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <img src={logo.src} alt="PicFoto" className="h-7 brightness-0 invert" />
          <span className="text-lg font-bold tracking-tight">
            Admin Panel
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/projects" className="text-sm text-neutral-300 hover:text-white">
            Ir al sitio
          </Link>
          <span className="text-sm text-neutral-400">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-neutral-300 hover:text-white hover:bg-neutral-700">
            Cerrar sesión
          </Button>
        </nav>
      </div>
    </header>
  );
}
