import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "";

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, is_active, avatar_url, created_at, updated_at", { count: "exact" })
    .eq("role", "client");

  if (filter === "active") query = query.eq("is_active", true);
  else if (filter === "banned") query = query.eq("is_active", false);

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const clientsWithStats = await Promise.all(
    (data || []).map(async (client) => {
      const [{ count: projectCount }, { data: orders }] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", client.id),
        supabase.from("orders").select("total_amount, payment_status").eq("user_id", client.id),
      ]);
      const totalSpent = (orders || [])
        .filter((o) => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      return { ...client, projectCount: projectCount ?? 0, totalSpent };
    })
  );

  return NextResponse.json({
    data: clientsWithStats,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
