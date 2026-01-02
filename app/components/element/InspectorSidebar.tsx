"use client";

import type { FormField } from "../../lib/types";
import { TrashIcon, CursorIcon } from "../../lib/icons";

type InspectorPanelProps = {
  selectedField: FormField | null;
  onUpdate: (patch: Partial<FormField>) => void;
  onDelete: () => void;
};

const placeholderTypes = ["text", "email", "number", "url", "location", "date"];
const optionTypes = ["checkbox", "radio"];
const layoutTypes = ["heading", "divider", "spacer"];
const noRequiredTypes = ["heading", "divider", "spacer", "table"];
const headingTypes = ["heading"];

export function InspectorPanel({
  selectedField,
  onUpdate,
  onDelete,
}: InspectorPanelProps) {
  if (!selectedField) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 p-4">
          <CursorIcon className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">No field selected</p>
        <p className="mt-2 text-xs text-slate-500">Click on a field in the canvas to edit it</p>
      </div>
    );
  }

  const showPlaceholder = placeholderTypes.includes(selectedField.type);
  const showOptions = optionTypes.includes(selectedField.type);
  const showHelper = !layoutTypes.includes(selectedField.type);
  const showRequired = !noRequiredTypes.includes(selectedField.type);
  const placeholderLabel = headingTypes.includes(selectedField.type) ? "Content" : "Placeholder";

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
          <span className="capitalize">{selectedField.type}</span>
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
          title="Delete field"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Label
        </label>
        <input
          type="text"
          className="w-full border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={selectedField.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {showPlaceholder && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {placeholderLabel}
          </label>
          <input
            type="text"
            className="w-full border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={selectedField.placeholder ?? ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      )}

      {showOptions && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Options
          </label>
          <textarea
            className="w-full h-28 border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
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
        </div>
      )}

      {showHelper && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Helper Text
          </label>
          <input
            type="text"
            className="w-full border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Additional instructions..."
            value={selectedField.helper ?? ""}
            onChange={(e) => onUpdate({ helper: e.target.value })}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Width
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ width: "full" })}
            className={`flex-1 border px-3 py-2 text-sm font-medium transition ${
              selectedField.width !== "half"
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Full Width
          </button>
          <button
            onClick={() => onUpdate({ width: "half" })}
            className={`flex-1 border px-3 py-2 text-sm font-medium transition ${
              selectedField.width === "half"
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Half Width
          </button>
        </div>
      </div>

      {showRequired && (
        <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Required</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!selectedField.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            <div className="peer h-6 w-11 bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:bg-white after:shadow after:transition-all peer-checked:bg-sky-500 peer-checked:after:translate-x-full" />
          </label>
        </div>
      )}
    </div>
  );
}
