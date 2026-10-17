import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/admin";

const ASSIGNABLE_ROLES = ["client", "admin"] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, is_active, created_at", { count: "exact" });

  if (role && ASSIGNABLE_ROLES.includes(role as (typeof ASSIGNABLE_ROLES)[number])) {
    query = query.eq("role", role);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data || [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Ingresa un email válido" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (!ASSIGNABLE_ROLES.includes(role as (typeof ASSIGNABLE_ROLES)[number])) {
    return NextResponse.json(
      { error: "El rol debe ser cliente o administrador" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  });

  if (createError || !created.user) {
    const message = createError?.message || "No se pudo crear la cuenta";
    const status = /already|registered|exists/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  const userId = created.user.id;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      full_name: fullName || null,
      role,
      is_active: true,
    })
    .select()
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ data: profile }, { status: 201 });
}
