"use client";

interface ColumnWidthSelectorProps {
  value: number;
  onChange: (columns: number) => void;
  label?: string;
  description?: string;
}

export function ColumnWidthSelector({
  value,
  onChange,
  label = "Width",
  description = "Select column width (1-12 columns)",
}: ColumnWidthSelectorProps) {
  const columns = value || 12;

  const handleColumnClick = (index: number) => {
    onChange(index + 1);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}: {columns} {columns === 1 ? "column" : "columns"}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="flex gap-0.5">
        {Array.from({ length: 12 }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleColumnClick(index)}
            className={`flex-1 h-8 border transition-colors ${
              index < columns
                ? "bg-sky-400 border-sky-500 hover:bg-sky-500"
                : "bg-gray-100 border-gray-200 hover:bg-gray-200"
            } ${index === 0 ? "rounded-l-md" : ""} ${
              index === 11 ? "rounded-r-md" : ""
            }`}
            title={`${index + 1} column${index === 0 ? "" : "s"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
        <span>1</span>
        <span>3</span>
        <span>6</span>
        <span>9</span>
        <span>12</span>
      </div>
    </div>
  );
}
