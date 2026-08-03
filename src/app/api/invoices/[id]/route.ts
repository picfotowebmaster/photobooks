import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateReceiptPDF } from "@/lib/invoices/pdfGenerator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, projects!inner(title, format, cover_type)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, rfc")
    .eq("id", user.id)
    .single();

  const projects = order.projects as { title: string; format: string; cover_type: string } | null;

  const pdf = generateReceiptPDF({
    invoiceNumber: order.invoice_number || `INV-${order.id.slice(0, 8).toUpperCase()}`,
    date: new Date(order.paid_at || order.created_at).toLocaleDateString("es-MX"),
    clientName: profile?.full_name || "",
    clientEmail: profile?.email || user.email || "",
    clientRfc: profile?.rfc,
    projectTitle: projects?.title || "Fotolibro",
    format: projects?.format || "",
    coverType: projects?.cover_type || "soft",
    totalPages: order.total_pages,
    basePrice: Number(order.base_price),
    extraPagesCost: Number(order.extra_pages_cost || 0),
    coverSurcharge: Number(order.cover_surcharge || 0),
    totalAmount: Number(order.total_amount),
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recibo-${order.invoice_number || id.slice(0, 8)}.pdf"`,
    },
  });
}
