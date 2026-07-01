import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("projects")
    .update(body as Record<string, unknown>)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("bucket_path_highres, bucket_path_lowres")
    .eq("project_id", id);

  if (photosError) {
    return NextResponse.json({ error: photosError.message }, { status: 500 });
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("export_url")
    .eq("project_id", id);

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const storagePaths = new Set<string>();

  if (photos) {
    for (const p of photos) {
      if (p.bucket_path_highres) storagePaths.add(p.bucket_path_highres);
      if (p.bucket_path_lowres) storagePaths.add(p.bucket_path_lowres);
    }
  }

  if (orders) {
    for (const o of orders) {
      if (o.export_url) {
        const match = o.export_url.match(/\/storage\/v1\/object\/public\/exports\/(.+)/);
        if (match) storagePaths.add(match[1]);
      }
    }
  }

  if (storagePaths.size > 0) {
    await supabase.storage
      .from("photos_highres")
      .remove(Array.from(storagePaths));
    await supabase.storage
      .from("photos_lowres")
      .remove(Array.from(storagePaths));
    await supabase.storage
      .from("exports")
      .remove(Array.from(storagePaths));
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
