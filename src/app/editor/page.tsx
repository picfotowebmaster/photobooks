import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { DEFAULT_FORMAT } from "@/lib/editor/formats";
import { DEFAULT_PRICING_SETTINGS } from "@/lib/pricing/defaults";

export default async function EditorNewPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: "Fotolibro sin título",
      description: null,
      format: DEFAULT_FORMAT,
      cover_type: DEFAULT_PRICING_SETTINGS.defaultCoverKey,
    } as Record<string, unknown>)
    .select()
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">No se pudo crear el proyecto. Intenta de nuevo.</p>
      </div>
    );
  }

  redirect(`/editor/${(data as { id: string }).id}`);
}
