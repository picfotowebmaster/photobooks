import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { resolveFormat } from "@/lib/editor/formats";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const requested = searchParams.get("format");

  if (projectId) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }
    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const { data: pages, error: pagesError } = await supabase
      .from("project_pages")
      .select("template_id")
      .eq("project_id", projectId)
      .not("template_id", "is", null);

    if (pagesError) {
      return NextResponse.json({ error: pagesError.message }, { status: 500 });
    }

    const templateIds = Array.from(
      new Set((pages ?? []).map((page) => page.template_id).filter(Boolean))
    ) as string[];
    if (templateIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("templates")
      .select("*")
      .in("id", templateIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  // Legacy/unknown formats fall back to the canonical default so the picker is
  // never empty.
  const format = requested ? resolveFormat(requested) : null;

  const supabase = await createServerSupabase();

  let query = supabase
    .from("templates")
    .select("*")
    .eq("is_active", true);

  if (format) {
    query = query.eq("format", format);
  }

  const { data, error } = await query.order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
