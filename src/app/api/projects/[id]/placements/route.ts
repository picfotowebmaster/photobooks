import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

interface PlacementInput {
  pageIndex: number;
  photoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  zIndex: number;
  slotIndex?: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  let body: { placements?: PlacementInput[] };
  try {
    body = (await request.json()) as { placements?: PlacementInput[] };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const placements = (body.placements ?? []).filter(
    (p) => typeof p.photoId === "string" && p.photoId.length > 0
  );

  // Make sure a project_pages row exists for every page in use.
  const pageIndexes = Array.from(
    new Set(placements.map((p) => Math.max(0, Math.floor(p.pageIndex))))
  );
  if (pageIndexes.length > 0) {
    const { error } = await supabase.from("project_pages").upsert(
      pageIndexes.map((page_index) => ({ project_id: projectId, page_index })),
      { onConflict: "project_id, page_index", ignoreDuplicates: true }
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { data: pages } = await supabase
    .from("project_pages")
    .select("id, page_index")
    .eq("project_id", projectId);

  const pageIdByIndex = new Map<number, string>(
    (pages ?? []).map((p) => [p.page_index as number, p.id as string])
  );
  const pageIds = Array.from(pageIdByIndex.values());

  // Reconcile: wipe the project's placements and insert the current set.
  if (pageIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("photo_placements")
      .delete()
      .in("page_id", pageIds);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
  }

  const rows = placements
    .map((p) => {
      const pageId = pageIdByIndex.get(Math.max(0, Math.floor(p.pageIndex)));
      if (!pageId) return null;
      return {
        page_id: pageId,
        photo_id: p.photoId,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        scale_x: p.scaleX,
        scale_y: p.scaleY,
        rotation: p.rotation,
        z_index: p.zIndex,
        slot_index: p.slotIndex ?? null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("photo_placements")
      .insert(rows);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
