"use client";

import type { FormField } from "../../lib/types";

type FieldRendererProps = {
  field: FormField;
  disabled?: boolean;
};

export function TextInputRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <input
      type="text"
      placeholder={field.placeholder || "Enter your response..."}
      disabled={disabled}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
    />
  );
}

export function TextareaRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <textarea
      placeholder={field.placeholder || "Enter your response..."}
      disabled={disabled}
      rows={3}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white resize-none focus:outline-none"
    />
  );
}

export function DateInputRenderer({ disabled = true }: { disabled?: boolean }) {
  return (
    <input
      type="text"
      placeholder="mm/dd/yyyy"
      disabled={disabled}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
    />
  );
}

export function TimeInputRenderer({ disabled = true }: { disabled?: boolean }) {
  return (
    <input
      type="text"
      placeholder="--:-- --"
      disabled={disabled}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
    />
  );
}

export function SelectRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <select
      disabled={disabled}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 bg-white focus:outline-none"
    >
      <option>Select an option...</option>
      {(field.options || []).map((opt: string) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}

export function CheckboxRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      {(field.options || []).map((opt: string) => (
        <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" disabled={disabled} className="rounded border-slate-300" />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function RadioRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      {(field.options || []).map((opt: string) => (
        <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" disabled={disabled} name={field.id} className="border-slate-300" />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function SignatureRenderer() {
  return (
    <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white px-4 py-8 text-sm text-slate-500">
      <p>Click to sign</p>
    </div>
  );
}

export function DividerRenderer({ selected = false }: { selected?: boolean }) {
  return (
    <div className={`border-t ${selected ? "border-sky-500" : "border-slate-300"}`} />
  );
}

export function SpacerRenderer({ selected = false }: { selected?: boolean }) {
  return (
    <div className={`h-12 border-2 border-dashed ${selected ? "border-sky-400 bg-sky-50" : "border-slate-200"}`} />
  );
}

export function HeadingRenderer({ field }: FieldRendererProps) {
  return (
    <h2 className="text-2xl font-bold text-slate-900">{field.label}</h2>
  );
}

export function ParagraphRenderer({ field }: FieldRendererProps) {
  return (
    <p className="text-sm text-slate-700">{field.placeholder || field.label}</p>
  );
}

export function FieldLabel({ field }: FieldRendererProps) {
  return (
    <div className="pb-2">
      <label className="block text-sm font-medium text-slate-900">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
    </div>
  );
}

export function FieldHelper({ helper }: { helper?: string }) {
  if (!helper) return null;
  return <p className="pb-2 text-xs text-slate-500">{helper}</p>;
}

export function FieldInputRenderer({ field, disabled = true }: FieldRendererProps) {
  const textTypes = ["text", "email", "number", "phone", "password", "url"];
  
  if (textTypes.includes(field.type)) {
    return <TextInputRenderer field={field} disabled={disabled} />;
  }
  
  switch (field.type) {
    case "textarea":
      return <TextareaRenderer field={field} disabled={disabled} />;
    case "date":
      return <DateInputRenderer disabled={disabled} />;
    case "checkbox":
      return <CheckboxRenderer field={field} disabled={disabled} />;
    case "radio":
      return <RadioRenderer field={field} disabled={disabled} />;
    default:
      return null;
  }
}

export function FormFieldRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <>
      <FieldLabel field={field} />
      <FieldHelper helper={field.helper} />
      <div>
        <FieldInputRenderer field={field} disabled={disabled} />
      </div>
    </>
  );
}

export function isLayoutElement(type: string): boolean {
  return ["divider", "spacer", "heading", "h1", "h2", "h3", "paragraph"].includes(type);
}

export function LayoutElementRenderer({ field, selected = false }: FieldRendererProps & { selected?: boolean }) {
  switch (field.type) {
    case "divider":
      return <DividerRenderer selected={selected} />;
    case "spacer":
      return <SpacerRenderer selected={selected} />;
    case "heading":
    default:
      return null;
  }
}
