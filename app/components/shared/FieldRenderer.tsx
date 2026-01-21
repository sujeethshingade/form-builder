"use client";

import { useState, useEffect } from "react";
import type { FormField, VueformItem, VueformColumn } from "../../lib/types";

type FieldRendererProps = {
  field: FormField;
  disabled?: boolean;
};

const defaultSizeClass = "px-3 py-2 text-sm";

function Addon({ content, position }: { content?: string; position: "before" | "after" }) {
  if (!content) return null;
  const positionClass = position === "before" ? "rounded-l-lg border-r-0" : "rounded-r-lg border-l-0";
  return (
    <span className={`flex items-center bg-slate-100 border border-slate-300 px-3 text-sm text-slate-600 ${positionClass}`}>
      {content}
    </span>
  );
}

export function TextInputRenderer({ field, disabled = true }: FieldRendererProps) {
  const hasAddonBefore = field.addons?.before;
  const hasAddonAfter = field.addons?.after;

  const inputClasses = `flex-1 border border-slate-300 ${defaultSizeClass} text-slate-500 bg-white focus:outline-none ${
    !hasAddonBefore && !hasAddonAfter ? "rounded-lg" : ""
  } ${hasAddonBefore && !hasAddonAfter ? "rounded-r-lg" : ""} ${!hasAddonBefore && hasAddonAfter ? "rounded-l-lg" : ""}`;

  const input = (
    <div className="relative flex-1">
      <input
        key={`${field.id}-${field.placeholder}`}
        type={field.inputType || "text"}
        placeholder={field.placeholder}
        defaultValue={field.default}
        disabled={disabled}
        className={`${hasAddonBefore || hasAddonAfter ? inputClasses : `w-full ${inputClasses}`}`}
      />
    </div>
  );

  if (hasAddonBefore || hasAddonAfter) {
    return (
      <div className="flex w-full">
        <Addon content={field.addons?.before} position="before" />
        {input}
        <Addon content={field.addons?.after} position="after" />
      </div>
    );
  }

  return input;
}

export function NumberInputRenderer({ field, disabled = true }: FieldRendererProps) {
  const hasAddonBefore = field.addons?.before;
  const hasAddonAfter = field.addons?.after;
  
  const inputClasses = `flex-1 border border-slate-300 ${defaultSizeClass} text-slate-500 bg-white focus:outline-none ${
    !hasAddonBefore && !hasAddonAfter ? "rounded-lg" : ""
  } ${hasAddonBefore && !hasAddonAfter ? "rounded-r-lg" : ""} ${!hasAddonBefore && hasAddonAfter ? "rounded-l-lg" : ""}`;

  const input = (
    <div className="relative flex-1">
      <input
        key={`${field.id}-${field.placeholder}`}
        type="number"
        placeholder={field.placeholder}
        defaultValue={field.default}
        disabled={disabled}
        className={`${hasAddonBefore || hasAddonAfter ? inputClasses : `w-full ${inputClasses}`}`}
      />
    </div>
  );

  if (hasAddonBefore || hasAddonAfter) {
    return (
      <div className="flex w-full">
        <Addon content={field.addons?.before} position="before" />
        {input}
        <Addon content={field.addons?.after} position="after" />
      </div>
    );
  }

  return input;
}

export function TextareaRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <div className="relative">
      <textarea
        key={`${field.id}-${field.placeholder}`}
        placeholder={field.placeholder}
        defaultValue={field.default}
        disabled={disabled}
        rows={field.rows || 3}
        spellCheck={field.spellcheck}
        className={`w-full border border-slate-300 rounded-lg ${defaultSizeClass} text-slate-500 bg-white resize-none focus:outline-none`}
      />
    </div>
  );
}

export function DateInputRenderer({ field, disabled = true }: FieldRendererProps) {
  const hasAddonBefore = field.addons?.before;
  const hasAddonAfter = field.addons?.after;
  
  const inputClasses = `flex-1 border border-slate-300 ${defaultSizeClass} text-slate-500 bg-white focus:outline-none ${
    !hasAddonBefore && !hasAddonAfter ? "rounded-lg" : ""
  } ${hasAddonBefore && !hasAddonAfter ? "rounded-r-lg" : ""} ${!hasAddonBefore && hasAddonAfter ? "rounded-l-lg" : ""}`;

  const inputType = field.mode === "datetime" ? "datetime-local" : 
                    field.mode === "time" ? "time" : 
                    field.mode === "month" ? "month" : "date";

  const input = (
    <input
      key={`${field.id}-${field.format}`}
      type={inputType}
      placeholder={field.placeholder || field.format}
      defaultValue={field.default}
      disabled={disabled}
      className={hasAddonBefore || hasAddonAfter ? inputClasses : `w-full ${inputClasses}`}
    />
  );

  if (hasAddonBefore || hasAddonAfter) {
    return (
      <div className="flex w-full">
        <Addon content={field.addons?.before} position="before" />
        {input}
        <Addon content={field.addons?.after} position="after" />
      </div>
    );
  }

  return input;
}

// Helper function to get active items from LOV or fallback to items/options
function getActiveItems(field: FormField): VueformItem[] {
  // If lovItems exist, filter by Active status and use those
  if (field.lovItems && field.lovItems.length > 0) {
    return field.lovItems
      .filter((item) => item.status === 'Active')
      .map((item) => ({
        value: item.code,
        label: item.shortName,
      }));
  }
  // Fallback to existing items or options
  return field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
}

export function DropdownRenderer({ field, disabled = true }: FieldRendererProps) {
  const items: VueformItem[] = getActiveItems(field);
  
  return (
    <select
      key={`${field.id}-${items.length}-${field.placeholder}`}
      disabled={disabled}
      defaultValue={field.default}
      className={`w-full border border-slate-300 rounded-lg ${defaultSizeClass} text-slate-500 bg-white focus:outline-none`}
    >
      <option value="">{field.placeholder || "Select an option..."}</option>
      {items.map((item) => (
        <option key={String(item.value)} value={item.value} disabled={item.disabled}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export function CheckboxRenderer({ field, disabled = true }: FieldRendererProps) {
  const items: VueformItem[] = getActiveItems(field);
  const renderKey = `${field.id}-${items.map(i => i.value).join('-')}`;
  
  return (
    <div key={renderKey} className="space-y-2">
      {items.map((item) => (
        <label
          key={String(item.value)}
          className={`flex items-center gap-2 text-sm text-slate-700 ${
            item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input
            type="checkbox"
            disabled={disabled || item.disabled}
            defaultChecked={Array.isArray(field.default) && field.default.includes(item.value)}
            className="rounded border-slate-300"
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}

export function RadioRenderer({ field, disabled = true }: FieldRendererProps) {
  const items: VueformItem[] = getActiveItems(field);
  const renderKey = `${field.id}-${items.map(i => i.value).join('-')}`;
  
  return (
    <div key={renderKey} className="space-y-2">
      {items.map((item) => (
        <label
          key={String(item.value)}
          className={`flex items-center gap-2 text-sm text-slate-700 ${
            item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input
            type="radio"
            name={field.id || field.name}
            disabled={disabled || item.disabled}
            defaultChecked={field.default === item.value}
            className="border-slate-300"
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}

export function TableRenderer({ field, disabled = true, preview = false, onUpdateRows }: FieldRendererProps & { preview?: boolean; onUpdateRows?: (rows: Record<string, unknown>[]) => void }) {
  const columns: VueformColumn[] = Array.isArray(field.columns) ? field.columns : [];
  const [rows, setRows] = useState<Record<string, unknown>[]>(field.tableRows || []);
  const renderKey = `${field.id}-${columns.length}-${rows.length}`;

  // Update internal state when field.tableRows changes
  useEffect(() => {
    setRows(field.tableRows || []);
  }, [field.tableRows]);

  const addRow = () => {
    const newRow: Record<string, unknown> = {};
    columns.forEach(col => {
      newRow[col.name] = "";
    });
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    if (onUpdateRows) {
      onUpdateRows(updatedRows);
    }
  };

  const removeRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    if (onUpdateRows) {
      onUpdateRows(updatedRows);
    }
  };

  return (
    <div key={renderKey} className="w-full overflow-x-auto">
      <div className="border border-slate-300 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-sm text-slate-700 bg-slate-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.name}
                className="px-3 py-2 border-b font-medium border-slate-200"
                style={{ width: col.width || "auto" }}
              >
                {col.label}
              </th>
            ))}
            {!preview && (
              <th className="px-3 py-2 border-b font-medium border-slate-200 w-16">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (preview ? 0 : 1)} className="border border-slate-300 p-3 text-center text-slate-500">
                No rows added
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col.name} className="px-3 py-2 border-b border-slate-200">
                    {col.type === "dropdown" && col.options && col.options.length > 0 ? (
                      <div className="w-full text-xs">
                        {col.options.slice(0, 3).map((opt: any, idx: number) => (
                          <div key={idx}>{opt.label || opt.shortName}</div>
                        ))}
                      </div>
                    ) : col.type === "radio" && col.options && col.options.length > 0 ? (
                      <div className="w-full text-xs">
                        {col.options.slice(0, 3).map((opt: any, idx: number) => (
                          <div key={idx}>○ {opt.label || opt.shortName}</div>
                        ))}
                      </div>
                    ) : col.type === "checkbox" && col.options && col.options.length > 0 ? (
                      <div className="w-full text-xs">
                        {col.options.slice(0, 3).map((opt: any, idx: number) => (
                          <div key={idx}>☐ {opt.label || opt.shortName}</div>
                        ))}
                      </div>
                    ) : col.type === "number" ? (
                      <span className="text-slate-500">Number</span>
                    ) : col.type === "email" ? (
                      <span className="text-slate-500">Email</span>
                    ) : (
                      <span className="text-slate-500">Text</span>
                    )}
                  </td>
                ))}
                {!preview && (
                  <td className="border-b border-slate-200 p-1 text-center">
                    {!disabled && (
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                        title="Remove row"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {!preview && !disabled && (
        <button
          onClick={addRow}
          className="mt-2 flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
      )}
    </div>
  );
}

export function SliderRenderer({ field, disabled = true }: FieldRendererProps) {
  const [value, setValue] = useState(field.default as number || field.min as number || 0);
  const min = field.min as number || 0;
  const max = field.max as number || 100;
  const step = field.step || 1;
  const showTooltip = field.showTooltip !== false;
  const showValue = field.showValue !== false;
  const unit = field.unit || "";
  const marks = field.sliderMarks || [];

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative pt-1">
        {showTooltip && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded"
            style={{ left: `${percentage}%` }}
          >
            {value}{unit}
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {marks.length > 0 && (
          <div className="relative w-full h-4">
            {marks.map((mark) => {
              const markPos = ((mark.value - min) / (max - min)) * 100;
              return (
                <div
                  key={mark.value}
                  className="absolute text-xs text-slate-500 transform -translate-x-1/2"
                  style={{ left: `${markPos}%` }}
                >
                  {mark.label || mark.value}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span>{min}{unit}</span>
        {showValue && <span className="font-medium text-slate-600">{value}{unit}</span>}
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export function DividerRenderer({ selected = false }: { field?: FormField; selected?: boolean }) {
  return (
    <div className="w-full py-4">
      <div className={`w-full border-t border-slate-300 ${selected ? "border-sky-500 opacity-100" : "opacity-80"}`} />
    </div>
  );
}

export function SpacerRenderer({ field, selected = false, preview = false }: { field?: FormField; selected?: boolean; preview?: boolean }) {
  const heightValue = field?.height || "32";
  const height = heightValue.toString().match(/^\d+$/) ? `${heightValue}px` : heightValue;
  
  if (preview) {
    return <div style={{ height }} />;
  }
  
  return (
    <div
      className={`border-2 border-dashed ${selected ? "border-sky-400 bg-sky-50" : "border-slate-200"}`}
      style={{ height }}
    />
  );
}

export function HeadingRenderer({ field }: FieldRendererProps) {
  const tag = field.tag || "h2";
  const align = field.align || "left";
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const content = field.label;
  
  const tagStyles: Record<string, string> = {
    h1: "text-4xl font-bold",
    h2: "text-2xl font-bold",
    h3: "text-xl font-semibold",
    h4: "text-lg font-semibold",
    h5: "text-base font-medium",
    h6: "text-sm font-medium",
  };

  const className = `text-slate-900 ${tagStyles[tag]} ${alignClass}`;

  switch (tag) {
    case "h1":
      return <h1 className={className}>{content}</h1>;
    case "h3":
      return <h3 className={className}>{content}</h3>;
    case "h4":
      return <h4 className={className}>{content}</h4>;
    case "h5":
      return <h5 className={className}>{content}</h5>;
    case "h6":
      return <h6 className={className}>{content}</h6>;
    case "h2":
    default:
      return <h2 className={className}>{content}</h2>;
  }
}

export function FieldLabel({ field }: FieldRendererProps) {
  return (
    <div className="pb-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-slate-900">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>
    </div>
  );
}

export function FieldHelper({ description }: { description?: string }) {
  const text = description;
  if (!text) return null;
  return <p className="pb-2 text-xs text-slate-500">{text}</p>;
}



export function FieldInputRenderer({ field, disabled = true }: FieldRendererProps) {
  switch (field.type) {
    case "text":
    case "email":
      return <TextInputRenderer field={field} disabled={disabled} />;
    case "number":
      return <NumberInputRenderer field={field} disabled={disabled} />;
    case "textarea":
      return <TextareaRenderer field={field} disabled={disabled} />;
    case "date":
      return <DateInputRenderer field={field} disabled={disabled} />;
    case "checkbox":
      return <CheckboxRenderer field={field} disabled={disabled} />;
    case "radio":
      return <RadioRenderer field={field} disabled={disabled} />;
    case "dropdown":
      return <DropdownRenderer field={field} disabled={disabled} />;
    case "slider":
      return <SliderRenderer field={field} disabled={disabled} />;
    case "table":
      return <TableRenderer field={field} disabled={disabled} />;
    default:
      return null;
  }
}

export function FormFieldRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <>
      <FieldLabel field={field} />
      <FieldHelper description={field.description} />
      <div className={field.loading ? "opacity-50" : ""}>
        <FieldInputRenderer field={field} disabled={disabled} />
        {field.loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-sky-500 rounded-full" />
          </div>
        )}
      </div>
    </>
  );
}

export function isLayoutElement(type: string): boolean {
  return ["divider", "spacer", "heading", "paragraph"].includes(type);
}

export function LayoutElementRenderer({ field, selected = false }: FieldRendererProps & { selected?: boolean }) {
  switch (field.type) {
    case "divider":
      return <DividerRenderer field={field} selected={selected} />;
    case "spacer":
      return <SpacerRenderer field={field} selected={selected} />;
    case "heading":
    default:
      return null;
  }
}

// Alias for backward compatibility
export { DropdownRenderer as SelectRenderer };
