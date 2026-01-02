"use client";

import { FormField, VueformItem, VueformColumn } from "@/app/lib/types";

type ChoiceOption = VueformItem;
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

interface InspectorSidebarProps {
  field: FormField | null;
  onClose: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
}

export default function InspectorSidebar({
  field,
  onUpdate,
}: InspectorSidebarProps) {
  if (!field) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex items-center justify-center text-gray-500">
        Select a field to edit its properties
      </div>
    );
  }

  const handleLabelChange = (label: string) => {
    onUpdate({ label });
  };

  const handlePlaceholderChange = (placeholder: string) => {
    onUpdate({ placeholder });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate({ required });
  };

  const handleWidthChange = (widthPercent: number) => {
    onUpdate({ widthPercent });
  };

  const handleOptionsChange = (items: ChoiceOption[]) => {
    onUpdate({ items });
  };

  const addOption = () => {
    const currentItems = field.items || [];
    const newOption: ChoiceOption = {
      value: `option_${currentItems.length + 1}`,
      label: `Option ${currentItems.length + 1}`,
    };
    handleOptionsChange([...currentItems, newOption]);
  };

  const updateOption = (index: number, updates: Partial<ChoiceOption>) => {
    const currentItems = field.items || [];
    const updatedItems = currentItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    handleOptionsChange(updatedItems);
  };

  const removeOption = (index: number) => {
    const currentItems = field.items || [];
    handleOptionsChange(currentItems.filter((_, i) => i !== index));
  };

  const handleColumnsChange = (columns: TableColumn[]) => {
    onUpdate({ columns });
  };

  const addColumn = () => {
    const currentColumns = field.columns || [];
    const newColumn: TableColumn = {
      name: `column_${currentColumns.length + 1}`,
      label: `Column ${currentColumns.length + 1}`,
      type: "text",
    };
    handleColumnsChange([...currentColumns, newColumn]);
  };

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const currentColumns = field.columns || [];
    const updatedColumns = currentColumns.map((col, i) =>
      i === index ? { ...col, ...updates } : col
    );
    handleColumnsChange(updatedColumns);
  };

  const removeColumn = (index: number) => {
    const currentColumns = field.columns || [];
    handleColumnsChange(currentColumns.filter((_, i) => i !== index));
  };

  const handleRowsChange = (rows: Record<string, any>[]) => {
    onUpdate({ rows });
  };

  const addRow = () => {
    const currentRows = (field.rows as Record<string, any>[]) || [];
    const newRow: Record<string, any> = {};
    (field.columns || []).forEach((col) => {
      newRow[col.name] = "";
    });
    handleRowsChange([...currentRows, newRow]);
  };

  const removeRow = (index: number) => {
    const currentRows = (field.rows as Record<string, any>[]) || [];
    handleRowsChange(currentRows.filter((_, i) => i !== index));
  };

  const handleSpacerHeightChange = (height: string) => {
    onUpdate({ height });
  };

  const showPlaceholder = ["text", "number", "url","email", "select", "textarea"].includes(field.type);
  const showOptions = ["checkbox", "radio", "select"].includes(field.type);
  const showColumns = field.type === "table";
  const showSpacerHeight = field.type === "spacer";
  const showRequired = !["heading", "divider", "spacer"].includes(field.type);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
          />
        </div>

        {/* Placeholder */}
        {showPlaceholder && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
            />
          </div>
        )}

        {/* Width Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Width: {field.widthPercent || 100}%
          </label>
          <input
            type="range"
            min="25"
            max="100"
            step="5"
            value={field.widthPercent || 100}
            onChange={(e) => handleWidthChange(parseInt(e.target.value))}
            className="w-full cursor-pointer"
            style={{
              height: '6px',
              borderRadius: '6px',
              background: '#e5e7eb',
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
          <style jsx>{`
            input[type="range"] {
              margin: 0;
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #38bdf8;
              cursor: pointer;
              margin-top: -2px;
            }
            input[type="range"]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #38bdf8;
              cursor: pointer;
              border: none;
            }
            input[type="range"]::-moz-range-track {
              height: 6px;
              background: transparent;
            }
          `}</style>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Options Editor */}
        {showOptions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {(field.items || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateOption(index, {
                        label: e.target.value,
                        value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      })
                    }
                    placeholder="Option label"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-600 font-medium mt-2"
              >
                <PlusIcon />
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Table Columns Editor */}
        {showColumns && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Columns
              </label>
              <div className="space-y-3">
                {(field.columns || []).map((col, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) =>
                          updateColumn(index, {
                            label: e.target.value,
                            name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                          })
                        }
                        placeholder="Column label"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                      <button
                        onClick={() => removeColumn(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <select
                      value={col.type}
                      onChange={(e) =>
                        updateColumn(index, {
                          type: e.target.value as "text" | "number" | "select",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                ))}
                <button
                  onClick={addColumn}
                  className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-600 font-medium"
                >
                  <PlusIcon />
                  Add Column
                </button>
              </div>
            </div>

            {/* Table Rows Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rows
              </label>
              <div className="space-y-2">
                {((field.rows as Record<string, any>[]) || []).map((row, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600">Row {index + 1}</span>
                    <button
                      onClick={() => removeRow(index)}
                      className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-600 font-medium"
                >
                  <PlusIcon />
                  Add Row
                </button>
              </div>
            </div>
          </>
        )}

        {/* Spacer Height */}
        {showSpacerHeight && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Height (px)
            </label>
            <input
              type="number"
              min="8"
              max="200"
              value={parseInt(field.height || "32")}
              onChange={(e) =>
                handleSpacerHeightChange(e.target.value || "32")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        )}

        {/* Required Toggle */}
        {showRequired && (
          <div className="flex items-center justify-between pt-2">
            <label className="text-sm font-medium text-gray-700">Required</label>
            <button
              onClick={() => handleRequiredChange(!field.required)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                field.required ? "bg-sky-400" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  field.required ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
