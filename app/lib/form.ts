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
  { type: "text", label: "Text Input", icon: "T", category: "input" },
  { type: "email", label: "Email", icon: "@", category: "input" },
  { type: "number", label: "Number", icon: "#", category: "input" },
  { type: "phone", label: "Phone", icon: "📞", category: "input" },
  { type: "textarea", label: "Long Text", icon: "¶", category: "input" },
  { type: "date", label: "Date", icon: "📅", category: "input" },
  { type: "time", label: "Time", icon: "⏰", category: "input" },
  { type: "password", label: "Password", icon: "🔒", category: "input" },
  { type: "url", label: "URL", icon: "🔗", category: "input" },
  { type: "location", label: "Location", icon: "📍", category: "input" },
  { type: "select", label: "Dropdown", icon: "▼", category: "choice" },
  { type: "checkbox", label: "Checkbox", icon: "☑", category: "choice" },
  { type: "radio", label: "Radio", icon: "◉", category: "choice" },
  { type: "rating", label: "Rating", icon: "★", category: "choice" },
  { type: "heading", label: "Heading", icon: "H", category: "layout" },
  { type: "h1", label: "H1", icon: "H1", category: "layout" },
  { type: "h2", label: "H2", icon: "H2", category: "layout" },
  { type: "h3", label: "H3", icon: "H3", category: "layout" },
  { type: "paragraph", label: "Paragraph", icon: "≡", category: "layout" },
  { type: "divider", label: "Divider", icon: "—", category: "layout" },
  { type: "spacer", label: "Spacer", icon: "⬚", category: "layout" },
  { type: "table", label: "Table", icon: "⊞", category: "layout" },
  { type: "file", label: "File Upload", icon: "📎", category: "advanced" },
  { type: "signature", label: "Signature", icon: "✍", category: "advanced" },
];

function hasOptions(type: ComponentType): boolean {
  return ["select", "checkbox", "radio"].includes(type);
}

function getDefaultPlaceholder(type: ComponentType): string | undefined {
  const placeholders: Partial<Record<ComponentType, string>> = {
    text: "Enter text...",
    email: "email@example.com",
    number: "0",
    phone: "+1 (555) 000-0000",
    textarea: "Enter your response...",
    date: "Select date",
    time: "Select time",
    heading: "Form Title",
    h1: "Form Title",
    h2: "Section Title",
    h3: "Subsection Title",
    paragraph: "Add description text here...",
    password: "Enter password...",
    url: "https://example.com",
    location: "Enter location...",
  };
  return placeholders[type];
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
  return {
    ...field,
    id: nanoid(),
  };
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
            case "phone":
            case "location":
              return { ...base, type: "text", placeholder: field.placeholder };
            case "email":
              return { ...base, type: "text", inputType: "email", placeholder: field.placeholder };
            case "number":
              return { ...base, type: "text", inputType: "number", placeholder: field.placeholder };
            case "password":
              return { ...base, type: "text", inputType: "password", placeholder: field.placeholder };
            case "url":
              return { ...base, type: "text", inputType: "url", placeholder: field.placeholder };
            case "textarea":
              return { ...base, type: "comment", placeholder: field.placeholder };
            case "select":
              return { ...base, type: "dropdown", choices: field.options ?? [] };
            case "checkbox":
              return { ...base, type: "checkbox", choices: field.options ?? [] };
            case "radio":
              return { ...base, type: "radiogroup", choices: field.options ?? [] };
            case "date":
              return { ...base, type: "text", inputType: "date" };
            case "time":
              return { ...base, type: "text", inputType: "time" };
            case "file":
              return { ...base, type: "file" };
            case "rating":
              return { ...base, type: "rating" };
            case "signature":
              return { ...base, type: "signaturepad" };
            case "heading":
            case "h1":
            case "h2":
            case "h3":
              return { ...base, type: "html", html: `<h2>${field.label}</h2>` };
            case "paragraph":
              return { ...base, type: "html", html: `<p>${field.placeholder || field.label}</p>` };
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
