"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { FormField, FormStyles } from "../../lib/form";
import { CanvasCard } from "./CanvasCard";

export function FormCanvas({
  fields,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  styles,
}: {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  styles: FormStyles;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8" onClick={handleBackgroundClick}>
      <div className="mx-auto max-w-3xl">
        {/* Canvas Paper */}
        <div
          ref={setNodeRef}
          onClick={handleBackgroundClick}
          className={`min-h-150 bg-white shadow-lg transition-all p-8 ${
            isOver ? "ring-2 ring-sky-400 ring-offset-2" : ""
          }`}
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            fontFamily: styles.fontFamily,
          }}
        >
            {fields.length === 0 ? (
              <div className="flex items-center justify-center py-16" />
            ) : (
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {fields.map((field, index) => (
                <CanvasCard
                  key={field.id}
                  field={field}
                  selected={selectedId === field.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < fields.length - 1}
                  styles={styles}
                />
                ))}
              </div>
              </SortableContext>
            )}
        </div>
      </div>
    </div>
  );
}
