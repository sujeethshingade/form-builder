"use client";

import { useDraggable } from "@dnd-kit/core";
import type { LibraryItem } from "../../lib/form";

function LibraryCard({ item }: { item: LibraryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { from: "palette", type: item.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center justify-center gap-2 border border-slate-200 bg-white p-3 cursor-grab transition hover:border-sky-300 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400" : ""
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-lg">
        {item.icon}
      </div>
      <span className="text-xs font-medium text-slate-600 text-center">{item.label}</span>
    </div>
  );
}

export function LibraryPanel({ items }: { items: LibraryItem[] }) {
  const inputFields = items.filter((i) => i.category === "input");
  const choiceFields = items.filter((i) => i.category === "choice");
  const layoutFields = items.filter((i) => i.category === "layout");
  const advancedFields = items.filter((i) => i.category === "advanced");

  return (
    <div className="p-4 space-y-6">
      {/* Input Fields */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Input Fields</h3>
        <div className="grid grid-cols-2 gap-2">
          {inputFields.map((item) => (
            <LibraryCard key={item.type} item={item} />
          ))}
        </div>
      </div>

      {/* Choice Fields */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Choice Fields</h3>
        <div className="grid grid-cols-2 gap-2">
          {choiceFields.map((item) => (
            <LibraryCard key={item.type} item={item} />
          ))}
        </div>
      </div>

      {/* Layout Elements */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Layout</h3>
        <div className="grid grid-cols-2 gap-2">
          {layoutFields.map((item) => (
            <LibraryCard key={item.type} item={item} />
          ))}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Advanced</h3>
        <div className="grid grid-cols-2 gap-2">
          {advancedFields.map((item) => (
            <LibraryCard key={item.type} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
