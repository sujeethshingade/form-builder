"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { ComponentType } from "../../lib/form";

// Element definitions with icons and properties
type ElementDefinition = {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  description: string;
  defaultProps: {
    label: string;
    placeholder?: string;
    helper?: string;
    required?: boolean;
    options?: string[];
    width?: "full" | "half";
  };
};

// Fields Tab - Form input elements
const fieldsElements: ElementDefinition[] = [
  {
    type: "text",
    label: "Short text",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8" />
      </svg>
    ),
    description: "Single line input",
    defaultProps: {
      label: "Text Field",
      placeholder: "Enter text...",
      required: false,
      width: "full",
    },
  },
  {
    type: "textarea",
    label: "Long text",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    description: "Multi-line input",
    defaultProps: {
      label: "Message",
      placeholder: "Enter your message...",
      required: false,
      width: "full",
    },
  },
  {
    type: "number",
    label: "Number",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    description: "Only allows numbers",
    defaultProps: {
      label: "Number",
      placeholder: "0",
      required: false,
      width: "full",
    },
  },
  {
    type: "email",
    label: "Email",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: "Expects an email",
    defaultProps: {
      label: "Email Address",
      placeholder: "name@example.com",
      required: false,
      width: "full",
    },
  },
  {
    type: "phone",
    label: "Phone",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    description: "Phone number input",
    defaultProps: {
      label: "Phone Number",
      placeholder: "+1 (555) 123-4567",
      required: false,
      width: "full",
    },
  },
  {
    type: "password",
    label: "Password",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    description: "Hides characters",
    defaultProps: {
      label: "Password",
      placeholder: "Enter password...",
      required: false,
      width: "full",
    },
  },
  {
    type: "url",
    label: "URL",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    description: "Expects a URL",
    defaultProps: {
      label: "Website URL",
      placeholder: "https://example.com",
      required: false,
      width: "full",
    },
  },
  {
    type: "checkbox",
    label: "Multiple choice",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    description: "Accept multiple options",
    defaultProps: {
      label: "Select Options",
      options: ["Option 1", "Option 2", "Option 3"],
      required: false,
      width: "full",
    },
  },
  {
    type: "radio",
    label: "Single choice",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Accept a single option",
    defaultProps: {
      label: "Choose One",
      options: ["Option A", "Option B", "Option C"],
      required: false,
      width: "full",
    },
  },
  {
    type: "select",
    label: "Dropdown",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    ),
    description: "Select input",
    defaultProps: {
      label: "Select Option",
      options: ["Option 1", "Option 2", "Option 3"],
      required: false,
      width: "full",
    },
  },
  {
    type: "date",
    label: "Date",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: "Datepicker input",
    defaultProps: {
      label: "Date",
      required: false,
      width: "full",
    },
  },
  {
    type: "time",
    label: "Time",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Time picker input",
    defaultProps: {
      label: "Time",
      required: false,
      width: "full",
    },
  },
  {
    type: "location",
    label: "Location",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: "Location input",
    defaultProps: {
      label: "Location",
      placeholder: "Enter location...",
      required: false,
      width: "full",
    },
  },
  {
    type: "file",
    label: "File Upload",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    description: "File Upload input",
    defaultProps: {
      label: "Upload File",
      helper: "Max file size: 10MB",
      required: false,
      width: "full",
    },
  },
];

// Page Tab - Layout and structural elements
const pageElements: ElementDefinition[] = [
  {
    type: "h1",
    label: "Form heading (H1)",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 18h16" />
      </svg>
    ),
    description: "Heading for form",
    defaultProps: {
      label: "Form Heading",
      placeholder: "Enter form title...",
      width: "full",
    },
  },
  {
    type: "h2",
    label: "Section heading (H2)",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h12" />
      </svg>
    ),
    description: "Heading for sections",
    defaultProps: {
      label: "Section Heading",
      placeholder: "Enter section title...",
      width: "full",
    },
  },
  {
    type: "h3",
    label: "Subheading (H3)",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 10h16M4 14h10" />
      </svg>
    ),
    description: "Heading for subsections",
    defaultProps: {
      label: "Subheading",
      placeholder: "Enter subsection title...",
      width: "full",
    },
  },
  {
    type: "divider",
    label: "Divider",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
      </svg>
    ),
    description: "Visual separation",
    defaultProps: {
      label: "Divider",
      width: "full",
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    description: "Empty space",
    defaultProps: {
      label: "Spacer",
      width: "full",
    },
  },
  {
    type: "table",
    label: "Table",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    description: "Rows and columns",
    defaultProps: {
      label: "Table",
      helper: "Organize data in rows and columns",
      width: "full",
    },
  },
];

function ElementCard({ element }: { element: ElementDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${element.type}`,
    data: { from: "palette", type: element.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 border border-slate-200 bg-white px-3 py-2.5 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
        {element.icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700 truncate">{element.label}</div>
        <div className="text-xs text-slate-500 truncate">{element.description}</div>
      </div>
    </div>
  );
}

export function ElementSidebar({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"fields" | "page">("fields");

  return (
    <aside
      className={`flex h-full flex-col bg-white transition-[width] duration-300 ease-out ${
        collapsed
          ? "w-0 min-w-0 overflow-hidden border-r border-transparent"
          : "w-65 border-r border-slate-200"
      }`}
    >
      <div
        className={`flex h-full flex-col ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        } transition-opacity duration-200 ${collapsed ? "" : "delay-100"}`}
      >
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("fields")}
            className={`flex-1 px-3 py-4 text-sm font-medium transition cursor-pointer ${
              activeTab === "fields"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Fields
          </button>
          <button
            onClick={() => setActiveTab("page")}
            className={`flex-1 px-3 py-4 text-sm font-medium transition cursor-pointer ${
              activeTab === "page"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Page
          </button>
        </div>

        {/* Element List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {(activeTab === "fields" ? fieldsElements : pageElements).map((element) => (
              <ElementCard key={element.type} element={element} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
