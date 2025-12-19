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
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Inspector</p>
          <h2 className="text-lg font-semibold text-slate-900">Field settings</h2>
        </div>
        {selectedField ? (
          <button
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300"
            onClick={onDelete}
          >
            Delete
          </button>
        ) : null}
      </div>

      {selectedField ? (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Label
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              value={selectedField.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Placeholder
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              value={selectedField.placeholder ?? ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
            />
          </div>

          {(selectedField.type === "select" ||
            selectedField.type === "checkbox" ||
            selectedField.type === "radio") && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Options (one per line)
              </label>
              <textarea
                className="mt-2 h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
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

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Helper text
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              value={selectedField.helper ?? ""}
              onChange={(e) => onUpdate({ helper: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Required</p>
              <p className="text-xs text-slate-500">Must be answered before submit</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={!!selectedField.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
              />
              <div className="peer h-6 w-11 rounded-full border border-slate-200 bg-slate-200 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-sky-400 peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Select a field on the canvas to edit its settings.</p>
      )}
    </aside>
  );
}
