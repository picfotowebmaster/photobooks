import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { pxToMm } from "./coordinateMapper";
import type { PageTemplate } from "@/types/editor";

interface ExportPage {
  photos: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }[];
  template: PageTemplate;
}

interface ExportConfig {
  pages: ExportPage[];
  pageWidthPx: number;
  pageHeightPx: number;
}

export async function exportToZip(
  config: ExportConfig,
  highResImageFetcher: (photoId: string) => Promise<ArrayBuffer>
): Promise<Blob> {
  const zip = new JSZip();

  const pdf = new jsPDF({
    unit: "mm",
    format: [pxToMm(config.pageWidthPx), pxToMm(config.pageHeightPx)],
    compress: true,
  });

  for (let i = 0; i < config.pages.length; i++) {
    const page = config.pages[i];

    if (i > 0) pdf.addPage();

    if (page.template.backgroundColor) {
      pdf.setFillColor(page.template.backgroundColor);
      pdf.rect(
        0,
        0,
        pxToMm(config.pageWidthPx),
        pxToMm(config.pageHeightPx),
        "F"
      );
    }

    if (page.template.backgroundUrl) {
      pdf.addImage(
        page.template.backgroundUrl,
        "JPEG",
        0,
        0,
        pxToMm(config.pageWidthPx),
        pxToMm(config.pageHeightPx)
      );
    }

    for (const photo of page.photos) {
      const buffer = await highResImageFetcher(photo.id);
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      const imgW = pxToMm(photo.width);
      const imgH = pxToMm(photo.height);
      const cx = pxToMm(photo.x) + imgW / 2;
      const cy = pxToMm(photo.y) + imgH / 2;

      if (photo.rotation !== 0) {
        pdf.addImage(url, "JPEG", cx - imgW / 2, cy - imgH / 2, imgW, imgH, "", "FAST");
      } else {
        pdf.addImage(url, "JPEG", pxToMm(photo.x), pxToMm(photo.y), imgW, imgH);
      }

      zip.file(`page_${String(i + 1).padStart(2, "0")}_photo_${photo.id}.jpg`, blob);
    }
  }

  const pdfBlob = pdf.output("blob");
  zip.file("photobook.pdf", pdfBlob);

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
