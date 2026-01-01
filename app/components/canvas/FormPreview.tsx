"use client";

import type { FormField, FormStyles } from "../../lib/form";

function PreviewCard({ field }: { field: FormField }) {
  // Render layout elements
  if (field.type === "divider") {
    return (
      <div className="p-3">
        <div className="border-t border-slate-300" />
      </div>
    );
  }

  if (field.type === "spacer") {
    return <div className="h-12" />;
  }

  if (field.type === "heading") {
    return (
      <div className="p-2">
        <h2 className="text-2xl font-bold text-slate-900">{field.label}</h2>
      </div>
    );
  }

  if (field.type === "paragraph") {
    return (
      <div className="p-2">
        <p className="text-sm text-slate-700">
          {field.placeholder || field.label}
        </p>
      </div>
    );
  }

  // Render form fields
  return (
    <div className="p-2">
      {/* Field Label */}
      <div className="pb-2">
        <label className="block text-sm font-medium text-slate-900">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>

      {/* Field Helper */}
      {field.helper && (
        <p className="pb-2 text-xs text-slate-500">{field.helper}</p>
      )}

      {/* Field Preview */}
      <div>
        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "number" ||
          field.type === "phone" ||
          field.type === "password" ||
          field.type === "url") && (
          <input
            type="text"
            placeholder={field.placeholder || "Enter your response..."}
            disabled
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
          />
        )}

        {field.type === "textarea" && (
          <textarea
            placeholder={field.placeholder || "Enter your response..."}
            disabled
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white resize-none focus:outline-none"
          />
        )}

        {field.type === "date" && (
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            disabled
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
          />
        )}

        {field.type === "time" && (
          <input
            type="text"
            placeholder="--:-- --"
            disabled
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
          />
        )}

        {field.type === "select" && (
          <select
            disabled
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
          >
            <option>Select an option...</option>
            {(field.options || []).map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        )}

        {field.type === "checkbox" && (
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  disabled
                  className="rounded border-slate-300"
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {field.type === "radio" && (
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  disabled
                  name={field.id}
                  className="border-slate-300"
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {field.type === "file" && (
          <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white px-4 py-8 text-sm text-slate-500">
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-1">Click to upload or drag and drop</p>
            </div>
          </div>
        )}

        {field.type === "rating" && (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="h-6 w-6 text-slate-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}

        {field.type === "signature" && (
          <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white px-4 py-8 text-sm text-slate-500">
            <p>Click to sign</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function FormPreview({
  fields,
  styles,
}: {
  fields: FormField[];
  styles: FormStyles;
}) {
  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div
          className="min-h-150 bg-white shadow-lg p-8"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            fontFamily: styles.fontFamily,
          }}
        >
          {fields.length === 0 ? (
            <div>
            </div>
          ) : (
            <div className="space-y-6 pointer-events-none select-none">
              {fields.map((field) => (
                <PreviewCard key={field.id} field={field} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
