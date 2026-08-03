import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.full_name !== undefined) updates.full_name = body.full_name;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;
  if (body.rfc !== undefined) updates.rfc = body.rfc;
  if (body.razon_social !== undefined) updates.razon_social = body.razon_social;
  if (body.regimen_fiscal !== undefined) updates.regimen_fiscal = body.regimen_fiscal;
  if (body.cp_fiscal !== undefined) updates.cp_fiscal = body.cp_fiscal;
  if (body.uso_cfdi !== undefined) updates.uso_cfdi = body.uso_cfdi;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
