"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { FormField } from "../../lib/form";

export function CanvasCard({
  field,
  selected,
  onSelect,
}: {
  field: FormField;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
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

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-sky-400 ring-2 ring-sky-100" : "border-slate-200"
      } ${isDragging ? "opacity-60" : ""}`}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(field.id)}
    >
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
        <span>{field.type}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">Drag</span>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-slate-900">{field.label}</h3>
      {field.helper ? (
        <p className="text-xs text-slate-500">{field.helper}</p>
      ) : null}
      <div className="mt-3 text-sm text-slate-600">
        {field.type === "text" || field.type === "textarea" ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-slate-400">
            {field.placeholder || "Placeholder"}
          </div>
        ) : (
          <ul className="space-y-1 text-slate-600">
            {(field.options ?? []).map((opt) => (
              <li key={opt} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-slate-300" />
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
