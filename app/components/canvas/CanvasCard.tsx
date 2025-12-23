"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { FormField, FormStyles } from "../../lib/form";

const fieldIcons: Record<string, string> = {
  text: "T",
  email: "@",
  number: "#",
  phone: "📞",
  textarea: "¶",
  select: "▼",
  checkbox: "☑",
  radio: "◉",
  date: "📅",
  time: "⏰",
  file: "📎",
  rating: "★",
  signature: "✍",
  heading: "H",
  paragraph: "≡",
  divider: "—",
  spacer: "⬚",
};

export function CanvasCard({
  field,
  selected,
  onSelect,
  styles,
}: {
  field: FormField;
  selected: boolean;
  onSelect: (id: string) => void;
  styles: FormStyles;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { from: "canvas", fieldId: field.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Render layout elements differently
  if (field.type === "divider") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onSelect(field.id)}
        className={`group relative cursor-pointer py-4 ${isDragging ? "opacity-50" : ""}`}
      >
        <div className={`border-t border-slate-300 ${selected ? "border-sky-500" : ""}`} />
        {selected && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-1 bg-sky-500" />
        )}
      </div>
    );
  }

  if (field.type === "spacer") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onSelect(field.id)}
        className={`group relative cursor-pointer ${isDragging ? "opacity-50" : ""}`}
      >
        <div className={`h-12 border-2 border-dashed ${selected ? "border-sky-400 bg-sky-50" : "border-slate-200"}`} />
        {selected && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-1 bg-sky-500" />
        )}
      </div>
    );
  }

  if (field.type === "heading") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onSelect(field.id)}
        className={`group relative cursor-pointer p-3 transition ${
          selected ? "ring-2 ring-sky-500 ring-offset-2" : "hover:bg-slate-50"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        <h2 className="text-xl font-bold" style={{ color: styles.textColor }}>
          {field.label}
        </h2>
        {selected && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500" />
        )}
      </div>
    );
  }

  if (field.type === "paragraph") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onSelect(field.id)}
        className={`group relative cursor-pointer p-3 transition ${
          selected ? "ring-2 ring-sky-500 ring-offset-2" : "hover:bg-slate-50"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        <p className="text-sm" style={{ color: styles.textColor }}>
          {field.placeholder || field.label}
        </p>
        {selected && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500" />
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(field.id)}
      className={`group relative cursor-pointer border bg-white p-4 transition ${
        selected
          ? "border-sky-500 ring-2 ring-sky-100"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      } ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500" />
      )}

      {/* Field Label */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium" style={{ color: styles.textColor }}>
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>

      {/* Field Helper */}
      {field.helper && (
        <p className="mb-2 text-xs text-slate-500">{field.helper}</p>
      )}

      {/* Field Preview */}
      <div className="mt-2">
        {(field.type === "text" || field.type === "email" || field.type === "number" || field.type === "phone") && (
          <input
            type="text"
            placeholder={field.placeholder}
            disabled
            className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
          />
        )}

        {field.type === "textarea" && (
          <textarea
            placeholder={field.placeholder}
            disabled
            rows={3}
            className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 resize-none"
          />
        )}

        {field.type === "date" && (
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            disabled
            className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
          />
        )}

        {field.type === "time" && (
          <input
            type="text"
            placeholder="--:-- --"
            disabled
            className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
          />
        )}

        {field.type === "select" && (
          <select
            disabled
            className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
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
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" disabled className="border-slate-300" />
                {opt}
              </label>
            ))}
          </div>
        )}

        {field.type === "radio" && (
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-600">
                <input type="radio" disabled name={field.id} className="border-slate-300" />
                {opt}
              </label>
            ))}
          </div>
        )}

        {field.type === "file" && (
          <div
            className="flex items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-400"
          >
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
          <div
            className="flex items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-400"
          >
            <p>Click to sign</p>
          </div>
        )}
      </div>

      {/* Drag handle indicator */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
        <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>
    </div>
  );
}
