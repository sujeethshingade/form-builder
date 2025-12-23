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
  onMoveUp,
  onMoveDown,
  styles,
}: {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete?: (id: string) => void;
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
      <div className={`mx-auto transition-all duration-300`}>
        {/* Canvas Paper */}
        <div
          ref={setNodeRef}
          onClick={handleBackgroundClick}
          className={`min-h-150 shadow-lg transition-all ${
            isOver ? "ring-2 ring-sky-400 ring-offset-2" : ""
          }`}
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            fontFamily: styles.fontFamily,
          }}
        >

            <div className="px-8 pb-8">
            {fields.length === 0 ? (
              <div className="flex items-center justify-center py-16" />
            ) : (
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.map((field, index) => (
                <CanvasCard
                  key={field.id}
                  field={field}
                  selected={selectedId === field.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
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
    </div>
  );
}
