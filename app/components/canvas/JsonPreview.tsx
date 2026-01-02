"use client";

export function JsonPreview({ json, onCopy }: {
  json: string;
  onCopy: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex min-h-150 flex-col overflow-hidden bg-white shadow-lg">
        <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed">
          {json}
        </pre>
      </div>
    </div>
  );
}
