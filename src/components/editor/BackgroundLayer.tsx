"use client";

import { Rect } from "react-konva";

interface BackgroundLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  backgroundColor?: string;
  backgroundUrl?: string;
}

export function BackgroundLayer({
  width,
  height,
  x = 0,
  y = 0,
  backgroundColor,
}: BackgroundLayerProps) {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={backgroundColor || "#ffffff"}
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
    />
  );
}
