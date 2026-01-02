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
  { type: "location", label: "Location", icon: "📍", category: "input" },
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
    options: hasOptions(item.type) ? ["Option 1", "Option 2", "Option 3"] : undefined,
    width: "full",
  };
}

export function makeFieldFromTemplate(field: Omit<FormField, "id">): FormField {
  const result: FormField = {
    id: nanoid(),
    type: field.type,
    label: field.label,
    ...field,
  };
  return result;
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
            case "location":
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
