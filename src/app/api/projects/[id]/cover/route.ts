import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const BUCKET = "cover_images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, cover_image_url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }
  if (!project) {
    return NextResponse.json({ error: "No se encontró el proyecto" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecciona una imagen de portada" }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG o WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La portada debe pesar menos de 5 MB." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const path = `${user.id}/${projectId}/${uuid()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);
  const { error: updateError } = await admin
    .from("projects")
    .update({ cover_image_url: publicUrl })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (updateError) {
    await admin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const previousUrl = (project as { cover_image_url?: string | null }).cover_image_url;
  const previousPath = previousUrl?.split(`/${BUCKET}/`)[1];
  if (previousPath && previousPath.startsWith(`${user.id}/${projectId}/`)) {
    const { error: removeError } = await admin.storage.from(BUCKET).remove([previousPath]);
    if (removeError) {
      console.error("[projects] previous cover cleanup failed:", removeError.message);
    }
  }

  return NextResponse.json({ data: { cover_image_url: publicUrl } }, { status: 200 });
}
