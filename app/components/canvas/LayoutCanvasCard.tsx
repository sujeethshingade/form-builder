"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CardControls } from "../shared/CardControls";
import {
  FormFieldRenderer,
  DividerRenderer,
  SpacerRenderer,
  HeadingRenderer,
  TableRenderer,
  GridLayoutRenderer,
  BoxLayoutRenderer,
  FormGroupRenderer,
} from "../shared/FieldRenderer";
import type { FormField } from "../../lib/types";

export interface LayoutField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  widthColumns?: number;
  customFieldId?: string;
  lovItems?: any[];
  items?: any[];
  isLayout?: boolean;
  layoutType?: "grid-layout" | "box-layout" | "form-group";
  layoutId?: string;
  layoutConfig?: any;
  height?: string;
  tag?: string;
  align?: string;
  description?: string;
  tableColumns?: any[];
  tableRows?: any[];
  columns?: any[];
}

type LayoutCanvasCardProps = {
  field: LayoutField;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onUpdateWidth?: (id: string, width: number) => void;
  onAddBox?: (fieldId: string) => void;
  disabled?: boolean;
};

export function LayoutCanvasCard({
  field,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  onAddBox,
  disabled = false,
}: LayoutCanvasCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { from: "canvas-field", fieldId: field.id },
    disabled,
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

  const columnSpan = field.widthColumns || 12;
  const isLayoutField = field.isLayout || field.type === "grid-layout" || field.type === "box-layout" || field.type === "form-group";

  const wrapperClasses = `group relative cursor-pointer transition ${
    selected ? "ring-2 ring-sky-400" : "hover:ring-2 hover:ring-slate-200"
  } ${isDragging ? "opacity-50" : ""}`;

  const gridStyle = {
    gridColumn: `span ${columnSpan} / span ${columnSpan}`,
  };

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

  // Convert LayoutField to FormField for the renderer
  const formField: FormField = {
    id: field.id,
    type: field.type as any,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    widthColumns: field.widthColumns,
    items: field.items,
    customFieldId: field.customFieldId,
    lovItems: field.lovItems,
    height: field.height,
    tag: field.tag as any,
    align: field.align as any,
    description: field.description,
    tableColumns: field.tableColumns,
    tableRows: field.tableRows,
    columns: field.columns,
  };

  // For layout fields (nested grid-layout, box-layout, or form-group)
  if (isLayoutField) {
    const layoutType = field.layoutType || field.type;
    
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, ...gridStyle }}
        onClick={handleClick}
        className={`${wrapperClasses} p-2 ${isDragging ? "shadow-lg" : ""}`}
      >
        {controls}
        {layoutType === "grid-layout" ? (
          <GridLayoutRenderer label={field.label} config={field.layoutConfig} />
        ) : layoutType === "form-group" ? (
          <FormGroupRenderer label={field.label} config={field.layoutConfig} />
        ) : (
          <BoxLayoutRenderer 
            label={field.label} 
            config={field.layoutConfig} 
            onAddBox={onAddBox ? () => onAddBox(field.id) : undefined}
          />
        )}
      </div>
    );
  }

  // Special handling for divider
  if (field.type === "divider") {
    return (
      <div ref={setNodeRef} style={{ ...style, ...gridStyle }} onClick={handleClick} className={`${wrapperClasses} p-3`}>
        {controls}
        <DividerRenderer selected={selected} />
      </div>
    );
  }

  // Special handling for spacer
  if (field.type === "spacer") {
    return (
      <div ref={setNodeRef} style={{ ...style, ...gridStyle }} onClick={handleClick} className={`${wrapperClasses} p-2`}>
        {controls}
        <SpacerRenderer field={formField} selected={selected} />
      </div>
    );
  }

  // Special handling for heading
  if (field.type === "heading") {
    return (
      <div ref={setNodeRef} style={{ ...style, ...gridStyle }} onClick={handleClick} className={`${wrapperClasses} p-2`}>
        {controls}
        <HeadingRenderer field={formField} />
      </div>
    );
  }

  // Special handling for table
  if (field.type === "table") {
    return (
      <div ref={setNodeRef} style={{ ...style, ...gridStyle }} onClick={handleClick} className={`${wrapperClasses} p-2`}>
        {controls}
        <div className="pb-2">
          <label className="block text-sm font-medium text-slate-900">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-slate-500">{field.description}</p>
          )}
        </div>
        <TableRenderer field={formField} disabled={false} preview={false} />
      </div>
    );
  }

  // Default: use FormFieldRenderer for all other field types
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...gridStyle }}
      onClick={handleClick}
      className={`${wrapperClasses} p-2 ${isDragging ? "shadow-lg" : ""}`}
    >
      {controls}
      <FormFieldRenderer field={formField} disabled />
    </div>
  );
}
