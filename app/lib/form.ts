import { nanoid } from "nanoid";

export type ComponentType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "file"
  | "rating"
  | "signature"
  | "heading"
  | "paragraph"
  | "divider"
  | "spacer";

export type LibraryItem = {
  type: ComponentType;
  label: string;
  icon: string;
  category: "input" | "choice" | "layout" | "advanced";
};

export type FormField = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half";
};

export type FormTemplate = {
  id: string;
  name: string;
  description: string;
  fields: Omit<FormField, "id">[];
};

export type FormStyles = {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
};

export const defaultStyles: FormStyles = {
  backgroundColor: "#ffffff",
  textColor: "#1e293b",
  primaryColor: "#0ea5e9",
  borderRadius: 8,
  fontFamily: "Inter, sans-serif",
};

export const library: LibraryItem[] = [
  // Input fields
  { type: "text", label: "Text Input", icon: "T", category: "input" },
  { type: "email", label: "Email", icon: "@", category: "input" },
  { type: "number", label: "Number", icon: "#", category: "input" },
  { type: "phone", label: "Phone", icon: "📞", category: "input" },
  { type: "textarea", label: "Long Text", icon: "¶", category: "input" },
  { type: "date", label: "Date", icon: "📅", category: "input" },
  { type: "time", label: "Time", icon: "⏰", category: "input" },
  
  // Choice fields
  { type: "select", label: "Dropdown", icon: "▼", category: "choice" },
  { type: "checkbox", label: "Checkbox", icon: "☑", category: "choice" },
  { type: "radio", label: "Radio", icon: "◉", category: "choice" },
  { type: "rating", label: "Rating", icon: "★", category: "choice" },
  
  // Layout elements
  { type: "heading", label: "Heading", icon: "H", category: "layout" },
  { type: "paragraph", label: "Paragraph", icon: "≡", category: "layout" },
  { type: "divider", label: "Divider", icon: "—", category: "layout" },
  { type: "spacer", label: "Spacer", icon: "⬚", category: "layout" },
  
  // Advanced
  { type: "file", label: "File Upload", icon: "📎", category: "advanced" },
  { type: "signature", label: "Signature", icon: "✍", category: "advanced" },
];

export const templates: FormTemplate[] = [
  {
    id: "blank",
    name: "Blank Form",
    description: "Start from scratch",
    fields: [],
  },
  {
    id: "contact",
    name: "Contact Form",
    description: "Simple contact form",
    fields: [
      { type: "heading", label: "Contact Us" },
      { type: "text", label: "Full Name", placeholder: "John Doe", required: true },
      { type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
      { type: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
      { type: "textarea", label: "Message", placeholder: "How can we help?", required: true },
    ],
  },
  {
    id: "feedback",
    name: "Feedback Form",
    description: "Collect user feedback",
    fields: [
      { type: "heading", label: "We value your feedback" },
      { type: "rating", label: "How would you rate your experience?" },
      { type: "radio", label: "Would you recommend us?", options: ["Yes", "No", "Maybe"] },
      { type: "textarea", label: "Additional comments", placeholder: "Share your thoughts..." },
    ],
  },
  {
    id: "registration",
    name: "Registration",
    description: "User registration form",
    fields: [
      { type: "heading", label: "Create Account" },
      { type: "text", label: "First Name", required: true },
      { type: "text", label: "Last Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "phone", label: "Phone" },
      { type: "date", label: "Date of Birth" },
      { type: "checkbox", label: "Interests", options: ["Technology", "Sports", "Music", "Travel"] },
    ],
  },
  {
    id: "survey",
    name: "Survey",
    description: "Multi-question survey",
    fields: [
      { type: "heading", label: "Quick Survey" },
      { type: "paragraph", label: "Please take a moment to answer these questions." },
      { type: "radio", label: "How did you hear about us?", options: ["Search Engine", "Social Media", "Friend", "Other"] },
      { type: "select", label: "How often do you use our product?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { type: "rating", label: "Overall satisfaction" },
      { type: "textarea", label: "Suggestions for improvement" },
    ],
  },
  {
    id: "application",
    name: "Job Application",
    description: "Employment application",
    fields: [
      { type: "heading", label: "Job Application" },
      { type: "text", label: "Full Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "phone", label: "Phone Number", required: true },
      { type: "file", label: "Resume" },
      { type: "textarea", label: "Cover Letter" },
      { type: "date", label: "Available Start Date" },
    ],
  },
];

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

function getDefaultPlaceholder(type: ComponentType): string | undefined {
  switch (type) {
    case "text": return "Enter text...";
    case "email": return "email@example.com";
    case "number": return "0";
    case "phone": return "+1 (555) 000-0000";
    case "textarea": return "Enter your response...";
    case "date": return "Select date";
    case "time": return "Select time";
    case "heading": return "Form Title";
    case "paragraph": return "Add description text here...";
    default: return undefined;
  }
}

function hasOptions(type: ComponentType): boolean {
  return ["select", "checkbox", "radio"].includes(type);
}

export function fieldToSurveyJSON(fields: FormField[]) {
  return {
    title: "Form Preview",
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

          switch (field.type) {
            case "text":
            case "phone":
              return { ...base, type: "text", placeholder: field.placeholder };
            case "email":
              return { ...base, type: "text", inputType: "email", placeholder: field.placeholder };
            case "number":
              return { ...base, type: "text", inputType: "number", placeholder: field.placeholder };
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
              return { ...base, type: "html", html: `<h2>${field.label}</h2>` };
            case "paragraph":
              return { ...base, type: "html", html: `<p>${field.placeholder || field.label}</p>` };
            case "divider":
              return { ...base, type: "html", html: "<hr style='border-top: 1px solid #e2e8f0; margin: 16px 0;'/>" };
            case "spacer":
              return { ...base, type: "html", html: "<div style='height: 24px;'></div>" };
            default:
              return { ...base, type: "text" };
          }
        }),
      },
    ],
  };
}
