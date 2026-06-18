"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import logo from "@/images/Logo-Pic-foto.png";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between h-14 px-6 max-w-screen-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <img src={logo.src} alt="PicFoto" className="h-7" />
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Photobooks
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
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
      </div>
    </header>
  );
}
