import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { pxToMm } from "./coordinateMapper";
import { renderBackground } from "./backgroundExporter";
import type { PageBackground } from "@/types/editor";

interface ExportPage {
  photos: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }[];
  background: PageBackground;
}

interface ExportConfig {
  pages: ExportPage[];
  pageWidthPx: number;
  pageHeightPx: number;
}

export async function exportToZip(
  config: ExportConfig,
  highResImageFetcher: (photoId: string) => Promise<ArrayBuffer>,
  textureFetcher: (imagePath: string) => Promise<ArrayBuffer>
): Promise<Blob> {
  const zip = new JSZip();

  const pdf = new jsPDF({
    unit: "mm",
    format: [pxToMm(config.pageWidthPx), pxToMm(config.pageHeightPx)],
    compress: true,
  });

  const pageWmm = pxToMm(config.pageWidthPx);
  const pageHmm = pxToMm(config.pageHeightPx);

  for (let i = 0; i < config.pages.length; i++) {
    const page = config.pages[i];

    if (i > 0) pdf.addPage();

    const bg = page.background;
    const base = bg?.color;

    if (bg && bg.type === "color") {
      if (base) {
        pdf.setFillColor(base);
        pdf.rect(0, 0, pageWmm, pageHmm, "F");
      }
    } else if (bg) {
      if (base) {
        pdf.setFillColor(base);
        pdf.rect(0, 0, pageWmm, pageHmm, "F");
      }
      const rendered = await renderBackground(bg, config.pageWidthPx, config.pageHeightPx, textureFetcher);
      if (rendered) {
        pdf.addImage(rendered.dataUrl, rendered.format, 0, 0, pageWmm, pageHmm);
      }
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
