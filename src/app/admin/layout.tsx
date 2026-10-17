import { createServerSupabase } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdminRole(profile.role)) redirect("/projects");

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader variant="admin" />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-neutral-50">{children}</main>
      </div>
    </div>
  );
}
