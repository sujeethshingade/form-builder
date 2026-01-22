"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { LayoutCanvasCard, LayoutField } from "./LayoutCanvasCard";

type LayoutCanvasProps = {
  fields: LayoutField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onUpdateWidth?: (id: string, width: number) => void;
  onAddBox?: (fieldId: string) => void;
  droppableId: string;
  emptyMessage?: string;
};

export function LayoutCanvas({
  fields,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onUpdateWidth,
  onAddBox,
  droppableId,
  emptyMessage = "",
}: LayoutCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      onClick={handleBackgroundClick}
      className={`min-h-150 bg-white shadow-lg transition-all p-6 ${
        isOver ? "ring-2 ring-sky-400 ring-offset-2" : ""
      }`}
    >
      {fields.length === 0 ? (
        <p className="text-center text-slate-500">{emptyMessage}</p>
      ) : (
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-12 gap-4" onClick={handleBackgroundClick}>
            {fields.map((field, index) => (
              <LayoutCanvasCard
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
                onUpdateWidth={onUpdateWidth}
                onAddBox={onAddBox}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
