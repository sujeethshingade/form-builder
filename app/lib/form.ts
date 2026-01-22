import { nanoid } from "nanoid";
import type { ComponentType, FormField, LibraryItem, FormStyles } from "./types";

export const defaultStyles: FormStyles = {
  backgroundColor: "#ffffff",
  textColor: "#1e293b",
  primaryColor: "#0ea5e9",
  borderRadius: 8,
  fontFamily: "Inter, sans-serif",
};

export const library: LibraryItem[] = [
  { type: "text", label: "Text", icon: "T", category: "input" },
  { type: "textarea", label: "Textarea", icon: "¶", category: "input" },
  { type: "number", label: "Number", icon: "#", category: "input" },
  { type: "email", label: "Email", icon: "@", category: "input" },
  { type: "dropdown", label: "Dropdown", icon: "▼", category: "choice" },
  { type: "radio", label: "Single choice", icon: "◉", category: "choice" },
  { type: "checkbox", label: "Multiple choice", icon: "☑", category: "choice" },
  { type: "date", label: "Date", icon: "📅", category: "input" },
  { type: "slider", label: "Slider", icon: "⎯", category: "input" },
  { type: "heading", label: "Heading", icon: "H", category: "layout" },
  { type: "divider", label: "Divider", icon: "—", category: "layout" },
  { type: "spacer", label: "Spacer", icon: "⬚", category: "layout" },
  { type: "table", label: "Table", icon: "⊞", category: "layout" },
];

const CHOICE_TYPES = ["checkbox", "radio", "dropdown"];

export function makeField(item: LibraryItem): FormField {
  return {
    id: nanoid(),
    type: item.type,
    label: item.label,
    placeholder: "",
    helper: "",
    required: false,
    items: CHOICE_TYPES.includes(item.type)
      ? [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ]
      : undefined,
    width: "full",
    widthColumns: 12,
  };
}

export function getFieldColumnSpan(field: { widthColumns?: number; widthPercent?: number }) {
  if (typeof field.widthColumns === "number" && !Number.isNaN(field.widthColumns)) {
    return Math.min(12, Math.max(1, Math.round(field.widthColumns)));
  }

  if (typeof field.widthPercent === "number" && !Number.isNaN(field.widthPercent)) {
    const span = Math.round((field.widthPercent / 100) * 12);
    return Math.min(12, Math.max(1, span || 12));
  }

  return 12;
}
