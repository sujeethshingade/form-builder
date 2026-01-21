"use client";

import { useState, useEffect } from "react";
import type { FormField, FormStyles, VueformItem, CustomScript } from "../../lib/types";
import { getFieldColumnSpan } from "../../lib/form";

interface FormPreviewProps {
  fields: FormField[];
  styles: FormStyles;
}

const defaultSizeClass = "px-3 py-2 text-sm";

// Script execution helper
function executeScript(
  script: CustomScript,
  value: unknown,
  field: FormField,
  form: Record<string, unknown>
): unknown {
  if (!script.enabled || !script.code) return value;
  
  try {
    const fn = new Function('value', 'field', 'form', script.code);
    return fn(value, field, form);
  } catch (error) {
    console.error(`Script error in ${script.name}:`, error);
    return value;
  }
}

// Validation helper
function validateField(
  field: FormField,
  value: unknown,
  form: Record<string, unknown>
): string | null {
  const rules = field.validationRules || [];
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    switch (rule.type) {
      case "required":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return rule.message;
        }
        break;
      case "minLength":
        if (typeof value === "string" && value.length < (rule.value as number)) {
          return rule.message;
        }
        break;
      case "maxLength":
        if (typeof value === "string" && value.length > (rule.value as number)) {
          return rule.message;
        }
        break;
      case "min":
        if (typeof value === "number" && value < (rule.value as number)) {
          return rule.message;
        }
        break;
      case "max":
        if (typeof value === "number" && value > (rule.value as number)) {
          return rule.message;
        }
        break;
      case "pattern":
        if (typeof value === "string" && rule.value) {
          const regex = new RegExp(rule.value as string);
          if (!regex.test(value)) {
            return rule.message;
          }
        }
        break;
      case "email":
        if (typeof value === "string" && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return rule.message;
          }
        }
        break;

      case "custom":
        if (rule.customValidator) {
          try {
            const fn = new Function('value', 'field', rule.customValidator);
            const result = fn(value, field);
            if (result === false || typeof result === "string") {
              return typeof result === "string" ? result : rule.message;
            }
          } catch (error) {
            console.error("Custom validation error:", error);
          }
        }
        break;
    }
  }
  
  return null;
}

function PreviewField({ 
  field, 
  value, 
  onChange,
  formData,
  error,
  onBlur
}: { 
  field: FormField; 
  value: unknown;
  onChange: (value: unknown) => void;
  formData: Record<string, unknown>;
  error?: string | null;
  onBlur?: () => void;
}) {

  const columnSpan = getFieldColumnSpan(field);
  const gridStyle = { gridColumn: `span ${columnSpan} / span ${columnSpan}` };
  const hasError = !!error;

  // Execute onChange scripts
  const handleChange = (newValue: unknown) => {
    let processedValue = newValue;
    
    // Run onChange scripts
    const onChangeScripts = (field.scripts || []).filter(s => s.trigger === "onChange");
    for (const script of onChangeScripts) {
      const result = executeScript(script, processedValue, field, formData);
      if (result !== undefined) {
        processedValue = result;
      }
    }    
    onChange(processedValue);
  };

  const inputClassName = `w-full border rounded-lg ${defaultSizeClass} text-slate-700 bg-white ${
    hasError ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-sky-500"
  } focus:ring-1 focus:outline-none`;

  // Divider
  if (field.type === "divider") {
    return (
      <div className="p-3 w-full" style={gridStyle}>
        <div className="w-full border-t border-slate-300" />
      </div>
    );
  }

  // Spacer
  if (field.type === "spacer") {
    return (
      <div style={{ ...gridStyle, height: field.height || "24px" }} />
    );
  }

  // Heading
  if (field.type === "heading") {
    const tagName = field.tag || "h2";
    const alignClass = field.align === "center" ? "text-center" : field.align === "right" ? "text-right" : "text-left";
    const content = field.label;
    
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
      <div className="p-2" style={gridStyle}>
        {headingElement}
      </div>
    );
  }

  // Table
  if (field.type === "table") {
    const columns = (field.columns as any[]) || [];
    const rows = (value as Record<string, unknown>[]) || field.tableRows || [];

    const handleCellChange = (rowIndex: number, colName: string, cellValue: unknown) => {
      const newRows = [...rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [colName]: cellValue };
      handleChange(newRows);
    };

    const renderCellInput = (col: any, row: Record<string, unknown>, rowIndex: number) => {
      const cellValue = row[col.name];
      
      switch (col.type) {
        case "dropdown":
          return (
            <select
              value={(cellValue as string) || ""}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select...</option>
              {(col.options || []).map((opt: any) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        
        case "checkbox":
          // If there are options, render as checkbox group
          if (col.options && col.options.length > 0) {
            const selectedValues = Array.isArray(cellValue) ? cellValue : [];
            return (
              <div className="flex flex-col gap-1">
                {col.options.map((opt: any) => (
                  <label key={String(opt.value)} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={String(opt.value)}
                      checked={selectedValues.includes(opt.value)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, opt.value]
                          : selectedValues.filter((v: any) => v !== opt.value);
                        handleCellChange(rowIndex, col.name, newValues);
                      }}
                      className="rounded text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            );
          }
          // Otherwise, render as single checkbox
          return (
            <input
              type="checkbox"
              checked={Boolean(cellValue)}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.checked)}
              className="rounded text-sky-500 focus:ring-sky-500"
            />
          );
        
        case "radio":
          return (
            <div className="flex flex-col gap-1">
              {(col.options || []).map((opt: any) => (
                <label key={String(opt.value)} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`${col.name}_${rowIndex}`}
                    value={String(opt.value)}
                    checked={cellValue === opt.value}
                    onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
                    className="text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          );
        
        case "number":
          return (
            <input
              type="number"
              value={(cellValue as number) ?? ""}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value ? Number(e.target.value) : "")}
              placeholder={col.placeholder}
              min={col.min}
              max={col.max}
              step={col.step}
              className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          );
        
        case "email":
          return (
            <input
              type="email"
              value={(cellValue as string) || ""}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
              placeholder={col.placeholder}
              className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          );
        
        case "date":
          return (
            <input
              type="date"
              value={(cellValue as string) || ""}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          );
        
        case "textarea":
          return (
            <textarea
              value={(cellValue as string) || ""}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
              placeholder={col.placeholder}
              rows={col.rows || 2}
              className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          );
        
        case "text":
        default:
          return (
            <input
              type="text"
              value={(cellValue as string) || ""}
              onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
              placeholder={col.placeholder}
              className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          );
      }
    };

    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-2">{field.description}</p>}
        <div className={`border rounded-lg overflow-hidden ${field.bordered !== false ? "border-slate-300" : "border-transparent"}`}>
          <table className={`w-full text-sm ${field.striped ? "stripe-table" : ""}`}>
            {field.showHeader !== false && (
              <thead className="bg-slate-100">
                <tr>
                  {columns.map((col) => (
                    <th key={col.name} className={`px-3 py-2 text-left font-medium text-slate-700 ${field.compact ? "px-2 py-1" : ""}`} style={{ width: col.width }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-4 text-center text-slate-500">
                    {field.emptyText || "No rows added"}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`border-t border-slate-200 ${field.hover !== false ? "hover:bg-slate-50" : ""} ${field.striped && rowIndex % 2 === 1 ? "bg-slate-50" : ""}`}>
                    {columns.map((col) => (
                      <td key={col.name} className={`px-3 py-2 ${field.compact ? "px-2 py-1" : ""}`}>
                        {renderCellInput(col, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Textarea
  if (field.type === "textarea") {
    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-1">{field.description}</p>}
        <textarea
          value={(value as string) || ""}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          required={field.required}
          rows={field.rows || 3}
          spellCheck={field.spellcheck !== false}
          className={`${inputClassName} resize-none`}
        />
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Text, Email, Number, Date inputs
  if (["text", "email", "number", "date"].includes(field.type)) {
    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-1">{field.description}</p>}
        <div className="relative">
          <input
            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
            value={(value as string) || ""}
            onChange={(e) => handleChange(field.type === "number" ? parseFloat(e.target.value) || "" : e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            required={field.required}
            className={`${inputClassName}`}
          />
        </div>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Dropdown
  if (field.type === "dropdown") {
    const items: VueformItem[] = field.items || [];
    const isMultiple = field.multiple;

    if (field.native) {
      return (
        <div className="p-2" style={gridStyle}>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.description && <p className="text-xs text-slate-500 mb-1">{field.description}</p>}
          <select
            value={isMultiple ? (value as string[]) || [] : (value as string) || ""}
            onChange={(e) => {
              if (isMultiple) {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                handleChange(selected);
              } else {
                handleChange(e.target.value);
              }
            }}
            onBlur={onBlur}
            multiple={isMultiple}
            required={field.required}
            className={inputClassName}
            style={{ maxHeight: field.maxHeight }}
          >
            {!isMultiple && <option value="">{field.placeholder || "Select..."}</option>}
            {items.map((item) => (
              <option key={String(item.value)} value={String(item.value)} disabled={item.disabled}>
                {item.label}
              </option>
            ))}
          </select>
          {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );
    }

    // Custom dropdown (styled)
    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-1">{field.description}</p>}
        <select
          value={isMultiple ? (value as string[]) || [] : (value as string) || ""}
          onChange={(e) => {
            if (isMultiple) {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              handleChange(selected);
            } else {
              handleChange(e.target.value);
            }
          }}
          onBlur={onBlur}
          multiple={isMultiple}
          required={field.required}
          className={inputClassName}
        >
          {!isMultiple && <option value="">{field.placeholder || "Select..."}</option>}
          {items.map((item) => (
            <option key={String(item.value)} value={String(item.value)} disabled={item.disabled}>
              {item.label}
            </option>
          ))}
        </select>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Slider
  if (field.type === "slider") {
    const min = (field.min as number) || 0;
    const max = (field.max as number) || 100;
    const step = field.step || 1;
    const currentValue = (value as number) ?? field.default ?? min;
    
    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-1">{field.description}</p>}
        <div className="flex items-center gap-3">
          <input
            type="range"
            value={currentValue}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            onBlur={onBlur}
            min={min}
            max={max}
            step={step}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          {field.showValue !== false && (
            <span className="text-sm text-slate-600 min-w-12 text-right">
              {currentValue}
            </span>
          )}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Radio (single choice)
  if (field.type === "radio") {
    const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));

    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-2">{field.description}</p>}
        <div className="space-y-2">
          {items.map((item) => (
            <label key={String(item.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={String(item.value)}
                checked={value === item.value}
                onChange={() => handleChange(item.value)}
                onBlur={onBlur}
                disabled={item.disabled}
                className="text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Checkbox (multiple choice)
  if (field.type === "checkbox") {
    const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
    const selectedValues = (value as (string | number)[]) || [];


    const handleCheckboxChange = (itemValue: string | number, checked: boolean) => {
      let newValues: (string | number)[];
      if (checked) {
        newValues = [...selectedValues, itemValue];
      } else {
        newValues = selectedValues.filter(v => v !== itemValue);
      }
      handleChange(newValues);
    };



    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && <p className="text-xs text-slate-500 mb-2">{field.description}</p>}
        
        <div className="space-y-2">
          {items.map((item) => (
            <label key={String(item.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={String(item.value)}
                checked={selectedValues.includes(item.value)}
                onChange={(e) => handleCheckboxChange(item.value, e.target.checked)}
                onBlur={onBlur}
                disabled={item.disabled}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="p-2" style={gridStyle}>
      <label className="block text-sm font-medium text-slate-900 mb-1">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={(value as string) || ""}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={inputClassName}
      />
      {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormPreview({
  fields,
  styles,
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Initialize default values
  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    fields.forEach(field => {
      if (field.default !== undefined && field.default !== null) {
        defaults[field.id] = field.default;
      }
    });
    setFormData(prev => ({ ...defaults, ...prev }));
  }, [fields]);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
    
    // Clear error on change
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleFieldBlur = (field: FormField) => {
    // Run validation on blur
    const error = validateField(field, formData[field.id], formData);
    setErrors(prev => ({ ...prev, [field.id]: error }));
    
    // Run onBlur scripts
    const onBlurScripts = (field.scripts || []).filter(s => s.trigger === "onBlur");
    for (const script of onBlurScripts) {
      executeScript(script, formData[field.id], field, formData);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8">
      <div className="mx-auto max-w-8xl">
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
            <div className="grid grid-cols-12 gap-4">
              {fields.map((field) => (
                <PreviewField
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  formData={formData}
                  error={errors[field.id]}
                  onBlur={() => handleFieldBlur(field)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
