"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { FormField, FormStyles } from "../../lib/form";
import { CanvasCard } from "./CanvasCard";

type ViewMode = "desktop" | "tablet" | "mobile";

const viewModeWidths: Record<ViewMode, string> = {
  desktop: "max-w-3xl",
  tablet: "max-w-md",
  mobile: "max-w-xs",
};

export function FormCanvas({
  fields,
  selectedId,
  onSelect,
  viewMode,
  styles,
}: {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  viewMode: ViewMode;
  styles: FormStyles;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8">
      <div className={`mx-auto transition-all duration-300 ${viewModeWidths[viewMode]}`}>
        {/* Canvas Paper */}
        <div
          ref={setNodeRef}
          className={`min-h-[600px] rounded-lg shadow-lg transition-all ${
            isOver ? "ring-2 ring-sky-400 ring-offset-2" : ""
          }`}
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            fontFamily: styles.fontFamily,
            borderRadius: `${styles.borderRadius}px`,
          }}
        >
          {/* Add button at top */}
          <div className="flex justify-center py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg cursor-pointer hover:bg-sky-600 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-2xl bg-slate-100 p-6">
                  <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Start Building Your Form</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm">
                  Drag components from the right panel or choose a template from the left
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Text Input</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Dropdown</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Checkbox</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Radio</span>
                </div>
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
                      styles={styles}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
