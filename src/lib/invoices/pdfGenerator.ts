import jsPDF from "jspdf";

interface ReceiptData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientRfc?: string | null;
  projectTitle: string;
  format: string;
  coverType: string;
  totalPages: number;
  basePrice: number;
  extraPagesCost: number;
  coverSurcharge: number;
  totalAmount: number;
}

export function generateReceiptPDF(data: ReceiptData): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("PICFOTO", margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Photobooks", margin, y);

  y += 8;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.text("Recibo de compra", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Folio: ${data.invoiceNumber}`, margin, y);
  doc.text(`Fecha: ${data.date}`, pageWidth - margin - 40, y);
  y += 10;

  doc.setDrawColor(230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.text("Datos del cliente", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Nombre: ${data.clientName || "Sin nombre"}`, margin, y);
  y += 5;
  doc.text(`Email: ${data.clientEmail}`, margin, y);
  y += 5;
  if (data.clientRfc) {
    doc.text(`RFC: ${data.clientRfc}`, margin, y);
    y += 5;
  }

  y += 5;
  doc.setDrawColor(230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.text("Detalle del producto", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Proyecto: ${data.projectTitle}`, margin, y);
  y += 5;
  doc.text(`Formato: ${data.format}`, margin, y);
  y += 5;
  doc.text(`Tapa: ${data.coverType === "hard" ? "Dura" : "Blanda"}`, margin, y);
  y += 5;
  doc.text(`Páginas: ${data.totalPages}`, margin, y);

  y += 5;
  doc.setDrawColor(230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.text("Desglose", margin, y);
  y += 8;

  const fmtMxn = (v: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);

  const addRow = (label: string, value: string) => {
    doc.text(label, margin, y);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 5;
  };

  addRow(`Precio base (10 páginas)`, fmtMxn(data.basePrice));
  if (data.extraPagesCost > 0) {
    const extraPages = data.totalPages - 10;
    addRow(`Páginas extra (${extraPages})`, fmtMxn(data.extraPagesCost));
  }
  if (data.coverSurcharge > 0) {
    addRow(`Tapa dura`, fmtMxn(data.coverSurcharge));
  }

  y += 2;
  doc.setDrawColor(40);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40);
  addRow("TOTAL", fmtMxn(data.totalAmount));

  y += 15;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("PicFoto Photobooks", margin, y);
  y += 4;
  doc.text("contacto@picfoto.com", margin, y);
  y += 4;
  doc.text("Este documento no es un comprobante fiscal (CFDI).", margin, y);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
