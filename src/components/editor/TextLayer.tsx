"use client";

import { useState, useEffect, useRef } from "react";
import { Text, Transformer } from "react-konva";
import Konva from "konva";

interface TextLayerProps {
  id: string;
  initialText?: string;
  x: number;
  y: number;
  onUpdate?: (id: string, x: number, y: number, text: string) => void;
}

export function TextLayer({
  id,
  initialText = "Tu texto",
  x,
  y,
  onUpdate,
}: TextLayerProps) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isEditing && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isEditing]);

  return (
    <>
      <Text
        ref={textRef}
        text={text}
        x={x}
        y={y}
        fontSize={24}
        fontFamily="sans-serif"
        fill="#333333"
        draggable
        onDblClick={() => setIsEditing(true)}
        onDblTap={() => setIsEditing(true)}
        onDragEnd={(e) => {
          onUpdate?.(id, e.target.x(), e.target.y(), text);
        }}
      />
      {isEditing && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}
