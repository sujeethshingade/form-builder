"use client";

import { useState, useRef, useEffect } from "react";
import type { FormField, FormStyles, VueformItem, ValidationRule, CustomScript } from "../../lib/types";
import { getFieldColumnSpan } from "../../lib/form";

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
      case "url":
        if (typeof value === "string" && value) {
          try {
            new URL(value);
          } catch {
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
  const size = field.size || "md";
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
    
    // Apply transforms for text
    if (typeof processedValue === "string" && field.transform) {
      switch (field.transform) {
        case "lowercase":
          processedValue = processedValue.toLowerCase();
          break;
        case "uppercase":
          processedValue = processedValue.toUpperCase();
          break;
        case "capitalize":
          processedValue = processedValue.replace(/\b\w/g, c => c.toUpperCase());
          break;
      }
    }
    
    onChange(processedValue);
  };

  const inputClassName = `w-full border rounded-lg ${sizeClasses[size]} text-slate-700 bg-white ${
    hasError ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-sky-500"
  } focus:ring-1 focus:outline-none`;

  // Divider
  if (field.type === "divider") {
    const style = field.dividerStyle || "solid";
    const thickness = field.thickness || 1;
    return (
      <div className="p-3 w-full" style={gridStyle}>
        <hr 
          className="border-slate-300" 
          style={{ 
            borderStyle: style, 
            borderTopWidth: `${thickness}px`,
            borderColor: field.color || undefined
          }} 
        />
        {field.content && (
          <div className={`text-center text-sm text-slate-500 -mt-3 ${
            field.contentPosition === "left" ? "text-left" : 
            field.contentPosition === "right" ? "text-right" : "text-center"
          }`}>
            <span className="bg-white px-2">{field.content}</span>
          </div>
        )}
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
    const content = field.content || field.label;
    
    const tagStyles: Record<string, string> = {
      h1: "text-4xl font-bold",
      h2: "text-2xl font-bold",
      h3: "text-xl font-semibold",
      h4: "text-lg font-semibold",
      h5: "text-base font-medium",
      h6: "text-sm font-medium",
    };

    const fontWeightClass = field.fontWeight ? `font-${field.fontWeight}` : "";
    const className = `text-slate-900 ${tagStyles[tagName]} ${alignClass} ${fontWeightClass}`;
    
    const style: React.CSSProperties = {
      color: field.color || undefined,
      fontSize: field.fontSize || undefined,
      marginTop: field.marginTop || undefined,
      marginBottom: field.marginBottom || undefined,
    };
    
    const headingElement = (() => {
      switch (tagName) {
        case "h1": return <h1 className={className} style={style}>{content}</h1>;
        case "h2": return <h2 className={className} style={style}>{content}</h2>;
        case "h3": return <h3 className={className} style={style}>{content}</h3>;
        case "h4": return <h4 className={className} style={style}>{content}</h4>;
        case "h5": return <h5 className={className} style={style}>{content}</h5>;
        case "h6": return <h6 className={className} style={style}>{content}</h6>;
        default: return <h2 className={className} style={style}>{content}</h2>;
      }
    })();

    return (
      <div className="p-2" style={gridStyle}>
        {headingElement}
        {field.description && (
          <p className="text-slate-500 text-sm mt-1">{field.description}</p>
        )}
      </div>
    );
  }

  // Table
  if (field.type === "table") {
    const columns = (field.columns as any[]) || [];
    const rows = (value as Record<string, unknown>[]) || field.rows || [{}];

    const handleRowChange = (rowIndex: number, colName: string, cellValue: unknown) => {
      const newRows = [...rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [colName]: cellValue };
      handleChange(newRows);
    };

    const addRow = () => {
      if (field.maxRowsTable && rows.length >= field.maxRowsTable) return;
      const newRow: Record<string, unknown> = {};
      columns.forEach(col => { newRow[col.name] = ""; });
      handleChange([...rows, newRow]);
    };

    const removeRow = (index: number) => {
      if (field.minRowsTable && rows.length <= field.minRowsTable) return;
      handleChange(rows.filter((_, i) => i !== index));
    };

    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-2">{field.helper}</p>}
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
                  {field.removable !== false && <th className="w-10"></th>}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-slate-500">
                    {field.emptyText || "No rows added"}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`border-t border-slate-200 ${field.hover !== false ? "hover:bg-slate-50" : ""} ${field.striped && rowIndex % 2 === 1 ? "bg-slate-50" : ""}`}>
                    {columns.map((col) => (
                      <td key={col.name} className={`px-3 py-2 ${field.compact ? "px-2 py-1" : ""}`}>
                        <input
                          type={col.type === "number" ? "number" : col.type === "email" ? "email" : col.type === "date" ? "date" : "text"}
                          value={(row[col.name] as string) || ""}
                          onChange={(e) => handleRowChange(rowIndex, col.name, e.target.value)}
                          placeholder={col.placeholder}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        />
                      </td>
                    ))}
                    {field.removable !== false && (
                      <td className="px-2">
                        <button
                          type="button"
                          onClick={() => removeRow(rowIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {field.addable !== false && (
            <button
              type="button"
              onClick={addRow}
              disabled={field.maxRowsTable ? rows.length >= field.maxRowsTable : false}
              className="w-full py-2 text-sm text-sky-600 hover:bg-slate-50 border-t border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + {field.addRowLabel || "Add Row"}
            </button>
          )}
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
        {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
        <textarea
          value={(value as string) || ""}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          required={field.required}
          disabled={field.disabled}
          readOnly={field.readonly}
          rows={field.rows || 3}
          maxLength={field.maxLength}
          spellCheck={field.spellcheck !== false}
          className={`${inputClassName} resize-none`}
        />
        {field.counter && field.maxLength && (
          <p className="text-xs text-slate-400 text-right mt-1">
            {((value as string) || "").length} / {field.maxLength}
          </p>
        )}
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Text, Email, URL, Number, Date inputs
  if (["text", "email", "url", "number", "date"].includes(field.type)) {
    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
        <div className="relative">
          {field.prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              {field.prefix}
            </span>
          )}
          <input
            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
            value={(value as string) || ""}
            onChange={(e) => handleChange(field.type === "number" ? parseFloat(e.target.value) || "" : e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            readOnly={field.readonly}
            min={field.min as number}
            max={field.max as number}
            step={field.step}
            minLength={field.minLength}
            maxLength={field.maxLength}
            pattern={field.pattern}
            autoComplete={field.autocomplete}
            autoFocus={field.autofocus}
            className={`${inputClassName} ${field.prefix ? "pl-8" : ""} ${field.suffix ? "pr-8" : ""}`}
          />
          {field.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              {field.suffix}
            </span>
          )}
          {field.clearable && (value as string) && (
            <button
              type="button"
              onClick={() => handleChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
        {field.counter && field.maxLength && (
          <p className="text-xs text-slate-400 text-right mt-1">
            {((value as string) || "").length} / {field.maxLength}
          </p>
        )}
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Select/Dropdown
  if (field.type === "select") {
    const items: VueformItem[] = field.items || [];
    const isMultiple = field.multiple;

    if (field.native) {
      return (
        <div className="p-2" style={gridStyle}>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
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
            disabled={field.disabled}
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
        {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
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
          disabled={field.disabled}
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

  // File Upload
  if (field.type === "file") {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const files = (value as File[]) || [];

    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles) return;
      
      const validFiles: File[] = [];
      const maxSize = field.maxSize || 10485760;
      const fieldAccept = field.accept;
      const acceptTypes: string[] = Array.isArray(fieldAccept) 
        ? fieldAccept 
        : (fieldAccept ? String(fieldAccept).split(",").map((t) => t.trim()) : []);
      
      Array.from(newFiles).forEach(file => {
        // Check size
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large`);
          return;
        }
        
        // Check type
        if (acceptTypes.length > 0) {
          const isAccepted = acceptTypes.some((type: string) => {
            if (type.startsWith(".")) {
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
          });
          if (!isAccepted) {
            alert(`File ${file.name} type not accepted`);
            return;
          }
        }
        
        validFiles.push(file);
      });
      
      const maxFiles = field.maxFiles || 5;
      const allFiles = field.multiple ? [...files, ...validFiles].slice(0, maxFiles) : validFiles.slice(0, 1);
      handleChange(allFiles);
    };

    const removeFile = (index: number) => {
      handleChange(files.filter((_, i) => i !== index));
    };

    const acceptValue = Array.isArray(field.accept) ? field.accept.join(",") : field.accept;

    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
        
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver ? "border-sky-500 bg-sky-50" : hasError ? "border-red-300" : "border-slate-300"
          } ${field.drop !== false ? "cursor-pointer" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (field.drop !== false) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => field.clickable !== false && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptValue}
            multiple={field.multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="text-slate-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium">{field.buttonLabel || "Choose File"}</p>
            {field.drop !== false && <p className="text-xs">{field.dropLabel || "or drop files here"}</p>}
          </div>
        </div>
        
        {files.length > 0 && field.preview !== false && (
          <div className="mt-2 space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded text-sm">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
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
        {field.helper && <p className="text-xs text-slate-500 mb-1">{field.helper}</p>}
        <div className="flex items-center gap-3">
          <input
            type="range"
            value={currentValue}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            onBlur={onBlur}
            min={min}
            max={max}
            step={step}
            disabled={field.disabled}
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
    const columns = field.columns as number;
    const gridClass = columns ? `grid grid-cols-${columns} gap-2` : "space-y-2";
    const inlineClass = field.inlineOptions ? "flex flex-wrap gap-4" : gridClass;
    
    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-2">{field.helper}</p>}
        <div className={inlineClass}>
          {items.map((item) => (
            <label key={String(item.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={String(item.value)}
                checked={value === item.value}
                onChange={() => handleChange(item.value)}
                onBlur={onBlur}
                disabled={item.disabled || field.disabled}
                className="text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
          {field.hasOther && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value="__other__"
                checked={value === "__other__"}
                onChange={() => handleChange("__other__")}
                className="text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{field.otherText || "Other"}</span>
            </label>
          )}
        </div>
        {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Checkbox (multiple choice)
  if (field.type === "checkbox") {
    const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
    const selectedValues = (value as (string | number)[]) || [];
    const columns = field.columns as number;
    const gridClass = columns ? `grid grid-cols-${columns} gap-2` : "space-y-2";
    const inlineClass = field.inlineOptions ? "flex flex-wrap gap-4" : gridClass;

    const handleCheckboxChange = (itemValue: string | number, checked: boolean) => {
      let newValues: (string | number)[];
      if (checked) {
        if (field.max && selectedValues.length >= (field.max as number)) {
          return; // Max selections reached
        }
        newValues = [...selectedValues, itemValue];
      } else {
        newValues = selectedValues.filter(v => v !== itemValue);
      }
      handleChange(newValues);
    };

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        const allValues = items.filter(i => !i.disabled).map(i => i.value);
        handleChange(allValues);
      } else {
        handleChange([]);
      }
    };

    return (
      <div className="p-2" style={gridStyle}>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.helper && <p className="text-xs text-slate-500 mb-2">{field.helper}</p>}
        
        {field.selectAll && (
          <label className="flex items-center gap-2 cursor-pointer mb-2 pb-2 border-b border-slate-200">
            <input
              type="checkbox"
              checked={selectedValues.length === items.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-slate-700">Select All</span>
          </label>
        )}
        
        <div className={inlineClass}>
          {items.map((item) => (
            <label key={String(item.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={String(item.value)}
                checked={selectedValues.includes(item.value)}
                onChange={(e) => handleCheckboxChange(item.value, e.target.checked)}
                onBlur={onBlur}
                disabled={item.disabled || field.disabled}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
          {field.hasOther && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value="__other__"
                checked={selectedValues.includes("__other__")}
                onChange={(e) => handleCheckboxChange("__other__", e.target.checked)}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{field.otherText || "Other"}</span>
            </label>
          )}
        </div>
        
        {field.min && field.max && (
          <p className="text-xs text-slate-400 mt-1">
            Select {field.min} to {field.max} options
          </p>
        )}
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
  formId,
  formName,
  collectionName,
  onSubmit,
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;
    
    for (const field of fields) {
      if (["heading", "divider", "spacer"].includes(field.type)) continue;
      
      // Run required check
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
          hasErrors = true;
          continue;
        }
      }
      
      // Run custom validation rules
      const error = validateField(field, formData[field.id], formData);
      if (error) {
        newErrors[field.id] = error;
        hasErrors = true;
      }
      
      // Run onValidate scripts
      const onValidateScripts = (field.scripts || []).filter(s => s.trigger === "onValidate");
      for (const script of onValidateScripts) {
        const result = executeScript(script, formData[field.id], field, formData);
        if (typeof result === "string") {
          newErrors[field.id] = result;
          hasErrors = true;
        } else if (result === false) {
          newErrors[field.id] = `${field.label} is invalid`;
          hasErrors = true;
        }
      }
    }
    
    setErrors(newErrors);
    
    if (hasErrors) {
      const errorMessages = Object.entries(newErrors)
        .filter(([_, msg]) => msg)
        .map(([id, msg]) => msg);
      alert(`Please fix the following errors:\n${errorMessages.join("\n")}`);
      return;
    }

    if (!onSubmit) {
      alert("Preview mode: Form submission is not configured");
      return;
    }

    // Run onSubmit scripts
    for (const field of fields) {
      const onSubmitScripts = (field.scripts || []).filter(s => s.trigger === "onSubmit");
      for (const script of onSubmitScripts) {
        executeScript(script, formData[field.id], field, formData);
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({});
      setErrors({});
      alert("Form submitted successfully!");
    } catch {
      alert("Failed to submit form");
    } finally {
      setSubmitting(false);
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
            <form onSubmit={handleSubmit}>
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
