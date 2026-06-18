"use client";

import { Rect } from "react-konva";

interface BackgroundLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundUrl?: string;
}

export function BackgroundLayer({
  width,
  height,
  backgroundColor,
}: BackgroundLayerProps) {
  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill={backgroundColor || "#ffffff"}
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
    />
  );
}
