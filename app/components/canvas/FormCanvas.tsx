"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { FormField } from "../../lib/form";
import { CanvasCard } from "./CanvasCard";

export function FormCanvas({
  fields,
  selectedId,
  onSelect,
}: {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Canvas</p>
          <h2 className="text-xl font-semibold text-slate-900">Drag components here</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          {fields.length} fields
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`mt-6 min-h-[520px] rounded-xl border border-dashed ${
          isOver ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50"
        } p-4 transition`}
      >
        {fields.length === 0 ? (
          <div className="flex h-[460px] flex-col items-center justify-center gap-2 text-sm text-slate-400">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
              Drop from the right panel
            </div>
            <p>Start with text, dropdown, or checkbox.</p>
          </div>
        ) : (
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {fields.map((field) => (
                <CanvasCard
                  key={field.id}
                  field={field}
                  selected={selectedId === field.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </section>
  );
}
