import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/png", "image/jpeg"];
const LOWRES_MAX_DIMENSION = 800;
const LOWRES_QUALITY = 70;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido (PNG o JPG)" },
      { status: 400 }
    );
  }

  const id = uuid();
  const ext = file.type === "image/png" ? "png" : "jpg";
  const highResPath = `${user.id}/${id}.${ext}`;
  const lowResPath = `${user.id}/${id}.jpg`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("textures")
    .upload(highResPath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const lowResBuffer = await sharp(buffer)
    .resize({
      width: LOWRES_MAX_DIMENSION,
      height: LOWRES_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: LOWRES_QUALITY })
    .toBuffer();

  const { error: lowResError } = await admin.storage
    .from("textures_lowres")
    .upload(lowResPath, lowResBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (lowResError) {
    return NextResponse.json({ error: lowResError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("textures_lowres").getPublicUrl(lowResPath);

  return NextResponse.json(
    { data: { imageUrl: publicUrl, imagePath: highResPath } },
    { status: 201 }
  );
}
