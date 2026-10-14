import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/admin";
import { mapCoverRow } from "@/lib/pricing/config";

const BUCKET = "cover_images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const coverId = formData.get("coverId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 });
  }
  if (!coverId) {
    return NextResponse.json({ error: "Falta el identificador de la tapa" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG o WEBP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el límite de 5 MB" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("cover_types")
    .select("*")
    .eq("id", coverId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "La tapa no existe" }, { status: 404 });
  }

  const path = `${coverId}/${uuid()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[cover-types] upload failed:", uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await admin
    .from("cover_types")
    .update({ image_url: publicUrl } as Record<string, unknown>)
    .eq("id", coverId)
    .select()
    .single();

  if (error || !data) {
    console.error("[cover-types] image update failed:", error?.message);
    return NextResponse.json(
      { error: error?.message || "No se pudo guardar la imagen" },
      { status: 500 }
    );
  }

  const previousUrl = (existing as { image_url?: string | null }).image_url;
  if (previousUrl && previousUrl !== publicUrl) {
    const previousPath = previousUrl.split(`/${BUCKET}/`)[1];
    if (previousPath) {
      await admin.storage.from(BUCKET).remove([previousPath]);
    }
  }

  return NextResponse.json({
    data: mapCoverRow(data as Parameters<typeof mapCoverRow>[0]),
  });
}
