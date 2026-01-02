"use client";

import type { FormField, FormStyles } from "../../lib/types";
import {
  FormFieldRenderer,
  DividerRenderer,
  HeadingRenderer,
  SpacerRenderer,
  TableRenderer,
} from "../shared/FieldRenderer";

function PreviewCard({ field }: { field: FormField }) {
  const widthStyle = {
    width: `${field.widthPercent || 100}%`,
  };

  if (field.type === "divider") {
    return (
      <div className="p-3" style={widthStyle}>
        <DividerRenderer />
      </div>
    );
  }

  if (field.type === "spacer") {
    return (
      <div style={widthStyle}>
        <SpacerRenderer field={field} preview={true} />
      </div>
    );
  }

  if (field.type === "heading") {
    return (
      <div className="p-2" style={widthStyle}>
        <HeadingRenderer field={field} />
      </div>
    );
  }

  if (field.type === "table") {
    return (
      <div className="p-2" style={widthStyle}>
        <div className="pb-2">
          <label className="block text-sm font-medium text-slate-900">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-slate-500">{field.description}</p>
          )}
        </div>
        <TableRenderer field={field} disabled />
      </div>
    );
  }

  return (
    <div className="p-2" style={widthStyle}>
      <FormFieldRenderer field={field} disabled />
    </div>
  );
}

export function FormPreview({
  fields,
  styles,
}: {
  fields: FormField[];
  styles: FormStyles;
}) {
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
            <div />
          ) : (
            <div className="flex flex-wrap gap-4 pointer-events-none select-none">
              {fields.map((field) => (
                <PreviewCard key={field.id} field={field} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
