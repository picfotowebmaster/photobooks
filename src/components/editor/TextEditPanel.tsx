"use client";

import { useEffect, useRef, useCallback } from "react";
import type { TextPlacement } from "@/types/editor";

interface TextEditPanelProps {
  textPlacement: TextPlacement;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function TextEditPanel({
  textPlacement,
  onSave,
  onCancel,
}: TextEditPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const originalTextRef = useRef(textPlacement.text);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, []);

  const commit = useCallback(() => {
    const value = textareaRef.current?.value ?? "";
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  }, [onSave, onCancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [commit, onCancel]
  );

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-[400px] overflow-hidden">
      <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">
          Editar texto
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={commit}
            className="px-3 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        defaultValue={textPlacement.text}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[100px] px-4 py-3 text-base leading-relaxed resize-y outline-none"
        style={{
          fontFamily: textPlacement.fontFamily,
          color: textPlacement.fill,
          fontSize: 16,
        }}
        placeholder="Escribe aquí..."
      />
    </div>
  );
}
