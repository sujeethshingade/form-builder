"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { ElementDefinition } from "../../lib/types";
import { fieldElements, pageElements } from "../../lib/elements";

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
      className={`flex items-center gap-3 border border-slate-200 bg-white px-3 py-2.5 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
        {element.icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700 truncate">{element.label}</div>
        <div className="text-xs text-slate-500 truncate">{element.description}</div>
      </div>
    </div>
  );
}

export function ElementSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const [activeTab, setActiveTab] = useState<"fields" | "page">("fields");

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
        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("fields")}
            className={`flex-1 px-3 py-4 text-sm font-medium transition cursor-pointer ${
              activeTab === "fields"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Fields
          </button>
          <button
            onClick={() => setActiveTab("page")}
            className={`flex-1 px-3 py-4 text-sm font-medium transition cursor-pointer ${
              activeTab === "page"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Page
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {(activeTab === "fields" ? fieldElements : pageElements).map((element) => (
              <ElementCard key={element.type} element={element} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
