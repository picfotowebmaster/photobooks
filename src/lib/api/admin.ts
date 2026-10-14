import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AdminAuthResult =
  | { error: NextResponse; user?: undefined }
  | { user: User; error?: undefined };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }),
    };
  }

  return { user };
}
