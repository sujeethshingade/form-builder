"use client";

import { useState } from "react";
import { FormField, VueformColumn, CustomScript, ValidationRule, ConditionalLogic, LOVItem } from "@/app/lib/types";
import { ColumnWidthSelector } from "@/app/components/shared/ColumnWidthSelector";

type TableColumn = VueformColumn;

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

interface InspectorSidebarProps {
  field: FormField | null;
  onClose: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
}

// Collapsible Section Component
function Section({ 
  title, 
  children, 
  defaultOpen = true,
  icon
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </button>
      {isOpen && <div className="mt-2 space-y-3">{children}</div>}
    </div>
  );
}

// Toggle Switch Component
function Toggle({ 
  checked, 
  onChange, 
  label,
  description
}: { 
  checked: boolean; 
  onChange: (val: boolean) => void; 
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-sky-400" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  step,
  description
}: {
  label: string;
  value: string | number | undefined;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
      />
    </div>
  );
}

// Select Field Component
function SelectField({
  label,
  value,
  onChange,
  options,
  description
}: {
  label: string;
  value: string | undefined;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function InspectorSidebar({
  field,
  onUpdate,
}: InspectorSidebarProps) {
  const [activeTab, setActiveTab] = useState<"properties" | "validation" | "scripts">("properties");
  
  if (!field) {
    return (
      <div className="w-full bg-white border-l border-gray-200 p-4 flex items-center justify-center text-gray-500">
        Select a field to edit its properties
      </div>
    );
  }

  // Common handlers
  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  // Table column handlers
  const handleColumnsChange = (columns: TableColumn[]) => {
    onUpdate({ columns });
  };

  const addColumn = () => {
    const currentColumns = Array.isArray(field.columns) ? field.columns : [];
    const newColumn: TableColumn = {
      name: `column_${currentColumns.length + 1}`,
      label: `Column ${currentColumns.length + 1}`,
      type: "text",
    };
    handleColumnsChange([...currentColumns, newColumn]);
  };

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const currentColumns = Array.isArray(field.columns) ? field.columns : [];
    const updatedColumns = currentColumns.map((col: VueformColumn, i: number) =>
      i === index ? { ...col, ...updates } : col
    );
    handleColumnsChange(updatedColumns);
  };

  const removeColumn = (index: number) => {
    const currentColumns = Array.isArray(field.columns) ? field.columns : [];
    handleColumnsChange(currentColumns.filter((_: VueformColumn, i: number) => i !== index));
  };

  // Custom Scripts handlers
  const handleScriptsChange = (scripts: CustomScript[]) => {
    onUpdate({ scripts });
  };

  const addScript = () => {
    const currentScripts = field.scripts || [];
    const newScript: CustomScript = {
      id: `script_${Date.now()}`,
      name: `Script ${currentScripts.length + 1}`,
      trigger: "onChange",
      code: "// Your custom JavaScript code here\n// Available: value, field, form\nconsole.log('Field value:', value);",
      enabled: true,
      description: "",
    };
    handleScriptsChange([...currentScripts, newScript]);
  };

  const updateScript = (index: number, updates: Partial<CustomScript>) => {
    const currentScripts = field.scripts || [];
    const updatedScripts = currentScripts.map((script, i) =>
      i === index ? { ...script, ...updates } : script
    );
    handleScriptsChange(updatedScripts);
  };

  const removeScript = (index: number) => {
    const currentScripts = field.scripts || [];
    handleScriptsChange(currentScripts.filter((_, i) => i !== index));
  };

  // Validation Rules handlers
  const handleValidationRulesChange = (rules: ValidationRule[]) => {
    onUpdate({ validationRules: rules });
  };

  const addValidationRule = () => {
    const currentRules = field.validationRules || [];
    const newRule: ValidationRule = {
      id: `rule_${Date.now()}`,
      type: "required",
      message: "This field is required",
      enabled: true,
    };
    handleValidationRulesChange([...currentRules, newRule]);
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const currentRules = field.validationRules || [];
    const updatedRules = currentRules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    );
    handleValidationRulesChange(updatedRules);
  };

  const removeValidationRule = (index: number) => {
    const currentRules = field.validationRules || [];
    handleValidationRulesChange(currentRules.filter((_, i) => i !== index));
  };

  // Field type checks
  const isTextInput = ["text", "email"].includes(field.type);
  const isNumberInput = field.type === "number";
  const isTextarea = field.type === "textarea";
  const isChoiceField = ["checkbox", "radio", "dropdown"].includes(field.type);
  const isDateField = field.type === "date";
  const isSliderField = field.type === "slider";
  const isTableField = field.type === "table";
  const isHeadingField = field.type === "heading";
  const isDividerField = field.type === "divider";
  const isSpacerField = field.type === "spacer";
  const isLayoutField = ["heading", "divider", "spacer"].includes(field.type);
  
  const showPlaceholder = ["text", "number", "email", "dropdown", "textarea"].includes(field.type);
  const showRequired = !isLayoutField;

  return (
    <div className="w-full bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Tab Header */}
      <div className="border-b border-gray-200 px-2 py-2 flex gap-1">
        <button
          onClick={() => setActiveTab("properties")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "properties" 
              ? "bg-sky-100 text-sky-700" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Properties
        </button>
        {showRequired && (
          <button
            onClick={() => setActiveTab("validation")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "validation" 
                ? "bg-sky-100 text-sky-700" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Validation
          </button>
        )}
        <button
          onClick={() => setActiveTab("scripts")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "scripts" 
              ? "bg-sky-100 text-sky-700" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Scripts
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "properties" && (
          <>
            {/* Basic Properties Section */}
            <Section title="Basic" defaultOpen={true}>
              {/* Label */}
              <InputField
                label="Label"
                value={field.label}
                onChange={(val) => handleChange("label", val)}
              />

              {/* Placeholder */}
              {showPlaceholder && (
                <InputField
                  label="Placeholder"
                  value={field.placeholder}
                  onChange={(val) => handleChange("placeholder", val)}
                />
              )}

              {/* Content for Heading */}
              {isHeadingField && (
                <InputField
                  label="Content"
                  value={field.content}
                  onChange={(val) => handleChange("content", val)}
                />
              )}

              {/* Helper Text */}
              {!isLayoutField && (
                <InputField
                  label="Helper Text"
                  value={field.helper}
                  onChange={(val) => handleChange("helper", val)}
                  description="Displayed below the field"
                />
              )}

              {/* Description */}
              {!isLayoutField && (
                <InputField
                  label="Description"
                  value={field.description}
                  onChange={(val) => handleChange("description", val)}
                />
              )}

              {/* Info Tooltip */}
              {!isLayoutField && (
                <InputField
                  label="Info Tooltip"
                  value={field.info}
                  onChange={(val) => handleChange("info", val)}
                  description="Shown as (i) icon tooltip"
                />
              )}
            </Section>

            {/* Layout Section */}
            <Section title="Layout" defaultOpen={true}>
              {/* 12-Column Width Selector */}
              <ColumnWidthSelector
                value={field.widthColumns || 12}
                onChange={(columns) => handleChange("widthColumns", columns)}
                label="Width"
                description="Select how many columns this field spans (1-12)"
              />

              {/* Size */}
              {!isLayoutField && (
                <SelectField
                  label="Size"
                  value={field.size}
                  onChange={(val) => handleChange("size", val)}
                  options={[
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]}
                />
              )}

              {/* Heading Tag */}
              {isHeadingField && (
                <SelectField
                  label="Heading Level"
                  value={field.tag}
                  onChange={(val) => handleChange("tag", val)}
                  options={[
                    { value: "h1", label: "H1 - Largest" },
                    { value: "h2", label: "H2" },
                    { value: "h3", label: "H3" },
                    { value: "h4", label: "H4" },
                    { value: "h5", label: "H5" },
                    { value: "h6", label: "H6 - Smallest" },
                  ]}
                />
              )}

              {/* Alignment for heading */}
              {isHeadingField && (
                <SelectField
                  label="Alignment"
                  value={field.align}
                  onChange={(val) => handleChange("align", val)}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ]}
                />
              )}

              {/* Spacer Height */}
              {isSpacerField && (
                <InputField
                  label="Height"
                  value={field.height}
                  onChange={(val) => handleChange("height", val)}
                  placeholder="1rem"
                />
              )}

              {/* Divider Style */}
              {isDividerField && (
                <>
                  <SelectField
                    label="Style"
                    value={field.dividerStyle}
                    onChange={(val) => handleChange("dividerStyle", val)}
                    options={[
                      { value: "solid", label: "Solid" },
                      { value: "dashed", label: "Dashed" },
                      { value: "dotted", label: "Dotted" },
                    ]}
                  />
                  <InputField
                    label="Thickness (px)"
                    value={field.thickness}
                    onChange={(val) => handleChange("thickness", parseInt(val) || 1)}
                    type="number"
                    min={1}
                    max={10}
                  />
                </>
              )}
            </Section>

            {/* Text Input Properties */}
            {isTextInput && (
              <Section title="Text Options" defaultOpen={false}>
                <InputField
                  label="Min Length"
                  value={field.minLength}
                  onChange={(val) => handleChange("minLength", val ? parseInt(val) : undefined)}
                  type="number"
                  min={0}
                />
                <InputField
                  label="Max Length"
                  value={field.maxLength}
                  onChange={(val) => handleChange("maxLength", val ? parseInt(val) : undefined)}
                  type="number"
                  min={0}
                />
                <InputField
                  label="Pattern (Regex)"
                  value={field.pattern}
                  onChange={(val) => handleChange("pattern", val)}
                  placeholder="^[a-zA-Z]+$"
                />
                <SelectField
                  label="Input Mode"
                  value={field.inputmode}
                  onChange={(val) => handleChange("inputmode", val)}
                  options={[
                    { value: "text", label: "Text" },
                    { value: "email", label: "Email" },
                    { value: "tel", label: "Telephone" },
                    { value: "numeric", label: "Numeric" },
                    { value: "decimal", label: "Decimal" },
                    { value: "search", label: "Search" },
                  ]}
                />
                <SelectField
                  label="Transform"
                  value={field.transform}
                  onChange={(val) => handleChange("transform", val)}
                  options={[
                    { value: "none", label: "None" },
                    { value: "lowercase", label: "Lowercase" },
                    { value: "uppercase", label: "Uppercase" },
                    { value: "capitalize", label: "Capitalize" },
                  ]}
                />
                <InputField
                  label="Input Mask"
                  value={field.mask}
                  onChange={(val) => handleChange("mask", val)}
                  placeholder="(###) ###-####"
                />
                <InputField
                  label="Prefix"
                  value={field.prefix}
                  onChange={(val) => handleChange("prefix", val)}
                />
                <InputField
                  label="Suffix"
                  value={field.suffix}
                  onChange={(val) => handleChange("suffix", val)}
                />
                <InputField
                  label="Debounce (ms)"
                  value={field.debounce}
                  onChange={(val) => handleChange("debounce", val ? parseInt(val) : 0)}
                  type="number"
                  min={0}
                />
                <Toggle
                  label="Show Counter"
                  checked={field.counter || false}
                  onChange={(val) => handleChange("counter", val)}
                />
                <Toggle
                  label="Clearable"
                  checked={field.clearable || false}
                  onChange={(val) => handleChange("clearable", val)}
                />
              </Section>
            )}

            {/* Textarea Properties */}
            {isTextarea && (
              <Section title="Textarea Options" defaultOpen={false}>
                <InputField
                  label="Rows"
                  value={field.rows}
                  onChange={(val) => handleChange("rows", parseInt(val) || 3)}
                  type="number"
                  min={1}
                  max={20}
                />
                <InputField
                  label="Min Length"
                  value={field.minLength}
                  onChange={(val) => handleChange("minLength", val ? parseInt(val) : undefined)}
                  type="number"
                  min={0}
                />
                <InputField
                  label="Max Length"
                  value={field.maxLength}
                  onChange={(val) => handleChange("maxLength", val ? parseInt(val) : undefined)}
                  type="number"
                  min={0}
                />
                <Toggle
                  label="Auto-resize"
                  checked={field.autosize || false}
                  onChange={(val) => handleChange("autosize", val)}
                />
                <Toggle
                  label="Show Counter"
                  checked={field.counter || false}
                  onChange={(val) => handleChange("counter", val)}
                />
                <Toggle
                  label="Spellcheck"
                  checked={field.spellcheck !== false}
                  onChange={(val) => handleChange("spellcheck", val)}
                />
              </Section>
            )}

            {/* Number Input Properties */}
            {isNumberInput && (
              <Section title="Number Options" defaultOpen={false}>
                <InputField
                  label="Min Value"
                  value={field.min as number}
                  onChange={(val) => handleChange("min", val ? parseFloat(val) : null)}
                  type="number"
                />
                <InputField
                  label="Max Value"
                  value={field.max as number}
                  onChange={(val) => handleChange("max", val ? parseFloat(val) : null)}
                  type="number"
                />
                <InputField
                  label="Step"
                  value={field.step}
                  onChange={(val) => handleChange("step", parseFloat(val) || 1)}
                  type="number"
                  step={0.1}
                />
                <InputField
                  label="Decimals"
                  value={field.decimals}
                  onChange={(val) => handleChange("decimals", val ? parseInt(val) : undefined)}
                  type="number"
                  min={0}
                  max={10}
                />
                <InputField
                  label="Prefix"
                  value={field.prefix}
                  onChange={(val) => handleChange("prefix", val)}
                  placeholder="$"
                />
                <InputField
                  label="Suffix"
                  value={field.suffix}
                  onChange={(val) => handleChange("suffix", val)}
                  placeholder="%"
                />
                <Toggle
                  label="Allow Negative"
                  checked={field.allowNegative !== false}
                  onChange={(val) => handleChange("allowNegative", val)}
                />
                <Toggle
                  label="Show Controls (+/-)"
                  checked={field.controls || false}
                  onChange={(val) => handleChange("controls", val)}
                />
              </Section>
            )}

            {/* Choice Field LOV Display (Radio/Checkbox/Select) - Read-only, managed via Custom Fields */}
            {isChoiceField && field.lovItems && field.lovItems.length > 0 && (
              <Section title="Options (from LOV)" defaultOpen={true}>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Options are managed via Custom Fields. Only active items are shown in the form.
                  </p>
                  {field.lovItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${
                        item.status === 'Active' 
                          ? 'border-green-200 bg-green-50 text-green-700' 
                          : 'border-gray-200 bg-gray-50 text-gray-400 line-through'
                      }`}
                    >
                      <span className="flex-1">{item.shortName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.status === 'Active' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Choice Display Options */}
            {isChoiceField && (
              <Section title="Display Options" defaultOpen={false}>
                {field.type !== "dropdown" && (
                  <>
                    <SelectField
                      label="View Style"
                      value={field.view}
                      onChange={(val) => handleChange("view", val)}
                      options={[
                        { value: "default", label: "Default" },
                        { value: "tabs", label: "Tabs" },
                        { value: "blocks", label: "Blocks" },
                      ]}
                    />
                    <SelectField
                      label="Label Position"
                      value={field.labelPosition}
                      onChange={(val) => handleChange("labelPosition", val)}
                      options={[
                        { value: "right", label: "Right" },
                        { value: "left", label: "Left" },
                      ]}
                    />
                    <InputField
                      label="Columns"
                      value={field.columns as number}
                      onChange={(val) => handleChange("columns", val ? parseInt(val) : undefined)}
                      type="number"
                      min={1}
                      max={4}
                    />
                    <Toggle
                      label="Inline Layout"
                      checked={field.inlineOptions || false}
                      onChange={(val) => handleChange("inlineOptions", val)}
                    />
                  </>
                )}
                
                {field.type === "checkbox" && (
                  <>
                    <Toggle
                      label="Show Select All"
                      checked={field.selectAll || false}
                      onChange={(val) => handleChange("selectAll", val)}
                    />
                    <InputField
                      label="Min Selections"
                      value={field.min as number}
                      onChange={(val) => handleChange("min", val ? parseInt(val) : undefined)}
                      type="number"
                      min={0}
                    />
                    <InputField
                      label="Max Selections"
                      value={field.max as number}
                      onChange={(val) => handleChange("max", val ? parseInt(val) : undefined)}
                      type="number"
                      min={0}
                    />
                  </>
                )}

                {field.type === "dropdown" && (
                  <>
                    <Toggle
                      label="Multiple Selection"
                      checked={field.multiple || false}
                      onChange={(val) => handleChange("multiple", val)}
                    />
                    <Toggle
                      label="Searchable"
                      checked={field.search || false}
                      onChange={(val) => handleChange("search", val)}
                    />
                    <Toggle
                      label="Can Clear"
                      checked={field.canClear !== false}
                      onChange={(val) => handleChange("canClear", val)}
                    />
                    <Toggle
                      label="Native Select"
                      checked={field.native || false}
                      onChange={(val) => handleChange("native", val)}
                    />
                    <Toggle
                      label="Allow Create"
                      checked={field.create || false}
                      onChange={(val) => handleChange("create", val)}
                      description="Allow creating new options"
                    />
                  </>
                )}

                <Toggle
                  label="Has 'Other' Option"
                  checked={field.hasOther || false}
                  onChange={(val) => handleChange("hasOther", val)}
                />
                {field.hasOther && (
                  <InputField
                    label="Other Text"
                    value={field.otherText}
                    onChange={(val) => handleChange("otherText", val)}
                    placeholder="Other"
                  />
                )}
              </Section>
            )}

            {/* Date Options */}
            {isDateField && (
              <Section title="Date Options" defaultOpen={false}>
                <SelectField
                  label="Mode"
                  value={field.mode}
                  onChange={(val) => handleChange("mode", val)}
                  options={[
                    { value: "date", label: "Date" },
                    { value: "datetime", label: "Date & Time" },
                    { value: "time", label: "Time Only" },
                    { value: "month", label: "Month" },
                    { value: "year", label: "Year" },
                    { value: "range", label: "Date Range" },
                  ]}
                />
                <InputField
                  label="Display Format"
                  value={field.displayFormat}
                  onChange={(val) => handleChange("displayFormat", val)}
                  placeholder="MM/DD/YYYY"
                />
                <InputField
                  label="Value Format"
                  value={field.format}
                  onChange={(val) => handleChange("format", val)}
                  placeholder="YYYY-MM-DD"
                />
                <InputField
                  label="Min Date"
                  value={field.minDate}
                  onChange={(val) => handleChange("minDate", val)}
                  type="date"
                />
                <InputField
                  label="Max Date"
                  value={field.maxDate}
                  onChange={(val) => handleChange("maxDate", val)}
                  type="date"
                />
                <Toggle
                  label="Clearable"
                  checked={field.clearable !== false}
                  onChange={(val) => handleChange("clearable", val)}
                />
                <Toggle
                  label="Close on Select"
                  checked={field.closeOnSelect !== false}
                  onChange={(val) => handleChange("closeOnSelect", val)}
                />
                <Toggle
                  label="Inline Calendar"
                  checked={field.inline || false}
                  onChange={(val) => handleChange("inline", val)}
                />
              </Section>
            )}

            {/* File Upload Options */}


            {/* Slider Options */}
            {isSliderField && (
              <Section title="Slider Options" defaultOpen={false}>
                <InputField
                  label="Min Value"
                  value={field.min as number}
                  onChange={(val) => handleChange("min", parseFloat(val) || 0)}
                  type="number"
                />
                <InputField
                  label="Max Value"
                  value={field.max as number}
                  onChange={(val) => handleChange("max", parseFloat(val) || 100)}
                  type="number"
                />
                <InputField
                  label="Step"
                  value={field.step}
                  onChange={(val) => handleChange("step", parseFloat(val) || 1)}
                  type="number"
                  step={0.1}
                />
                <SelectField
                  label="Show Tooltip"
                  value={String(field.showTooltip)}
                  onChange={(val) => handleChange("showTooltip", val === "true" ? true : val === "false" ? false : val)}
                  options={[
                    { value: "true", label: "Always" },
                    { value: "drag", label: "On Drag" },
                    { value: "false", label: "Never" },
                  ]}
                />
                <SelectField
                  label="Orientation"
                  value={field.orientation}
                  onChange={(val) => handleChange("orientation", val)}
                  options={[
                    { value: "horizontal", label: "Horizontal" },
                    { value: "vertical", label: "Vertical" },
                  ]}
                />
                <Toggle
                  label="Show Value"
                  checked={field.showValue !== false}
                  onChange={(val) => handleChange("showValue", val)}
                />
                <Toggle
                  label="Range Mode"
                  checked={field.range || false}
                  onChange={(val) => handleChange("range", val)}
                  description="Two handles for range selection"
                />
              </Section>
            )}

            {/* Table Options */}
            {isTableField && (
              <>
                <Section title="Columns" defaultOpen={true}>
                  <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border border-gray-200 mb-3">
                    Columns are managed by the associated Custom Field settings. Rows can be added/removed directly in the canvas.
                  </div>
                  <div className="space-y-2">
                    {((field.columns as VueformColumn[]) || []).map((col, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border border-gray-100 rounded bg-gray-50">
                        <span className="text-sm font-medium text-gray-700 flex-1">{col.label}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{col.type}</span>
                      </div>
                    ))}
                    {(!field.columns || (Array.isArray(field.columns) && field.columns.length === 0)) && (
                      <div className="text-sm text-gray-400 text-center py-2">
                        No columns defined.
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Table Options" defaultOpen={false}>
                  <InputField
                    label="Empty Text"
                    value={field.emptyText}
                    onChange={(val) => handleChange("emptyText", val)}
                    placeholder="No rows added"
                  />
                  <Toggle
                    label="Show Header"
                    checked={field.showHeader !== false}
                    onChange={(val) => handleChange("showHeader", val)}
                  />
                  <Toggle
                    label="Striped Rows"
                    checked={field.striped || false}
                    onChange={(val) => handleChange("striped", val)}
                  />
                  <Toggle
                    label="Bordered"
                    checked={field.bordered !== false}
                    onChange={(val) => handleChange("bordered", val)}
                  />
                  <Toggle
                    label="Hover Effect"
                    checked={field.hover !== false}
                    onChange={(val) => handleChange("hover", val)}
                  />
                  <Toggle
                    label="Compact"
                    checked={field.compact || false}
                    onChange={(val) => handleChange("compact", val)}
                  />
                </Section>
              </>
            )}

            {/* State Options */}
            {showRequired && (
              <Section title="State" defaultOpen={true}>
                <Toggle
                  label="Required"
                  checked={field.required || false}
                  onChange={(val) => handleChange("required", val)}
                />
                <Toggle
                  label="Disabled"
                  checked={field.disabled || false}
                  onChange={(val) => handleChange("disabled", val)}
                />
                <Toggle
                  label="Read Only"
                  checked={field.readonly || false}
                  onChange={(val) => handleChange("readonly", val)}
                />
                <Toggle
                  label="Autofocus"
                  checked={field.autofocus || false}
                  onChange={(val) => handleChange("autofocus", val)}
                />
                <Toggle
                  label="Floating Label"
                  checked={!!field.floating}
                  onChange={(val) => handleChange("floating", val)}
                />
              </Section>
            )}

            {/* Heading Styling */}
            {isHeadingField && (
              <Section title="Styling" defaultOpen={false}>
                <InputField
                  label="Color"
                  value={field.color}
                  onChange={(val) => handleChange("color", val)}
                  type="color"
                />
                <InputField
                  label="Font Size"
                  value={field.fontSize}
                  onChange={(val) => handleChange("fontSize", val)}
                  placeholder="2rem"
                />
                <SelectField
                  label="Font Weight"
                  value={field.fontWeight}
                  onChange={(val) => handleChange("fontWeight", val)}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "medium", label: "Medium" },
                    { value: "semibold", label: "Semi Bold" },
                    { value: "bold", label: "Bold" },
                  ]}
                />
                <InputField
                  label="Margin Top"
                  value={field.marginTop}
                  onChange={(val) => handleChange("marginTop", val)}
                  placeholder="1rem"
                />
                <InputField
                  label="Margin Bottom"
                  value={field.marginBottom}
                  onChange={(val) => handleChange("marginBottom", val)}
                  placeholder="0.5rem"
                />
                <Toggle
                  label="Collapsible Section"
                  checked={field.collapsible || false}
                  onChange={(val) => handleChange("collapsible", val)}
                />
              </Section>
            )}
          </>
        )}

        {activeTab === "validation" && showRequired && (
          <>
            {/* Validation Rules Section */}
            <Section title="Validation Rules" defaultOpen={true}>
              <div className="space-y-3">
                {(field.validationRules || []).map((rule, index) => (
                  <div key={rule.id} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Toggle
                        label=""
                        checked={rule.enabled}
                        onChange={(val) => updateValidationRule(index, { enabled: val })}
                      />
                      <button
                        onClick={() => removeValidationRule(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <SelectField
                      label="Type"
                      value={rule.type}
                      onChange={(val) => updateValidationRule(index, { type: val as ValidationRule["type"] })}
                      options={[
                        { value: "required", label: "Required" },
                        { value: "minLength", label: "Min Length" },
                        { value: "maxLength", label: "Max Length" },
                        { value: "min", label: "Min Value" },
                        { value: "max", label: "Max Value" },
                        { value: "pattern", label: "Pattern (Regex)" },
                        { value: "email", label: "Email Format" },
                        { value: "custom", label: "Custom (JavaScript)" },
                      ]}
                    />
                    {["minLength", "maxLength", "min", "max"].includes(rule.type) && (
                      <InputField
                        label="Value"
                        value={rule.value as number}
                        onChange={(val) => updateValidationRule(index, { value: val ? parseFloat(val) : undefined })}
                        type="number"
                      />
                    )}
                    {rule.type === "pattern" && (
                      <InputField
                        label="Pattern"
                        value={rule.value as string}
                        onChange={(val) => updateValidationRule(index, { value: val })}
                        placeholder="^[a-zA-Z0-9]+$"
                      />
                    )}
                    {rule.type === "custom" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Validator (JavaScript)
                        </label>
                        <textarea
                          value={rule.customValidator || ""}
                          onChange={(e) => updateValidationRule(index, { customValidator: e.target.value })}
                          placeholder="// Return true if valid, false if invalid
// Available: value, field
return value.length > 5;"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono text-xs"
                        />
                      </div>
                    )}
                    <InputField
                      label="Error Message"
                      value={rule.message}
                      onChange={(val) => updateValidationRule(index, { message: val })}
                      placeholder="This field is invalid"
                    />
                  </div>
                ))}
                <button
                  onClick={addValidationRule}
                  className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-600 font-medium"
                >
                  <PlusIcon />
                  Add Validation Rule
                </button>
              </div>
            </Section>
          </>
        )}

        {activeTab === "scripts" && (
          <>
            {/* Custom Scripts Section */}
            <Section title="Custom Scripts" defaultOpen={true} icon={<CodeIcon />}>
              <p className="text-xs text-gray-500 mb-3">
                Add custom JavaScript code that runs on specific events. Available variables: <code className="bg-gray-100 px-1 rounded">value</code>, <code className="bg-gray-100 px-1 rounded">field</code>, <code className="bg-gray-100 px-1 rounded">form</code>
              </p>
              <div className="space-y-3">
                {(field.scripts || []).map((script, index) => (
                  <div key={script.id} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Toggle
                        label=""
                        checked={script.enabled}
                        onChange={(val) => updateScript(index, { enabled: val })}
                      />
                      <button
                        onClick={() => removeScript(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <InputField
                      label="Name"
                      value={script.name}
                      onChange={(val) => updateScript(index, { name: val })}
                      placeholder="Script name"
                    />
                    <SelectField
                      label="Trigger"
                      value={script.trigger}
                      onChange={(val) => updateScript(index, { trigger: val as CustomScript["trigger"] })}
                      options={[
                        { value: "onChange", label: "On Change" },
                        { value: "onBlur", label: "On Blur (Focus Lost)" },
                        { value: "onFocus", label: "On Focus" },
                        { value: "onMount", label: "On Mount (Load)" },
                        { value: "onValidate", label: "On Validate" },
                        { value: "onSubmit", label: "On Submit" },
                      ]}
                    />
                    <InputField
                      label="Description"
                      value={script.description}
                      onChange={(val) => updateScript(index, { description: val })}
                      placeholder="What does this script do?"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        JavaScript Code
                      </label>
                      <textarea
                        value={script.code}
                        onChange={(e) => updateScript(index, { code: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs font-mono bg-gray-900 text-green-400"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addScript}
                  className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-600 font-medium"
                >
                  <PlusIcon />
                  Add Script
                </button>
              </div>
            </Section>

            {/* Script Examples */}
            <Section title="Script Examples" defaultOpen={false}>
              <div className="space-y-3 text-xs">
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium text-gray-700 mb-1">onChange - Transform Value</p>
                  <pre className="text-gray-600 whitespace-pre-wrap">{"// Convert to uppercase\nreturn value.toUpperCase();"}</pre>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium text-gray-700 mb-1">onValidate - Custom Validation</p>
                  <pre className="text-gray-600 whitespace-pre-wrap">{"// Check if value starts with 'ABC'\nif (!value.startsWith('ABC')) {\n  return 'Must start with ABC';\n}\nreturn true;"}</pre>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium text-gray-700 mb-1">onBlur - API Call</p>
                  <pre className="text-gray-600 whitespace-pre-wrap">{"// Validate against API\nconst isValid = await fetch('/api/validate?v=' + value);\nconsole.log('Valid:', isValid);"}</pre>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
