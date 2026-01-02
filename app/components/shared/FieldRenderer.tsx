"use client";

import type { FormField, VueformItem, VueformColumn } from "../../lib/types";

type FieldRendererProps = {
  field: FormField;
  disabled?: boolean;
};

const sizeClasses = {
  sm: "px-2 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

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
  const size = field.size || "md";
  const hasAddonBefore = field.addons?.before;
  const hasAddonAfter = field.addons?.after;
  
  const inputClasses = `flex-1 border border-slate-300 ${sizeClasses[size]} text-slate-500 bg-white focus:outline-none ${
    !hasAddonBefore && !hasAddonAfter ? "rounded-lg" : ""
  } ${hasAddonBefore && !hasAddonAfter ? "rounded-r-lg" : ""} ${!hasAddonBefore && hasAddonAfter ? "rounded-l-lg" : ""}`;

  const input = (
    <input
      key={`${field.id}-${field.placeholder}-${field.min}-${field.max}`}
      type={field.inputType || "text"}
      placeholder={field.placeholder}
      defaultValue={field.default}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      min={field.min as number}
      max={field.max as number}
      step={field.step}
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

export function NumberInputRenderer({ field, disabled = true }: FieldRendererProps) {
  const size = field.size || "md";
  const hasAddonBefore = field.addons?.before;
  const hasAddonAfter = field.addons?.after;
  
  const inputClasses = `flex-1 border border-slate-300 ${sizeClasses[size]} text-slate-500 bg-white focus:outline-none ${
    !hasAddonBefore && !hasAddonAfter ? "rounded-lg" : ""
  } ${hasAddonBefore && !hasAddonAfter ? "rounded-r-lg" : ""} ${!hasAddonBefore && hasAddonAfter ? "rounded-l-lg" : ""}`;

  const input = (
    <input
      key={`${field.id}-${field.placeholder}-${field.min}-${field.max}-${field.step}`}
      type="number"
      placeholder={field.placeholder}
      defaultValue={field.default}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      min={field.min as number}
      max={field.max as number}
      step={field.step || 1}
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

export function TextareaRenderer({ field, disabled = true }: FieldRendererProps) {
  const size = field.size || "md";
  return (
    <textarea
      key={`${field.id}-${field.placeholder}`}
      placeholder={field.placeholder}
      defaultValue={field.default}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      rows={3}
      className={`w-full border border-slate-300 rounded-lg ${sizeClasses[size]} text-slate-500 bg-white resize-none focus:outline-none`}
    />
  );
}

export function DateInputRenderer({ field, disabled = true }: FieldRendererProps) {
  const size = field.size || "md";
  const hasAddonBefore = field.addons?.before;
  const hasAddonAfter = field.addons?.after;
  
  const inputClasses = `flex-1 border border-slate-300 ${sizeClasses[size]} text-slate-500 bg-white focus:outline-none ${
    !hasAddonBefore && !hasAddonAfter ? "rounded-lg" : ""
  } ${hasAddonBefore && !hasAddonAfter ? "rounded-r-lg" : ""} ${!hasAddonBefore && hasAddonAfter ? "rounded-l-lg" : ""}`;

  const input = (
    <input
      key={`${field.id}-${field.format}-${field.minDate}-${field.maxDate}`}
      type="date"
      placeholder={field.placeholder || field.format}
      defaultValue={field.default}
      disabled={disabled || field.disabled}
      readOnly={field.readonly}
      min={field.minDate}
      max={field.maxDate}
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

export function SelectRenderer({ field, disabled = true }: FieldRendererProps) {
  const size = field.size || "md";
  const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
  
  return (
    <select
      key={`${field.id}-${items.length}-${field.placeholder}`}
      disabled={disabled || field.disabled}
      defaultValue={field.default}
      className={`w-full border border-slate-300 rounded-lg ${sizeClasses[size]} text-slate-500 bg-white focus:outline-none`}
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
  const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
  const view = field.view || "default";
  const labelPosition = field.labelPosition || "right";
  const size = field.size || "md";
  const renderKey = `${field.id}-${items.map(i => i.value).join('-')}-${view}`;
  
  if (view === "tabs") {
    return (
      <div key={renderKey} className="flex flex-wrap gap-2">
        {items.map((item) => (
          <label
            key={String(item.value)}
            className={`flex items-center gap-2 border border-slate-300 rounded-lg ${sizeClasses[size]} cursor-pointer hover:bg-slate-50 ${
              item.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="checkbox"
              disabled={disabled || field.disabled || item.disabled}
              defaultChecked={Array.isArray(field.default) && field.default.includes(item.value)}
              className="rounded border-slate-300"
            />
            <span className="text-slate-700">{item.label}</span>
          </label>
        ))}
      </div>
    );
  }
  
  if (view === "blocks") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <label
            key={String(item.value)}
            className={`flex items-center gap-3 border border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 ${
              item.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="checkbox"
              disabled={disabled || field.disabled || item.disabled}
              defaultChecked={Array.isArray(field.default) && field.default.includes(item.value)}
              className="rounded border-slate-300"
            />
            <span className="text-slate-700">{item.label}</span>
          </label>
        ))}
      </div>
    );
  }

  // Default view
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label
          key={String(item.value)}
          className={`flex items-center gap-2 text-sm text-slate-700 ${
            item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${labelPosition === "left" ? "flex-row-reverse justify-end" : ""}`}
        >
          <input
            type="checkbox"
            disabled={disabled || field.disabled || item.disabled}
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
  const items: VueformItem[] = field.items || (field.options || []).map((opt: string) => ({ value: opt, label: opt }));
  const view = field.view || "default";
  const labelPosition = field.labelPosition || "right";
  const size = field.size || "md";
  const renderKey = `${field.id}-${items.map(i => i.value).join('-')}-${view}`;
  
  if (view === "tabs") {
    return (
      <div key={renderKey} className="flex flex-wrap gap-2">
        {items.map((item) => (
          <label
            key={String(item.value)}
            className={`flex items-center gap-2 border border-slate-300 rounded-lg ${sizeClasses[size]} cursor-pointer hover:bg-slate-50 ${
              item.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="radio"
              name={field.id || field.name}
              disabled={disabled || field.disabled || item.disabled}
              defaultChecked={field.default === item.value}
              className="border-slate-300"
            />
            <span className="text-slate-700">{item.label}</span>
          </label>
        ))}
      </div>
    );
  }
  
  if (view === "blocks") {
    return (
      <div key={renderKey} className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <label
            key={String(item.value)}
            className={`flex items-center gap-3 border border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 ${
              item.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="radio"
              name={field.id || field.name}
              disabled={disabled || field.disabled || item.disabled}
              defaultChecked={field.default === item.value}
              className="border-slate-300"
            />
            <span className="text-slate-700">{item.label}</span>
          </label>
        ))}
      </div>
    );
  }

  // Default view
  return (
    <div key={renderKey} className="space-y-2">
      {items.map((item) => (
        <label
          key={String(item.value)}
          className={`flex items-center gap-2 text-sm text-slate-700 ${
            item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${labelPosition === "left" ? "flex-row-reverse justify-end" : ""}`}
        >
          <input
            type="radio"
            name={field.id || field.name}
            disabled={disabled || field.disabled || item.disabled}
            defaultChecked={field.default === item.value}
            className="border-slate-300"
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}

export function TableRenderer({ field, disabled = true }: FieldRendererProps) {
  const columns: VueformColumn[] = field.columns || [];
  const rows: Record<string, any>[] = (field.rows as Record<string, any>[]) || [];
  const size = field.size || "md";
  const addable = field.addable !== false;
  const removable = field.removable !== false;
  const renderKey = `${field.id}-${columns.length}-${rows.length}`;

  return (
    <div key={renderKey} className="w-full overflow-x-auto">
      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100">
            {columns.map((col) => (
              <th
                key={col.name}
                className={`border border-slate-300 ${sizeClasses[size]} text-left font-medium text-slate-700`}
                style={{ width: col.width || "auto" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="border border-slate-300 p-4 text-center text-slate-500">
                No rows added
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col.name} className="border border-slate-300 p-1">
                    {col.type === "select" ? (
                      <select
                        disabled={disabled || field.disabled}
                        className={`w-full border-0 bg-transparent ${sizeClasses[size]} text-slate-500 focus:outline-none`}
                        defaultValue={row[col.name] || ""}
                      >
                        <option value="">Select...</option>
                        {(col.options || []).map((opt) => (
                          <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={col.type || "text"}
                        placeholder={col.placeholder || ""}
                        disabled={disabled || field.disabled}
                        className={`w-full border-0 bg-transparent ${sizeClasses[size]} text-slate-500 focus:outline-none`}
                        defaultValue={row[col.name] || ""}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DividerRenderer({ selected = false }: { selected?: boolean }) {
  return (
    <div className={`border-t ${selected ? "border-sky-500" : "border-slate-300"}`} />
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
  const content = field.content || field.label;
  
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
        {field.info && (
          <span
            className="text-slate-400 hover:text-slate-600 cursor-help"
            title={field.info}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
      </div>
      {field.floating && typeof field.floating === "string" && (
        <span className="text-xs text-slate-400">{field.floating}</span>
      )}
    </div>
  );
}

export function FieldHelper({ helper, description }: { helper?: string; description?: string }) {
  const text = helper || description;
  if (!text) return null;
  return <p className="pb-2 text-xs text-slate-500">{text}</p>;
}

export function FieldBefore({ before }: { before?: string }) {
  if (!before) return null;
  return <p className="pb-1 text-xs text-slate-600">{before}</p>;
}

export function FieldBetween({ between }: { between?: string }) {
  if (!between) return null;
  return <p className="py-1 text-xs text-slate-600">{between}</p>;
}

export function FieldAfter({ after }: { after?: string }) {
  if (!after) return null;
  return <p className="pt-1 text-xs text-slate-600">{after}</p>;
}

export function FieldInputRenderer({ field, disabled = true }: FieldRendererProps) {
  switch (field.type) {
    case "text":
    case "email":
    case "url":
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
    case "table":
      return <TableRenderer field={field} disabled={disabled} />;
    default:
      return null;
  }
}

export function FormFieldRenderer({ field, disabled = true }: FieldRendererProps) {
  return (
    <>
      <FieldBefore before={field.before} />
      <FieldLabel field={field} />
      <FieldHelper helper={field.helper} description={field.description} />
      <div className={field.loading ? "opacity-50" : ""}>
        <FieldInputRenderer field={field} disabled={disabled} />
        {field.loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-sky-500 rounded-full" />
          </div>
        )}
      </div>
      <FieldBetween between={field.between} />
      <FieldAfter after={field.after} />
    </>
  );
}

export function isLayoutElement(type: string): boolean {
  return ["divider", "spacer", "heading", "paragraph"].includes(type);
}

export function LayoutElementRenderer({ field, selected = false }: FieldRendererProps & { selected?: boolean }) {
  switch (field.type) {
    case "divider":
      return <DividerRenderer selected={selected} />;
    case "spacer":
      return <SpacerRenderer field={field} selected={selected} />;
    case "heading":
    default:
      return null;
  }
}
