"use client";

import { useState } from "react";
import { FormField, CustomScript } from "@/app/lib/types";
import { ColumnWidthSelector } from "@/app/components/shared/ColumnWidthSelector";
import { CursorIcon } from "@/app/lib";

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
  const [activeTab, setActiveTab] = useState<"properties" | "scripts">("properties");
  
  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
                          <div className="mb-4 p-4">
                            <CursorIcon className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">No field selected</p>
                          <p className="mt-2 text-xs text-slate-500">
                            Click on a field in the canvas to edit it
                          </p>
                        </div>
    );
  }

  // Common handlers
  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
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

  // Field type checks
  const isTextarea = field.type === "textarea";
  const isSliderField = field.type === "slider";
  const isHeadingField = field.type === "heading";
  const isSpacerField = field.type === "spacer";
  const isLayoutField = ["heading", "divider", "spacer"].includes(field.type);
  
  const showPlaceholder = ["text", "number", "email", "dropdown", "textarea"].includes(field.type);
  const showScripts = !isLayoutField;

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
        {showScripts && (
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
        )}
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

              {/* Description */}
              {!isLayoutField && (
                <InputField
                  label="Description"
                  value={field.description}
                  onChange={(val) => handleChange("description", val)}
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
              />

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


            </Section>

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
                <Toggle
                  label="Auto-resize"
                  checked={field.autosize || false}
                  onChange={(val) => handleChange("autosize", val)}
                />
                <Toggle
                  label="Spellcheck"
                  checked={field.spellcheck !== false}
                  onChange={(val) => handleChange("spellcheck", val)}
                />
              </Section>
            )}

            {/* Choice Field LOV Display (Radio/Checkbox/Select) - Read-only, managed via Custom Fields */}


            {/* Choice Display Options */}




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


            {/* State Options */}
            <Section title="State" defaultOpen={true}>
              <Toggle
                label="Required"
                checked={field.required || false}
                onChange={(val) => handleChange("required", val)}
              />
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
