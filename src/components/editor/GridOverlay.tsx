"use client";

import { Group, Rect, Line } from "react-konva";
import { calculateGridLines, type GridConfig } from "@/lib/editor/gridConfig";

interface GridOverlayProps {
  pageWidth: number;
  pageHeight: number;
  gridConfig: GridConfig;
  rightPageX: number;
}

/* ── Colour tokens (match reference image) ───────────────── */
const BLEED_FILL = "rgba(255, 120, 120, 0.12)";
const BLEED_STROKE = "rgba(255, 100, 100, 0.55)";
const SAFE_STROKE = "rgba(0, 210, 210, 0.50)";
const GRID_STROKE = "rgba(0, 210, 210, 0.30)";
const SPINE_STROKE = "rgba(0, 0, 0, 0.18)";

const LINE_WIDTH = 2;
const SAFE_LINE_WIDTH = 2;

/**
 * Renders the grid overlay for a single page.
 * Drawn at the given x‑offset so we can reuse it for left & right pages.
 */
function PageGrid({
  offsetX,
  pageWidth,
  pageHeight,
  gridConfig,
}: {
  offsetX: number;
  pageWidth: number;
  pageHeight: number;
  gridConfig: GridConfig;
}) {
  const { bleedPx, safePx, columnXs, rowYs } = calculateGridLines(
    gridConfig,
    pageWidth,
    pageHeight
  );

  return (
    <Group x={offsetX} listening={false}>
      {/* ── Cut Zone (bleed) ──────────────────────────────── */}
      {gridConfig.showBleed && (
        <>
          {/* Top bleed strip */}
          <Rect
            x={0}
            y={0}
            width={pageWidth}
            height={bleedPx}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          {/* Bottom bleed strip */}
          <Rect
            x={0}
            y={pageHeight - bleedPx}
            width={pageWidth}
            height={bleedPx}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          {/* Left bleed strip */}
          <Rect
            x={0}
            y={bleedPx}
            width={bleedPx}
            height={pageHeight - bleedPx * 2}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          {/* Right bleed strip */}
          <Rect
            x={pageWidth - bleedPx}
            y={bleedPx}
            width={bleedPx}
            height={pageHeight - bleedPx * 2}
            fill={BLEED_FILL}
            perfectDrawEnabled={false}
          />
          {/* Bleed outline */}
          <Rect
            x={bleedPx}
            y={bleedPx}
            width={pageWidth - bleedPx * 2}
            height={pageHeight - bleedPx * 2}
            stroke={BLEED_STROKE}
            strokeWidth={LINE_WIDTH}
            perfectDrawEnabled={false}
          />
        </>
      )}

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
      />

      {/* Right page */}
      <PageGrid
        offsetX={rightPageX}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        gridConfig={gridConfig}
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
