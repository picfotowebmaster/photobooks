"use client";

import { Group, Rect, Line } from "react-konva";
import { calculateGridLines, type GridConfig } from "@/lib/editor/gridConfig";
import { mmToPx } from "@/lib/editor/coordinateMapper";
import { TEMPLATE_BLEED_MM } from "@/lib/editor/templateCatalog";

interface GridOverlayProps {
  pageWidth: number;
  pageHeight: number;
  gridConfig: GridConfig;
  rightPageX: number;
  /** Sangrado a corte en px (banda física fuera del trim). */
  bleedPx?: number;
}

/* ── Colour tokens (match reference image) ───────────────── */
const BLEED_FILL = "rgba(255, 120, 120, 0.12)";
const SAFE_STROKE = "rgba(0, 210, 210, 0.50)";
const GRID_STROKE = "rgba(0, 210, 210, 0.30)";
const CUT_STROKE = "rgba(239, 68, 68, 0.65)";
const SPINE_STROKE = "rgba(0, 0, 0, 0.18)";

const LINE_WIDTH = 2;
const SAFE_LINE_WIDTH = 2;

/**
 * Renders the grid overlay for a single page at the given x-offset.
 * The bleed band is drawn OUTSIDE the trim (physical sangrado), and the cut
 * line is the trim rectangle itself.
 */
function PageGrid({
  offsetX,
  pageWidth,
  pageHeight,
  gridConfig,
  bleedPx,
}: {
  offsetX: number;
  pageWidth: number;
  pageHeight: number;
  gridConfig: GridConfig;
  bleedPx: number;
}) {
  const { safePx, columnXs, rowYs } = calculateGridLines(
    gridConfig,
    pageWidth,
    pageHeight
  );

  return (
    <Group x={offsetX} listening={false}>
      {/* ── Bleed band (outside the trim) ─────────────────── */}
      {gridConfig.showBleed && bleedPx > 0 && (
        <>
          <Rect
            x={-bleedPx}
            y={-bleedPx}
            width={pageWidth + bleedPx * 2}
            height={bleedPx}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          <Rect
            x={-bleedPx}
            y={pageHeight}
            width={pageWidth + bleedPx * 2}
            height={bleedPx}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          <Rect
            x={-bleedPx}
            y={0}
            width={bleedPx}
            height={pageHeight}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          <Rect
            x={pageWidth}
            y={0}
            width={bleedPx}
            height={pageHeight}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
        </>
      )}

      {/* ── Cut line (trim) ───────────────────────────────── */}
      <Rect
        x={0}
        y={0}
        width={pageWidth}
        height={pageHeight}
        stroke={CUT_STROKE}
        strokeWidth={LINE_WIDTH}
        perfectDrawEnabled={false}
      />

      {/* ── Safe Zone ─────────────────────────────────────── */}
      {gridConfig.showSafeZone && (
        <Rect
          x={safePx}
          y={safePx}
          width={pageWidth - safePx * 2}
          height={pageHeight - safePx * 2}
          stroke={SAFE_STROKE}
          strokeWidth={SAFE_LINE_WIDTH}
          perfectDrawEnabled={false}
        />
      )}

      {/* ── Column dividers ───────────────────────────────── */}
      {gridConfig.showGrid &&
        columnXs.map((cx, i) => (
          <Line
            key={`col-${i}`}
            points={[cx, safePx, cx, pageHeight - safePx]}
            stroke={GRID_STROKE}
            strokeWidth={LINE_WIDTH}
            perfectDrawEnabled={false}
          />
        ))}

      {/* ── Row dividers ──────────────────────────────────── */}
      {gridConfig.showGrid &&
        rowYs.map((ry, i) => (
          <Line
            key={`row-${i}`}
            points={[safePx, ry, pageWidth - safePx, ry]}
            stroke={GRID_STROKE}
            strokeWidth={LINE_WIDTH}
            perfectDrawEnabled={false}
          />
        ))}
    </Group>
  );
}

/**
 * Full grid overlay for a two-page spread.
 * Renders both pages' grids + the spine line.
 * Must be placed inside a Konva `<Layer listening={false}>`.
 */
export function GridOverlay({
  pageWidth,
  pageHeight,
  gridConfig,
  rightPageX,
  bleedPx = mmToPx(TEMPLATE_BLEED_MM),
}: GridOverlayProps) {
  const anyVisible =
    gridConfig.showBleed ||
    gridConfig.showSafeZone ||
    gridConfig.showGrid ||
    gridConfig.showSpine;

  if (!anyVisible) return null;

  return (
    <Group listening={false}>
      {/* Left page */}
      <PageGrid
        offsetX={0}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        gridConfig={gridConfig}
        bleedPx={bleedPx}
      />

      {/* Right page */}
      <PageGrid
        offsetX={rightPageX}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        gridConfig={gridConfig}
        bleedPx={bleedPx}
      />

      {/* ── Spine (centre line between pages) ────────────── */}
      {gridConfig.showSpine && (
        <Line
          points={[
            pageWidth + (rightPageX - pageWidth) / 2,
            0,
            pageWidth + (rightPageX - pageWidth) / 2,
            pageHeight,
          ]}
          stroke={SPINE_STROKE}
          strokeWidth={LINE_WIDTH}
          dash={[12, 6]}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
}
