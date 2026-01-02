"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ElementDefinition } from "../../lib/types";
import { elements } from "../../lib/elements";

function ElementCard({ element }: { element: ElementDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${element.type}`,
    data: { from: "palette", type: element.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 border rounded-sm border-slate-200 bg-white px-3 py-2.5 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
        {element.icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700 truncate">{element.label}</div>
      </div>
    </div>
  );
}

export function ElementSidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside
      className={`flex h-full flex-col bg-white transition-[width] duration-300 ease-out ${
        collapsed
          ? "w-0 min-w-0 overflow-hidden border-r border-transparent"
          : "w-65 border-r border-slate-200"
      }`}
    >
      <div
        className={`flex h-full flex-col ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        } transition-opacity duration-200 ${collapsed ? "" : "delay-100"}`}
      >
        <div className="flex justify-center border-b border-slate-200 px-3 py-4">
          <h2 className="text-sm font-medium mt-0.5 text-slate-500">Components</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {elements.map((element) => (
              <ElementCard key={element.type} element={element} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
