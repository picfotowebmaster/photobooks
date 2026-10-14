import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exportToZip } from "@/lib/editor/exportEngine";
import { toExportCoords, mmToPx } from "@/lib/editor/coordinateMapper";
import { getPageDimensions, SPREAD_GAP_PX } from "@/lib/editor/canvasConfig";
import { TEMPLATE_BLEED_MM } from "@/lib/editor/templateCatalog";
import type { PageBackground } from "@/types/editor";

type DbPage = {
  id: string;
  project_id: string;
  page_index: number;
  background_fill: string | null;
  background: PageBackground | null;
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

  const exportPages = new Map<
    number,
    {
      photos: ReturnType<typeof toExportCoords>;
      background: PageBackground;
    }
  >();
  /** Map photos.id → storage path (bucket_path_highres). */
  const pathByPhotoId = new Map<string, string>();

  for (const page of pages) {
    const { data: placementsRaw } = await supabase
      .from("photo_placements")
      .select("*, photos(bucket_path_highres)")
      .eq("page_id", page.id);

    const placements = placementsRaw as Record<string, unknown>[] | null;

    for (const p of placements || []) {
      const photo = (p as { photos?: { bucket_path_highres?: string } | null })
        .photos;
      const photoId = p.photo_id as string;
      if (photo?.bucket_path_highres) {
        pathByPhotoId.set(photoId, photo.bucket_path_highres);
      }
    }

    const coords = toExportCoords(
      (placements || []).map((p) => ({
        id: p.id as string,
        photoId: p.photo_id as string,
        highResUrl: "",
        x: p.x as number,
        y: p.y as number,
        width: p.width as number,
        height: p.height as number,
        scaleX: p.scale_x as number,
        scaleY: p.scale_y as number,
        rotation: p.rotation as number,
      }))
    );

    exportPages.set(page.page_index, {
      photos: coords,
      background:
        page.background ??
        (page.background_fill
          ? { type: "color", color: page.background_fill }
          : { type: "color", color: "#ffffff" }),
    });
  }

  const blankPage = {
    photos: [] as ReturnType<typeof toExportCoords>,
    background: { type: "color", color: "#ffffff" } as PageBackground,
  };
  const maxIndex = exportPages.size
    ? Math.max(...Array.from(exportPages.keys()))
    : -1;
  const totalPages = Math.max(
    project.total_pages ?? 0,
    maxIndex + 1,
    0
  );
  const spreads = [];
  for (let i = 0; i < totalPages; i += 2) {
    spreads.push({
      left: exportPages.get(i) ?? blankPage,
      right: exportPages.get(i + 1) ?? blankPage,
    });
  }

  const highResFetcher = async (photoId: string) => {
    const path = pathByPhotoId.get(photoId);
    if (!path) throw new Error(`No storage path for photo ${photoId}`);
    const { data } = await admin.storage
      .from("photos_highres")
      .download(path);
    if (!data) throw new Error(`Failed to fetch photo ${path}`);
    return data.arrayBuffer();
  };

  const textureFetcher = async (imagePath: string) => {
    const { data } = await admin.storage
      .from("textures")
      .download(imagePath);
    if (!data) throw new Error(`Failed to fetch texture ${imagePath}`);
    return data.arrayBuffer();
  };

  const dims = getPageDimensions(project.format);

  const zipBlob = await exportToZip(
    {
      spreads,
      pageWidthPx: dims.w,
      pageHeightPx: dims.h,
      bleedPx: mmToPx(TEMPLATE_BLEED_MM),
      gapPx: SPREAD_GAP_PX,
    },
    highResFetcher,
    textureFetcher
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
