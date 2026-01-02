"use client";

import type { FormField, FormStyles } from "../../lib/types";
import {
  FormFieldRenderer,
  DividerRenderer,
  HeadingRenderer,
  ParagraphRenderer,
} from "../shared/FieldRenderer";

function PreviewCard({ field }: { field: FormField }) {
  if (field.type === "divider") {
    return (
      <div className="p-3">
        <DividerRenderer />
      </div>
    );
  }

  if (field.type === "spacer") {
    return <div className="h-12" />;
  }

  if (field.type === "heading") {
    return (
      <div className="p-2">
        <HeadingRenderer field={field} />
      </div>
    );
  }

  return (
    <div className="p-2">
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
      <div className="mx-auto max-w-3xl">
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
            <div className="space-y-6 pointer-events-none select-none">
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
