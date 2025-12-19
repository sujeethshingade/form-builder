"use client";

import type { FormField } from "../../lib/form";

export function InspectorPanel({
  selectedField,
  onUpdate,
  onDelete,
}: {
  selectedField: FormField | null;
  onUpdate: (patch: Partial<FormField>) => void;
  onDelete: () => void;
}) {
  if (!selectedField) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No field selected</p>
        <p className="mt-1 text-xs text-slate-500">Click on a field in the canvas to edit it</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Field Type Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
          <span className="capitalize">{selectedField.type}</span>
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
          title="Delete field"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Label
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={selectedField.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {/* Placeholder */}
      {["text", "email", "number", "phone", "textarea", "heading", "paragraph"].includes(selectedField.type) && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {selectedField.type === "heading" || selectedField.type === "paragraph" ? "Content" : "Placeholder"}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={selectedField.placeholder ?? ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Options */}
      {["select", "checkbox", "radio"].includes(selectedField.type) && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Options
          </label>
          <textarea
            className="w-full h-28 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            placeholder="Enter one option per line"
            value={(selectedField.options ?? []).join("\n")}
            onChange={(e) =>
              onUpdate({
                options: e.target.value
                  .split("\n")
                  .map((opt) => opt.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="mt-1.5 text-xs text-slate-500">One option per line</p>
        </div>
      )}

      {/* Helper Text */}
      {!["heading", "paragraph", "divider", "spacer"].includes(selectedField.type) && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Helper Text
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Additional instructions..."
            value={selectedField.helper ?? ""}
            onChange={(e) => onUpdate({ helper: e.target.value })}
          />
        </div>
      )}

      {/* Width */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Width
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ width: "full" })}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectedField.width !== "half"
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Full Width
          </button>
          <button
            onClick={() => onUpdate({ width: "half" })}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectedField.width === "half"
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Half Width
          </button>
        </div>
      </div>

      {/* Required Toggle */}
      {!["heading", "paragraph", "divider", "spacer"].includes(selectedField.type) && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Required</p>
            <p className="text-xs text-slate-500">Field must be filled</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!selectedField.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-sky-500 peer-checked:after:translate-x-full" />
          </label>
        </div>
      )}
    </div>
  );
}
