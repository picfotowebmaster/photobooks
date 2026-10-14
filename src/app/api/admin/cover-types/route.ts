import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/admin";
import { slugifyCoverName } from "@/lib/pricing/defaults";
import { mapCoverRow } from "@/lib/pricing/config";

async function uniqueKey(base: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.from("cover_types").select("key").eq("key", base);
  if (!data || data.length === 0) return base;

  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = `${base}_${suffix}`;
    const { data: existing } = await admin
      .from("cover_types")
      .select("key")
      .eq("key", candidate);
    if (!existing || existing.length === 0) return candidate;
    suffix += 1;
  }
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cover_types")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data ?? []).map(mapCoverRow) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    key?: string;
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    price?: number;
    sortOrder?: number;
    isActive?: boolean;
  };

  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const baseKey = slugifyCoverName(body.key || body.name);
  const key = await uniqueKey(baseKey || "tapa");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cover_types")
    .insert({
      key,
      name: body.name.trim(),
      description: body.description ?? null,
      image_url: body.imageUrl ?? null,
      price: Number(body.price) || 0,
      sort_order: Number(body.sortOrder) || 0,
      is_active: body.isActive !== false,
    } as Record<string, unknown>)
    .select()
    .single();

  if (error) {
    console.error("[cover-types] insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "No se pudo crear la tapa" }, { status: 500 });
  }
  return NextResponse.json(
    { data: mapCoverRow(data as Parameters<typeof mapCoverRow>[0]) },
    { status: 201 }
  );
}
