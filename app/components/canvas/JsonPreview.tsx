"use client";

import type { FormField, FormStyles } from "../../lib/types";

interface JsonPreviewProps {
  fields: FormField[];
  styles: FormStyles;
  formName?: string;
  collectionName?: string;
}

export function JsonPreview({ fields, styles, formName, collectionName }: JsonPreviewProps) {
  const formJson = {
    collectionName: collectionName || "",
    formName: formName || "",
    formJson: {
      fields: fields.map(field => {
        const cleanField: Record<string, unknown> = {};
        Object.entries(field).forEach(([key, value]) => {
          // Skip undefined, null, empty strings
          if (value === undefined || value === null || value === "") {
            return;
          }
          // Skip empty arrays
          if (Array.isArray(value) && value.length === 0) {
            return;
          }
          // Skip empty objects
          if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
            return;
          }
          cleanField[key] = value;
        });
        return cleanField;
      }),
      styles,
    },
  };

  const jsonString = JSON.stringify(formJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    alert("JSON copied to clipboard!");
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="min-h-150 overflow-hidden bg-white shadow-lg">
          <div className="flex items-center justify-end px-4 py-3">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
            >
              Copy JSON
            </button>
          </div>
          <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed text-slate-700 font-mono">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
}
