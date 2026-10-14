import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/admin";
import { mapCoverRow } from "@/lib/pricing/config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    price?: number;
    sortOrder?: number;
    isActive?: boolean;
  };

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (body.description !== undefined) update.description = body.description;
  if (body.imageUrl !== undefined) update.image_url = body.imageUrl || null;
  if (body.price !== undefined) update.price = Number(body.price) || 0;
  if (body.sortOrder !== undefined) update.sort_order = Number(body.sortOrder) || 0;
  if (body.isActive !== undefined) update.is_active = body.isActive;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cover_types")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[cover-types] update failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "La tapa no existe o no se pudo actualizar" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    data: mapCoverRow(data as Parameters<typeof mapCoverRow>[0]),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("cover_types").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
