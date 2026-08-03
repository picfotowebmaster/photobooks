import { NextResponse } from "next/server";
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

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const [
    { count: totalClients },
    { count: activeClients },
    { count: newThisMonth },
    { data: revenueData },
    { count: totalProjects },
    { data: monthlyRevenue },
    { count: paidOrders },
    { data: monthlySignups },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client").eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client").gte("created_at", firstOfMonth),
    supabase.from("orders").select("total_amount, paid_at").eq("payment_status", "paid"),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount, paid_at").eq("payment_status", "paid").gte("paid_at", sixMonthsAgo).order("paid_at", { ascending: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("payment_status", "paid"),
    supabase.from("profiles").select("created_at").eq("role", "client").gte("created_at", sixMonthsAgo).order("created_at", { ascending: true }),
  ]);

  const totalRevenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const revenueThisMonth = (revenueData || [])
    .filter((o) => o.paid_at && o.paid_at >= firstOfMonth)
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toISOString().slice(0, 7);
  });

  const revenueByMonth: Record<string, number> = {};
  months.forEach((m) => { revenueByMonth[m] = 0; });
  (monthlyRevenue || []).forEach((o) => {
    if (o.paid_at) {
      const key = o.paid_at.slice(0, 7);
      if (key in revenueByMonth) {
        revenueByMonth[key] += Number(o.total_amount);
      }
    }
  });

  const signupsByMonth: Record<string, number> = {};
  months.forEach((m) => { signupsByMonth[m] = 0; });
  (monthlySignups || []).forEach((p) => {
    const key = p.created_at.slice(0, 7);
    if (key in signupsByMonth) {
      signupsByMonth[key] += 1;
    }
  });

  const topClients = await getTopClients(supabase);

  return NextResponse.json({
    totalClients: totalClients ?? 0,
    activeClients: activeClients ?? 0,
    newThisMonth: newThisMonth ?? 0,
    totalRevenue,
    revenueThisMonth,
    totalProjects: totalProjects ?? 0,
    paidOrders: paidOrders ?? 0,
    revenueChart: {
      labels: months,
      data: months.map((m) => revenueByMonth[m]),
    },
    signupsChart: {
      labels: months,
      data: months.map((m) => signupsByMonth[m]),
    },
    topClients,
  });
}

async function getTopClients(supabase: ReturnType<typeof createAdminClient>) {
  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total_amount")
    .eq("payment_status", "paid");

  if (!orders?.length) return [];

  const totalsByUser: Record<string, number> = {};
  orders.forEach((o) => {
    totalsByUser[o.user_id] = (totalsByUser[o.user_id] || 0) + Number(o.total_amount);
  });

  const topIds = Object.entries(totalsByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  if (!topIds.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", topIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  return topIds.map((id) => ({
    full_name: profileMap.get(id)?.full_name || "Sin nombre",
    email: profileMap.get(id)?.email || "",
    total: totalsByUser[id],
  }));
}
