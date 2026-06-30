import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exportToZip } from "@/lib/editor/exportEngine";
import { toExportCoords } from "@/lib/editor/coordinateMapper";
import { getPageDimensions } from "@/lib/editor/canvasConfig";

type DbPage = {
  id: string;
  project_id: string;
  page_index: number;
  background_fill: string | null;
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const { data: orderRaw } = await supabase
    .from("orders")
    .select("*")
    .eq("project_id", id)
    .single();

  const order = orderRaw as { payment_status: string } | null;

  if (!order || order.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Se requiere pago antes de exportar" },
      { status: 402 }
    );
  }

  const { data: pagesRaw } = await supabase
    .from("project_pages")
    .select("*")
    .eq("project_id", id)
    .order("page_index");

  const pages = pagesRaw as DbPage[] | null;

  if (!pages) {
    return NextResponse.json({ error: "No se encontraron páginas" }, { status: 400 });
  }

  const exportPages = [];

  for (const page of pages) {
    const { data: placementsRaw } = await supabase
      .from("photo_placements")
      .select("*, photos(bucket_path_highres)")
      .eq("page_id", page.id);

    const placements = placementsRaw as Record<string, unknown>[] | null;

    const coords = toExportCoords(
      (placements || []).map((p) => ({
        id: p.id as string,
        photoId: p.photo_id as string,
        highResUrl: (p as Record<string, unknown>).highResUrl as string,
        x: p.x as number,
        y: p.y as number,
        width: p.width as number,
        height: p.height as number,
        scaleX: p.scale_x as number,
        scaleY: p.scale_y as number,
        rotation: p.rotation as number,
      }))
    );

    exportPages.push({
      photos: coords,
      template: {
        id: "",
        name: "",
        slots: [],
        backgroundColor: page.background_fill ?? undefined,
      },
    });
  }

  const highResFetcher = async (photoId: string) => {
    const { data } = await admin.storage
      .from("photos_highres")
      .download(photoId);
    if (!data) throw new Error(`Failed to fetch photo ${photoId}`);
    return data.arrayBuffer();
  };

  const dims = getPageDimensions(project.format as "10x10" | "8.5x11" | "8x10");

  const zipBlob = await exportToZip(
    {
      pages: exportPages,
      pageWidthPx: dims.w,
      pageHeightPx: dims.h,
    },
    highResFetcher
  );

  const filePath = `${user.id}/${id}/export_${Date.now()}.zip`;
  const { error: uploadError } = await admin.storage
    .from("exports")
    .upload(filePath, zipBlob, {
      contentType: "application/zip",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("exports").getPublicUrl(filePath);

  await supabase
    .from("orders")
    .update({ export_url: publicUrl } as Record<string, unknown>)
    .eq("project_id", id);

  await supabase
    .from("projects")
    .update({ status: "exported" } as Record<string, unknown>)
    .eq("id", id);

  return NextResponse.json({ url: publicUrl });
}
