"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { FormField, FormStyles } from "../../lib/types";
import { CardControls } from "../shared/CardControls";
import {
  FormFieldRenderer,
  DividerRenderer,
  SpacerRenderer,
  HeadingRenderer,
  ParagraphRenderer,
} from "../shared/FieldRenderer";

type CanvasCardProps = {
  field: FormField;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  styles: FormStyles;
};

export function CanvasCard({
  field,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: CanvasCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { from: "canvas", fieldId: field.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(field.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(field.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) onDuplicate(field.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveUp) onMoveUp(field.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveDown) onMoveDown(field.id);
  };

  const wrapperClasses = `group relative cursor-pointer transition ${
    selected ? "ring-2 ring-sky-400" : "hover:ring-2 hover:ring-slate-200"
  } ${isDragging ? "opacity-50" : ""}`;

  const controls = (
    <CardControls
      dragAttributes={attributes}
      dragListeners={listeners}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    />
  );

  if (field.type === "divider") {
    return (
      <div ref={setNodeRef} style={style} onClick={handleClick} className={`${wrapperClasses} p-3`}>
        {controls}
        <DividerRenderer selected={selected} />
      </div>
    );
  }

  if (field.type === "spacer") {
    return (
      <div ref={setNodeRef} style={style} onClick={handleClick} className={`${wrapperClasses} p-2`}>
        {controls}
        <SpacerRenderer selected={selected} />
      </div>
    );
  }

  if (field.type === "heading") {
    return (
      <div ref={setNodeRef} style={style} onClick={handleClick} className={`${wrapperClasses} p-2`}>
        {controls}
        <HeadingRenderer field={field} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`${wrapperClasses} p-2 ${isDragging ? "shadow-lg" : ""}`}
    >
      {controls}
      <FormFieldRenderer field={field} disabled />
    </div>
  );
}
