"use client";

import { useDraggable } from "@dnd-kit/core";
import type { LibraryItem } from "../../lib/form";

function LibraryCard({ item }: { item: LibraryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}-${item.label}`,
    data: { from: "palette", type: item.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="text-sm font-semibold text-slate-900">{item.label}</div>
      <p className="text-xs text-slate-500">{item.description}</p>
      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-slate-600">
        Drag to canvas
      </div>
    </div>
  );
}

export function LibraryPanel({ items }: { items: LibraryItem[] }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Components</p>
          <h2 className="text-lg font-semibold text-slate-900">Library</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          Drag & drop
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <LibraryCard key={item.type} item={item} />
        ))}
      </div>
    </aside>
  );
}
