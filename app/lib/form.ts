import { nanoid } from "nanoid";
export type ComponentType = "text" | "textarea" | "select" | "checkbox" | "radio";

export type LibraryItem = {
  type: ComponentType;
  label: string;
  description: string;
};

export type FormField = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
};

export const library: LibraryItem[] = [
  {
    type: "text",
    label: "Heading / Short text",
    description: "Single-line inputs like name or title.",
  },
  {
    type: "textarea",
    label: "Paragraph",
    description: "Long-form responses and notes.",
  },
  {
    type: "select",
    label: "Dropdown",
    description: "Choose one from a list.",
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    description: "Allow multiple selections.",
  },
  {
    type: "radio",
    label: "Single choice",
    description: "Pick exactly one option.",
  },
];

export function makeField(item: LibraryItem): FormField {
  return {
    id: nanoid(),
    type: item.type,
    label: item.label,
    placeholder: item.type === "text" ? "Type your answer" : undefined,
    helper: "",
    required: false,
    options:
      item.type === "select" || item.type === "checkbox" || item.type === "radio"
        ? ["Option A", "Option B", "Option C"]
        : undefined,
  };
}

export function fieldToSurveyJSON(fields: FormField[]) {
  return {
    title: "Live Preview",
    showQuestionNumbers: "off",
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

          if (field.type === "text") {
            return { ...base, type: "text", placeholder: field.placeholder };
          }
          if (field.type === "textarea") {
            return { ...base, type: "comment", placeholder: field.placeholder };
          }
          if (field.type === "select") {
            return { ...base, type: "dropdown", choices: field.options ?? [] };
          }
          if (field.type === "checkbox") {
            return { ...base, type: "checkbox", choices: field.options ?? [] };
          }
          return { ...base, type: "radiogroup", choices: field.options ?? [] };
        }),
      },
    ],
  };
}
