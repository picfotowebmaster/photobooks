import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const supabase = await createServerSupabase();

  let query = supabase
    .from("templates")
    .select("*")
    .eq("is_active", true);

  if (format) {
    query = query.eq("format", format);
  }

  const { data, error } = await query.order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
