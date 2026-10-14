import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { pxToMm } from "./coordinateMapper";
import { renderBackground } from "./backgroundExporter";
import type { PageBackground } from "@/types/editor";

interface ExportPhoto {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface ExportPage {
  photos: ExportPhoto[];
  background: PageBackground;
}

export interface ExportSpread {
  left: ExportPage;
  right: ExportPage;
}

interface ExportConfig {
  /** Book pages grouped in spreads (one PDF page per spread). */
  spreads: ExportSpread[];
  pageWidthPx: number;
  pageHeightPx: number;
  /** Sangrado a corte alrededor de cada página, en px. */
  bleedPx?: number;
  /** Separación entre las dos páginas del pliego, en px. */
  gapPx?: number;
}

const BLANK_PAGE: ExportPage = {
  photos: [],
  background: { type: "color", color: "#ffffff" },
};

export async function exportToZip(
  config: ExportConfig,
  highResImageFetcher: (photoId: string) => Promise<ArrayBuffer>,
  textureFetcher: (imagePath: string) => Promise<ArrayBuffer>
): Promise<Blob> {
  const zip = new JSZip();

  const bleedPx = Math.max(0, config.bleedPx ?? 0);
  const gapPx = Math.max(0, config.gapPx ?? 0);
  const mediaWpx = config.pageWidthPx + bleedPx * 2;
  const mediaHpx = config.pageHeightPx + bleedPx * 2;
  const sheetWpx = mediaWpx * 2 + gapPx;

  const sheetWmm = pxToMm(sheetWpx);
  const sheetHmm = pxToMm(mediaHpx);
  const mediaWmm = pxToMm(mediaWpx);
  const mediaHmm = pxToMm(mediaHpx);
  const orientation = sheetWmm >= sheetHmm ? "landscape" : "portrait";

  const pdf = new jsPDF({
    unit: "mm",
    format: [sheetWmm, sheetHmm],
    orientation,
    compress: true,
  });

  const drawPage = async (
    page: ExportPage | undefined,
    offsetXpx: number,
    label: string
  ) => {
    const current = page ?? BLANK_PAGE;
    const offsetXmm = pxToMm(offsetXpx);

    const bg = current.background;
    const base = bg?.color;

    if (base) {
      pdf.setFillColor(base);
      pdf.rect(offsetXmm, 0, mediaWmm, mediaHmm, "F");
    }

    if (bg && bg.type !== "color") {
      const rendered = await renderBackground(bg, mediaWpx, mediaHpx, textureFetcher);
      if (rendered) {
        pdf.addImage(
          rendered.dataUrl,
          rendered.format,
          offsetXmm,
          0,
          mediaWmm,
          mediaHmm
        );
      }
    }

    for (const photo of current.photos) {
      const buffer = await highResImageFetcher(photo.id);
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      // Slots are expressed from the trim origin; shift into the media page.
      const x = offsetXpx + photo.x + bleedPx;
      const y = photo.y + bleedPx;
      const imgW = pxToMm(photo.width);
      const imgH = pxToMm(photo.height);
      const cx = pxToMm(x) + imgW / 2;
      const cy = pxToMm(y) + imgH / 2;

      if (photo.rotation !== 0) {
        pdf.addImage(url, "JPEG", cx - imgW / 2, cy - imgH / 2, imgW, imgH, "", "FAST");
      } else {
        pdf.addImage(url, "JPEG", pxToMm(x), pxToMm(y), imgW, imgH);
      }

      zip.file(`photo_${label}_${photo.id}.jpg`, blob);
    }
  };

  for (let i = 0; i < config.spreads.length; i++) {
    if (i > 0) pdf.addPage([sheetWmm, sheetHmm], orientation);
    const spread = config.spreads[i];
    await drawPage(spread.left, 0, `s${i + 1}l`);
    await drawPage(spread.right, mediaWpx + gapPx, `s${i + 1}r`);
  }

  const pdfBlob = pdf.output("blob");
  zip.file("photobook.pdf", pdfBlob);

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
