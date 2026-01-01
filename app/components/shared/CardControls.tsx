"use client";

import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { DraggableAttributes } from "@dnd-kit/core/dist/hooks/useDraggable";
import { DragHandleIcon, ArrowUpIcon, ArrowDownIcon, DuplicateIcon, TrashIcon } from "../../lib/icons";

type CardControlsProps = {
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  onMoveUp?: (e: React.MouseEvent) => void;
  onMoveDown?: (e: React.MouseEvent) => void;
  onDuplicate?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export function CardControls({
  dragAttributes,
  dragListeners,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
}: CardControlsProps) {
  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
      <div
        {...dragAttributes}
        {...dragListeners}
        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <DragHandleIcon />
      </div>
      
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className={`p-1.5 rounded ${
          canMoveUp
            ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            : "text-slate-300 cursor-not-allowed"
        }`}
        title="Move up"
      >
        <ArrowUpIcon />
      </button>
      
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className={`p-1.5 rounded ${
          canMoveDown
            ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            : "text-slate-300 cursor-not-allowed"
        }`}
        title="Move down"
      >
        <ArrowDownIcon />
      </button>
      
      <button
        onClick={onDuplicate}
        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded"
        title="Duplicate"
      >
        <DuplicateIcon />
      </button>
      
      <button
        onClick={onDelete}
        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
        title="Delete"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
