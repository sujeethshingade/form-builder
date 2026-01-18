import { nanoid } from "nanoid";
import type { ComponentType, FormField, LibraryItem, FormStyles } from "./types";

export type { ComponentType, FormField, LibraryItem, FormStyles } from "./types";

export const defaultStyles: FormStyles = {
  backgroundColor: "#ffffff",
  textColor: "#1e293b",
  primaryColor: "#0ea5e9",
  borderRadius: 8,
  fontFamily: "Inter, sans-serif",
};

export const library: LibraryItem[] = [
  { type: "text", label: "Text", icon: "T", category: "input" },
  { type: "number", label: "Number", icon: "#", category: "input" },
  { type: "email", label: "Email", icon: "@", category: "input" },
  { type: "url", label: "URL", icon: "🔗", category: "input" },
  { type: "radio", label: "Single choice", icon: "◉", category: "choice" },
  { type: "checkbox", label: "Multiple choice", icon: "☑", category: "choice" },
  { type: "date", label: "Date", icon: "📅", category: "input" },
  { type: "heading", label: "Heading", icon: "H", category: "layout" },
  { type: "divider", label: "Divider", icon: "—", category: "layout" },
  { type: "spacer", label: "Spacer", icon: "⬚", category: "layout" },
  { type: "table", label: "Table", icon: "⊞", category: "layout" },
];

function hasOptions(type: ComponentType): boolean {
  return ["checkbox", "radio"].includes(type);
}

function getDefaultPlaceholder(type: ComponentType): string | undefined {
  return "";
}

export function makeField(item: LibraryItem): FormField {
  return {
    id: nanoid(),
    type: item.type,
    label: item.label,
    placeholder: getDefaultPlaceholder(item.type),
    helper: "",
    required: false,
    items: hasOptions(item.type) 
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
  // Prefer widthColumns if set (1-12 grid system)
  if (typeof field.widthColumns === "number" && !Number.isNaN(field.widthColumns)) {
    return Math.min(12, Math.max(1, Math.round(field.widthColumns)));
  }

  // Fallback to widthPercent for backward compatibility
  if (typeof field.widthPercent === "number" && !Number.isNaN(field.widthPercent)) {
    const span = Math.round((field.widthPercent / 100) * 12);
    return Math.min(12, Math.max(1, span || 12));
  }

  // Default to full width (12 columns)
  return 12;
}

export function fieldToSurveyJSON(fields: FormField[]) {
  return {
    title: "Form Title",
    pages: [
      {
        name: "page1",
        elements: fields.map((field, idx) => {
          const base = {
            name: `${field.type}-${idx + 1}`,
            title: field.label,
            isRequired: field.required,
            description: field.helper,
          };

          switch (field.type) {
            case "text":
              return { ...base, type: "text", placeholder: field.placeholder };
            case "email":
              return { ...base, type: "text", inputType: "email", placeholder: field.placeholder };
            case "number":
              return { ...base, type: "text", inputType: "number", placeholder: field.placeholder };
            case "url":
              return { ...base, type: "text", inputType: "url", placeholder: field.placeholder };
            case "checkbox":
              return { ...base, type: "checkbox", choices: field.options ?? [] };
            case "radio":
              return { ...base, type: "radiogroup", choices: field.options ?? [] };
            case "date":
              return { ...base, type: "text", inputType: "date" };
            case "heading":
              return { ...base, type: "html", html: `<h2>${field.label}</h2>` };
            case "divider":
              return { ...base, type: "html", html: "<hr style='border-top: 1px solid #e2e8f0; margin: 16px 0;'/>" };
            case "spacer":
              return { ...base, type: "html", html: "<div style='height: 24px;'></div>" };
            case "table":
              return { ...base, type: "html", html: "<div>Table placeholder</div>" };
            default:
              return { ...base, type: "text" };
          }
        }),
      },
    ],
  };
}
