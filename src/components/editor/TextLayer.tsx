"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Text, Rect } from "react-konva";
import Konva from "konva";
import type { TextPlacement } from "@/types/editor";

interface TextLayerProps {
  textPlacement: TextPlacement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (
    x: number,
    y: number,
    width: number,
    height: number,
    scaleX: number,
    scaleY: number,
    rotation: number
  ) => void;
  onDblClick: () => void;
  transformerRef: React.RefObject<Konva.Transformer | null>;
}

export function TextLayer({
  textPlacement,
  isSelected,
  isEditing,
  onSelect,
  onDragEnd,
  onTransformEnd,
  onDblClick,
  transformerRef,
}: TextLayerProps) {
  const textRef = useRef<Konva.Text>(null);

  useEffect(() => {
    if (isSelected && textRef.current && transformerRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  const handleSelect = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      onSelect();
    },
    [onSelect]
  );

  const [metrics, setMetrics] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (textRef.current) {
      setMetrics({
        w: textRef.current.width(),
        h: textRef.current.height(),
      });
    }
  }, [textPlacement.text, textPlacement.fontSize, textPlacement.width, textPlacement.fontStyle, textPlacement.fontFamily]);

  const showBorder = isSelected && !isEditing;

  return (
    <>
      {showBorder && (
        <Rect
          x={textPlacement.x - 6}
          y={textPlacement.y - 6}
          width={metrics.w + 12}
          height={metrics.h + 12}
          stroke="#3b82f6"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
          rotation={textPlacement.rotation}
        />
      )}
      <Text
        ref={textRef}
        text={textPlacement.text}
        x={textPlacement.x}
        y={textPlacement.y}
        width={textPlacement.width || undefined}
        fontSize={textPlacement.fontSize}
        fontFamily={textPlacement.fontFamily}
        fontStyle={textPlacement.fontStyle}
        fill={textPlacement.fill}
        align={textPlacement.align}
        rotation={textPlacement.rotation}
        draggable
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={onDblClick}
        onDblTap={onDblClick}
        onDragEnd={(e) => {
          onDragEnd(e.target.x(), e.target.y());
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          onTransformEnd(
            node.x(),
            node.y(),
            node.width() * node.scaleX(),
            node.height() * node.scaleY(),
            node.scaleX(),
            node.scaleY(),
            node.rotation()
          );
        }}
      />
    </>
  );
}
