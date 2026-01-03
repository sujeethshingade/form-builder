"use client";

import { useState } from "react";
import type { FormField, FormStyles, VueformItem } from "../../lib/types";

interface FormPreviewProps {
  fields: FormField[];
  styles: FormStyles;
  formId?: string;
  formName?: string;
  collectionName?: string;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
}

// Reusable size classes
const sizeClasses = {
  sm: "px-2 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

function PreviewField({ 
  field, 
  value, 
  onChange 
}: { 
  field: FormField; 
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const size = field.size || "md";
  const widthStyle = { width: `${field.widthPercent || 100}%` };

  // Divider
  if (field.type === "divider") {
    return (
      <div className="p-3 w-full" style={widthStyle}>
        <hr className="border-t border-slate-300" />
      </div>
    );
  }

  // Spacer
  if (field.type === "spacer") {
    return (
      <div style={{ ...widthStyle, height: field.height || "24px" }} />
    );
  }

  // Heading
  if (field.type === "heading") {
    const tagName = field.tag || "h2";
    const alignClass = field.align === "center" ? "text-center" : field.align === "right" ? "text-right" : "text-left";
    const content = field.content || field.label;
    
    const tagStyles: Record<string, string> = {
      h1: "text-4xl font-bold",
      h2: "text-2xl font-bold",
      h3: "text-xl font-semibold",
      h4: "text-lg font-semibold",
      h5: "text-base font-medium",
      h6: "text-sm font-medium",
    };

    const className = `text-slate-900 ${tagStyles[tagName]} ${alignClass}`;
    
    const headingElement = (() => {
      switch (tagName) {
        case "h1": return <h1 className={className}>{content}</h1>;
        case "h2": return <h2 className={className}>{content}</h2>;
        case "h3": return <h3 className={className}>{content}</h3>;
        case "h4": return <h4 className={className}>{content}</h4>;
        case "h5": return <h5 className={className}>{content}</h5>;
        case "h6": return <h6 className={className}>{content}</h6>;
        default: return <h2 className={className}>{content}</h2>;
      }
    })();

    return (
      <div className="p-2" style={widthStyle}>
        {headingElement}
      </div>
    );
  }

  // Table
  if (field.type === "table") {
    const columns = field.columns || [];
    const rows = (value as Record<string, unknown>[]) || field.rows || [{}];

    const handleRowChange = (rowIndex: number, colName: string, cellValue: unknown) => {
      const newRows = [...rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [colName]: cellValue };
      onChange(newRows);
    };

    const addRow = () => {
      const newRow: Record<string, unknown> = {};
      columns.forEach(col => { newRow[col.name] = ""; });
      onChange([...rows, newRow]);
    };

    return (
      <div className="p-2" style={widthStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                {columns.map((col) => (
                  <th key={col.name} className="px-3 py-2 text-left font-medium text-slate-700" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-slate-200">
                  {columns.map((col) => (
                    <td key={col.name} className="px-3 py-2">
                      <input
                        type={col.type === "number" ? "number" : col.type === "email" ? "email" : col.type === "date" ? "date" : "text"}
                        value={(row[col.name] as string) || ""}
                        onChange={(e) => handleRowChange(rowIndex, col.name, e.target.value)}
                        placeholder={col.placeholder}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addRow}
            className="w-full py-2 text-sm text-sky-600 hover:bg-slate-50 border-t border-slate-200"
          >
            + Add Row
          </button>
        </div>
      </div>
    );
  }

  // Text, Email, URL, Number, Date inputs
  if (["text", "email", "url", "number", "date"].includes(field.type)) {
    return (
      <div className="p-2" style={widthStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
        <input
          type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          min={field.min as number}
          max={field.max as number}
          step={field.step}
          className={`w-full border border-slate-300 rounded-lg ${sizeClasses[size]} text-slate-700 bg-white`}
        />
      </div>
    );
  }

  // Radio (single choice)
  if (field.type === "radio") {
    const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
    return (
      <div className="p-2" style={widthStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-2">{field.helper}</p>}
        <div className="space-y-2">
          {items.map((item) => (
            <label key={String(item.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={String(item.value)}
                checked={value === item.value}
                onChange={() => onChange(item.value)}
                disabled={item.disabled}
                className="text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Checkbox (multiple choice)
  if (field.type === "checkbox") {
    const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
    const selectedValues = (value as (string | number)[]) || [];

    const handleCheckboxChange = (itemValue: string | number, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, itemValue]);
      } else {
        onChange(selectedValues.filter(v => v !== itemValue));
      }
    };

    return (
      <div className="p-2" style={widthStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-2">{field.helper}</p>}
        <div className="space-y-2">
          {items.map((item) => (
            <label key={String(item.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={String(item.value)}
                checked={selectedValues.includes(item.value)}
                onChange={(e) => handleCheckboxChange(item.value, e.target.checked)}
                disabled={item.disabled}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="p-2" style={widthStyle}>
      <label className="block text-sm font-medium text-slate-900 mb-1">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`w-full border border-slate-300 rounded-lg ${sizeClasses[size]} text-slate-700 bg-white`}
      />
    </div>
  );
}

export function FormPreview({
  fields,
  styles,
  formId,
  formName,
  collectionName,
  onSubmit,
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onSubmit) {
      alert("Preview mode: Form submission is not configured");
      return;
    }

    // Validate required fields
    const missingFields = fields
      .filter(f => f.required && !["heading", "divider", "spacer"].includes(f.type))
      .filter(f => {
        const value = formData[f.id];
        if (Array.isArray(value)) return value.length === 0;
        return !value && value !== 0;
      });

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({});
      alert("Form submitted successfully!");
    } catch {
      alert("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div
          className="min-h-150 bg-white shadow-lg p-8"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            fontFamily: styles.fontFamily,
          }}
        >
          {fields.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-12">
              No fields added.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-4">
                {fields.map((field) => (
                  <PreviewField
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                  />
                ))}
              </div>
              
              {onSubmit && (
                <div className="mt-6 pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-sky-400 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    style={{ backgroundColor: styles.primaryColor }}
                  >
                    {submitting ? "Submitting" : "Submit"}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
