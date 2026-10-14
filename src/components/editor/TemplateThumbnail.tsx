"use client";

import { memo } from "react";
import type { TemplateSlot } from "@/types/editor";

interface TemplateThumbnailProps {
  slots: TemplateSlot[];
  pageWidth: number;
  pageHeight: number;
}

/** Bleed (sangrado a corte) in canvas px at 300 dpi, matches TEMPLATE_BLEED_MM. */
const BLEED_PX = (3 / 25.4) * 300;

const SLOT_FILL = "rgba(107,114,128,0.20)";
const SLOT_STROKE = "rgba(75,85,99,0.55)";
const CUT_STROKE = "rgba(239,68,68,0.85)";

/**
 * Small schematic preview of a template. Draws the physical page (trim + bleed),
 * the photo slots and the cut line (rebase).
 */
export const TemplateThumbnail = memo(function TemplateThumbnail({
  slots,
  pageWidth,
  pageHeight,
}: TemplateThumbnailProps) {
  const isSpread = slots.some((slot) => slot.page !== undefined || slot.span);
  const bleed = Math.min(BLEED_PX, pageWidth * 0.06, pageHeight * 0.06);
  const gap = pageWidth * 0.04;
  const mediaWidth = pageWidth + bleed * 2;
  const rightPageX = pageWidth + bleed * 2 + gap;
  const viewWidth = isSpread ? rightPageX + mediaWidth : mediaWidth;
  const viewHeight = pageHeight + bleed * 2;

  const pageX = (page: 0 | 1 | undefined) =>
    page === 1 ? rightPageX : 0;

  const stroke = pageWidth * 0.006;
  const radius = pageWidth * 0.012;

  return (
    <svg
      viewBox={`${-bleed} ${-bleed} ${viewWidth} ${viewHeight}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Media (trim + bleed) */}
      <rect
        x={-bleed}
        y={-bleed}
        width={mediaWidth}
        height={viewHeight}
        fill="#ffffff"
        stroke="#d4d4d4"
        strokeWidth={stroke}
        rx={radius}
      />
      {isSpread && (
        <rect
          x={rightPageX - bleed}
          y={-bleed}
          width={mediaWidth}
          height={viewHeight}
          fill="#ffffff"
          stroke="#d4d4d4"
          strokeWidth={stroke}
          rx={radius}
        />
      )}

      {/* Cut line (trim) — the rebase is everything outside it */}
      <rect
        x={0}
        y={0}
        width={pageWidth}
        height={pageHeight}
        fill="none"
        stroke={CUT_STROKE}
        strokeWidth={stroke}
        strokeDasharray={`${stroke * 4} ${stroke * 3}`}
        opacity={0.7}
      />
      {isSpread && (
        <rect
          x={rightPageX}
          y={0}
          width={pageWidth}
          height={pageHeight}
          fill="none"
          stroke={CUT_STROKE}
          strokeWidth={stroke}
          strokeDasharray={`${stroke * 4} ${stroke * 3}`}
          opacity={0.7}
        />
      )}

      {/* Slots (bleed slots already reach the media edge) */}
      {slots.map((slot, index) => {
        const x = slot.span === "spread" ? slot.x : pageX(slot.page) + slot.x;
        const iconSize = Math.min(slot.w, slot.h) * 0.24;
        const iconX = x + (slot.w - iconSize) / 2;
        const iconY = slot.y + (slot.h - iconSize) / 2;
        const iconStroke = Math.max(iconSize * 0.07, stroke * 1.4);
        return (
          <g key={index} fill="none" stroke="#6b7280" strokeWidth={iconStroke}>
            <rect
              x={x}
              y={slot.y}
              width={slot.w}
              height={slot.h}
              fill={SLOT_FILL}
              stroke={SLOT_STROKE}
              strokeWidth={stroke}
              rx={radius}
            />
            <rect
              x={iconX + iconSize * 0.08}
              y={iconY + iconSize * 0.15}
              width={iconSize * 0.84}
              height={iconSize * 0.7}
              rx={iconSize * 0.09}
            />
            <circle
              cx={iconX + iconSize * 0.34}
              cy={iconY + iconSize * 0.36}
              r={iconSize * 0.08}
            />
            <path
              d={`M ${iconX + iconSize * 0.14} ${iconY + iconSize * 0.75}
                L ${iconX + iconSize * 0.39} ${iconY + iconSize * 0.51}
                L ${iconX + iconSize * 0.55} ${iconY + iconSize * 0.65}
                L ${iconX + iconSize * 0.68} ${iconY + iconSize * 0.53}
                L ${iconX + iconSize * 0.87} ${iconY + iconSize * 0.73}`}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
});
