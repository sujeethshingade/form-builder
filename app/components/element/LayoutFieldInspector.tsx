"use client";

import { useState } from "react";
import { ColumnWidthSelector } from "@/app/components/shared/ColumnWidthSelector";
import { LayoutField } from "@/app/components/canvas/LayoutCanvasCard";
import { CursorIcon } from "@/app/lib";

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

interface LayoutFieldInspectorProps {
  field: LayoutField | null;
  onUpdate: (updates: Partial<LayoutField>) => void;
  onClose: () => void;
}

// Collapsible Section Component
function Section({ 
  title, 
  children, 
  defaultOpen = true,
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span className="flex items-center gap-2">
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

export function LayoutFieldInspector({
  field,
  onUpdate,
  onClose,
}: LayoutFieldInspectorProps) {
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

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  const isLayoutField = field.isLayout || ["grid-layout", "box-layout"].includes(field.type);
  const isTextarea = field.type === "textarea";
  const isHeadingField = field.type === "heading";
  const isSpacerField = field.type === "spacer";
  const isSliderField = field.type === "slider";
  const isLayoutElement = ["heading", "divider", "spacer"].includes(field.type);
  
  const showPlaceholder = ["text", "number", "email", "dropdown", "textarea"].includes(field.type);

  return (
    <div className="w-full bg-white flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          {!isLayoutElement && (
            <InputField
              label="Description"
              value={(field as any).description}
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
              value={(field as any).tag}
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
              value={(field as any).align}
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
              value={(field as any).height}
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
              value={(field as any).rows}
              onChange={(val) => handleChange("rows", parseInt(val) || 3)}
              type="number"
              min={1}
              max={20}
            />
            <Toggle
              label="Auto-resize"
              checked={(field as any).autosize || false}
              onChange={(val) => handleChange("autosize", val)}
            />
            <Toggle
              label="Spellcheck"
              checked={(field as any).spellcheck !== false}
              onChange={(val) => handleChange("spellcheck", val)}
            />
          </Section>
        )}

        {/* Slider Options */}
        {isSliderField && (
          <Section title="Slider Options" defaultOpen={false}>
            <InputField
              label="Min Value"
              value={(field as any).min as number}
              onChange={(val) => handleChange("min", parseFloat(val) || 0)}
              type="number"
            />
            <InputField
              label="Max Value"
              value={(field as any).max as number}
              onChange={(val) => handleChange("max", parseFloat(val) || 100)}
              type="number"
            />
            <InputField
              label="Step"
              value={(field as any).step}
              onChange={(val) => handleChange("step", parseFloat(val) || 1)}
              type="number"
              step={0.1}
            />
            <SelectField
              label="Show Tooltip"
              value={String((field as any).showTooltip)}
              onChange={(val) => handleChange("showTooltip", val === "true" ? true : val === "false" ? false : val)}
              options={[
                { value: "true", label: "Always" },
                { value: "drag", label: "On Drag" },
                { value: "false", label: "Never" },
              ]}
            />
            <SelectField
              label="Orientation"
              value={(field as any).orientation}
              onChange={(val) => handleChange("orientation", val)}
              options={[
                { value: "horizontal", label: "Horizontal" },
                { value: "vertical", label: "Vertical" },
              ]}
            />
            <Toggle
              label="Show Value"
              checked={(field as any).showValue !== false}
              onChange={(val) => handleChange("showValue", val)}
            />
            <Toggle
              label="Range Mode"
              checked={(field as any).range || false}
              onChange={(val) => handleChange("range", val)}
              description="Two handles for range selection"
            />
          </Section>
        )}

        {/* State Options */}
        {!isLayoutElement && !isLayoutField && (
          <Section title="State" defaultOpen={true}>
            <Toggle
              label="Required"
              checked={field.required || false}
              onChange={(val) => handleChange("required", val)}
            />
          </Section>
        )}
      </div>
    </div>
  );
}
