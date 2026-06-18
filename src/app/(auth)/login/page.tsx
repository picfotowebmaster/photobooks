"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import loginBg from "@/images/loginpicfoto.jpg";
import logo from "@/images/Logo-Pic-foto.png";
import type { AuthError } from "@supabase/supabase-js";

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result: { error: AuthError | null };

    if (mode === "register") {
      result = await signUpWithEmail(email, password, fullName);
      if (!result.error) {
        router.push("/projects");
        return;
      }
    } else {
      result = await signInWithEmail(email, password);
      if (!result.error) {
        router.push("/projects");
        return;
      }
    }

    setError(result.error?.message || "Something went wrong");
    setLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block w-[60%] relative">
        <img
          src={loginBg.src}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="w-full md:w-[40%] flex items-center justify-center bg-neutral-50 p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img
              src={logo.src}
              alt="PicFoto"
              className="h-20 mx-auto mb-4"
            />
            <p className="text-sm text-neutral-500">
              {mode === "login"
                ? "Inicia sesión para comenzar a diseñar"
                : "Crea tu cuenta"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={mode === "register"}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="Juan Pérez"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Cargando..."
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-sm text-neutral-500 text-center mt-6">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
