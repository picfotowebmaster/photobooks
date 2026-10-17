import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/roles";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdminRole(profile.role)) redirect("/admin/dashboard");

  return <UsersManager />;
}
