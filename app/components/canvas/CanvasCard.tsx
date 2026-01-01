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
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  styles,
}: {
  field: FormField;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(field.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(field.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) onDuplicate(field.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveUp) onMoveUp(field.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveDown) onMoveDown(field.id);
  };

  // Render layout elements differently
  if (field.type === "divider") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative cursor-pointer p-3 transition ${selected ? "ring-2 ring-sky-400" : "hover:ring-2 hover:ring-slate-200"} ${isDragging ? "opacity-50" : ""}`}
      >
        {/* Hover Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
          {/* Move Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            </svg>
          </div>
          <button onClick={handleMoveUp} disabled={!canMoveUp} className={`p-1.5 rounded ${canMoveUp ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move up">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={handleMoveDown} disabled={!canMoveDown} className={`p-1.5 rounded ${canMoveDown ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move down">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={handleDuplicate} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded" title="Duplicate">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={handleDelete} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <div className={`border-t ${selected ? "border-sky-500" : "border-slate-300"}`} />
      </div>
    );
  }

  if (field.type === "spacer") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative cursor-pointer p-2 transition ${selected ? "ring-2 ring-sky-400" : "hover:ring-2 hover:ring-slate-200"} ${isDragging ? "opacity-50" : ""}`}
      >
        {/* Hover Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
          <div {...attributes} {...listeners} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing" title="Drag to reorder">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>
          </div>
          <button onClick={handleMoveUp} disabled={!canMoveUp} className={`p-1.5 rounded ${canMoveUp ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move up">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={handleMoveDown} disabled={!canMoveDown} className={`p-1.5 rounded ${canMoveDown ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move down">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={handleDuplicate} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded" title="Duplicate">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={handleDelete} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <div className={`h-12 border-2 border-dashed ${selected ? "border-sky-400 bg-sky-50" : "border-slate-200"}`} />
      </div>
    );
  }

  if (field.type === "heading") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative cursor-pointer p-2 transition ${
          selected ? "ring-2 ring-sky-400" : "hover:ring-2 hover:ring-slate-200"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        {/* Hover Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
          <div {...attributes} {...listeners} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing" title="Drag to reorder">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>
          </div>
          <button onClick={handleMoveUp} disabled={!canMoveUp} className={`p-1.5 rounded ${canMoveUp ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move up">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={handleMoveDown} disabled={!canMoveDown} className={`p-1.5 rounded ${canMoveDown ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move down">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={handleDuplicate} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded" title="Duplicate">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={handleDelete} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          {field.label}
        </h2>
      </div>
    );
  }

  if (field.type === "paragraph") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative cursor-pointer p-2 transition ${
          selected ? "ring-2 ring-sky-400" : "hover:ring-2 hover:ring-slate-200"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        {/* Hover Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
          <div {...attributes} {...listeners} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing" title="Drag to reorder">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>
          </div>
          <button onClick={handleMoveUp} disabled={!canMoveUp} className={`p-1.5 rounded ${canMoveUp ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move up">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={handleMoveDown} disabled={!canMoveDown} className={`p-1.5 rounded ${canMoveDown ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`} title="Move down">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={handleDuplicate} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded" title="Duplicate">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={handleDelete} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <p className="text-sm text-slate-700">
          {field.placeholder || field.label}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`group relative cursor-pointer p-2 transition ${
        selected
          ? "ring-2 ring-sky-400"
          : "hover:ring-2 hover:ring-slate-200"
      } ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      {/* Hover Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
        {/* Move Handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </div>

        {/* Move Up */}
        <button
          onClick={handleMoveUp}
          disabled={!canMoveUp}
          className={`p-1.5 rounded ${
            canMoveUp
              ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Move up"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Move Down */}
        <button
          onClick={handleMoveDown}
          disabled={!canMoveDown}
          className={`p-1.5 rounded ${
            canMoveDown
              ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Move down"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Duplicate */}
        <button
          onClick={handleDuplicate}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded"
          title="Duplicate"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="Delete"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>


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
      <div>{(field.type === "text" || field.type === "email" || field.type === "number" || field.type === "phone" || field.type === "password" || field.type === "url") && (
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
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" disabled className="rounded border-slate-300" />
                {opt}
              </label>
            ))}
          </div>
        )}

        {field.type === "radio" && (
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" disabled name={field.id} className="border-slate-300" />
                {opt}
              </label>
            ))}
          </div>
        )}

        {field.type === "file" && (
          <div
            className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white px-4 py-8 text-sm text-slate-500"
          >
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white px-4 py-8 text-sm text-slate-500"
          >
            <p>Click to sign</p>
          </div>
        )}
      </div>
    </div>
  );
}
