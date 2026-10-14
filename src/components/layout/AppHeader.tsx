"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import logo from "@/images/Logo-Pic-foto.png";

interface AppHeaderProps {
  variant?: "default" | "admin";
}

export function AppHeader({ variant = "default" }: AppHeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const isAdminVariant = variant === "admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-neutral-200",
        isAdminVariant ? "bg-neutral-900 text-white" : "bg-white/80 backdrop-blur"
      )}
    >
      <div className="flex items-center justify-between h-14 px-6 max-w-screen-2xl mx-auto">
        <Link
          href={isAdminVariant ? "/admin/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <img
            src={logo.src}
            alt="PicFoto"
            className={cn("h-7", isAdminVariant && "brightness-0 invert")}
          />
          <span
            className={cn(
              "text-lg font-bold tracking-tight",
              !isAdminVariant && "text-neutral-900"
            )}
          >
            {isAdminVariant ? "Admin Panel" : "Photobooks"}
          </span>
        </Link>

        {isAdminVariant ? (
          <nav className="flex items-center gap-4">
            <Link
              href="/projects"
              className="text-sm text-neutral-300 hover:text-white"
            >
              Ir al sitio
            </Link>
            <span className="text-sm text-neutral-400">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-neutral-300 hover:text-white hover:bg-neutral-700"
            >
              Cerrar sesión
            </Button>
          </nav>
        ) : (
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm text-admin-600 hover:text-admin-800 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/projects"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Mis proyectos
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Cerrar sesión
                </Button>
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Iniciar sesión</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
