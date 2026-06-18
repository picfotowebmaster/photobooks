import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 });
  }

  const photoId = uuid();
  const fileExt = file.name.split(".").pop() || "jpg";
  const highResPath = `${user.id}/${photoId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("photos_highres")
    .upload(highResPath, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl: highResUrl },
  } = supabase.storage.from("photos_highres").getPublicUrl(highResPath);

  const { data: photoData, error: dbError } = await supabase
    .from("photos")
    .insert({
      user_id: user.id,
      project_id: projectId || null,
      bucket_path_highres: highResPath,
      bucket_path_lowres: highResPath,
      original_width: 0,
      original_height: 0,
      file_size: file.size,
    } as Record<string, unknown>)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(
    { data: { ...(photoData as Record<string, unknown>), highResUrl } },
    { status: 201 }
  );
}
