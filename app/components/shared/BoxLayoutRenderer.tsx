"use client";

import type { VueformColumn } from "@/app/lib/types";

interface BoxLayoutRow {
  id: string;
  data: Record<string, unknown>;
}

interface BoxLayoutSection {
  id: string;
  title: string;
  collapsed: boolean;
  columns: VueformColumn[];
  rows: BoxLayoutRow[];
}

interface BoxLayoutRendererProps {
  sections: BoxLayoutSection[];
  onSectionsChange?: (sections: BoxLayoutSection[]) => void;
  disabled?: boolean;
}

const defaultColumns: VueformColumn[] = [
  { name: "field1", label: "Field 1", type: "text", placeholder: "Enter value" },
  { name: "field2", label: "Field 2", type: "text", placeholder: "Enter value" },
  { name: "field3", label: "Field 3", type: "text", placeholder: "Enter value" },
];

export function BoxLayoutRenderer({
  sections,
  onSectionsChange,
  disabled = false,
}: BoxLayoutRendererProps) {
  const toggleSection = (sectionId: string) => {
    if (!onSectionsChange) return;
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
      )
    );
  };

  const addRow = (sectionId: string) => {
    if (!onSectionsChange) return;
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              rows: [
                ...s.rows,
                {
                  id: `row_${Date.now()}`,
                  data: s.columns.reduce((acc, col) => ({ ...acc, [col.name]: "" }), {}),
                },
              ],
            }
          : s
      )
    );
  };

  const removeRow = (sectionId: string, rowId: string) => {
    if (!onSectionsChange) return;
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, rows: s.rows.filter((r) => r.id !== rowId) }
          : s
      )
    );
  };

  const updateRowData = (
    sectionId: string,
    rowId: string,
    field: string,
    value: unknown
  ) => {
    if (!onSectionsChange) return;
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              rows: s.rows.map((r) =>
                r.id === rowId ? { ...r, data: { ...r.data, [field]: value } } : r
              ),
            }
          : s
      )
    );
  };

  const renderCellInput = (
    column: VueformColumn,
    value: unknown,
    onChange: (val: unknown) => void
  ) => {
    const commonClasses =
      "w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-sky-400 text-sm bg-white";

    switch (column.type) {
      case "select":
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={commonClasses}
          >
            <option value="">Select</option>
            {column.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={column.placeholder}
            className={commonClasses}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={commonClasses}
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          />
        );
      case "email":
        return (
          <input
            type="email"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={column.placeholder}
            className={commonClasses}
          />
        );
      default:
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={column.placeholder}
            className={commonClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Section Header */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <h3 className="font-medium text-slate-800">{section.title}</h3>
            <button className="text-slate-500 hover:text-slate-700">
              <svg
                className={`w-5 h-5 transition-transform ${
                  section.collapsed ? "" : "rotate-180"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>

          {/* Section Content */}
          {!section.collapsed && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-600 w-20">
                      Actions
                    </th>
                    {section.columns.map((col) => (
                      <th
                        key={col.name}
                        className="px-4 py-2 text-left text-sm font-medium text-slate-600"
                        style={{ width: col.width }}
                      >
                        {col.label}
                        {col.required && <span className="text-red-500 ml-1">*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 ${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {!disabled && (
                            <>
                              <button
                                onClick={() => addRow(section.id)}
                                className="p-1 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded"
                                title="Add row"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                              {section.rows.length > 1 && (
                                <button
                                  onClick={() => removeRow(section.id, row.id)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Remove row"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      {section.columns.map((col) => (
                        <td key={col.name} className="px-4 py-2">
                          {renderCellInput(col, row.data[col.name], (val) =>
                            updateRowData(section.id, row.id, col.name, val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Empty row for adding */}
                  {section.rows.length === 0 && (
                    <tr className="bg-white">
                      <td className="px-4 py-3">
                        {!disabled && (
                          <button
                            onClick={() => addRow(section.id)}
                            className="p-1 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded"
                            title="Add row"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                      {section.columns.map((col) => (
                        <td key={col.name} className="px-4 py-3 text-slate-400 text-sm">
                          {col.placeholder || col.label}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Helper to create a new box layout section
export function createBoxLayoutSection(
  title: string,
  columns?: VueformColumn[]
): BoxLayoutSection {
  return {
    id: `section_${Date.now()}`,
    title,
    collapsed: false,
    columns: columns || defaultColumns,
    rows: [
      {
        id: `row_${Date.now()}`,
        data: (columns || defaultColumns).reduce(
          (acc, col) => ({ ...acc, [col.name]: "" }),
          {}
        ),
      },
    ],
  };
}

// Example configurations for Contact Details and Address Details (as shown in image)
export const contactDetailsSection: BoxLayoutSection = {
  id: "contact_details",
  title: "Contact Details",
  collapsed: false,
  columns: [
    { name: "firstName", label: "First Name", type: "text", placeholder: "First Name" },
    { name: "lastName", label: "Last Name", type: "text", placeholder: "Last Name" },
    { name: "phone", label: "Phone", type: "text", placeholder: "xxx-xxxx-xxx" },
    { name: "email", label: "Email", type: "email", placeholder: "Email" },
    {
      name: "contactType",
      label: "Contact Type",
      type: "select",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "emergency", label: "Emergency" },
      ],
    },
  ],
  rows: [
    {
      id: "contact_row_1",
      data: { firstName: "", lastName: "", phone: "", email: "", contactType: "" },
    },
  ],
};

export const addressDetailsSection: BoxLayoutSection = {
  id: "address_details",
  title: "Address Details",
  collapsed: false,
  columns: [
    { name: "addressLine1", label: "Address Line 1", type: "text", placeholder: "Address Line 1" },
    { name: "addressLine2", label: "Address Line 2", type: "text", placeholder: "Address Line 2" },
    { name: "zipCode", label: "Zip Code", type: "text", placeholder: "Zip Code" },
    { name: "city", label: "City", type: "text", placeholder: "City" },
    { name: "state", label: "State", type: "text", placeholder: "State" },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
        { value: "uk", label: "United Kingdom" },
        { value: "au", label: "Australia" },
      ],
    },
    {
      name: "addressType",
      label: "Address Type",
      type: "select",
      options: [
        { value: "home", label: "Home" },
        { value: "work", label: "Work" },
        { value: "billing", label: "Billing" },
        { value: "shipping", label: "Shipping" },
      ],
    },
  ],
  rows: [
    {
      id: "address_row_1",
      data: {
        addressLine1: "",
        addressLine2: "",
        zipCode: "",
        city: "",
        state: "",
        country: "",
        addressType: "",
      },
    },
  ],
};

export type { BoxLayoutSection, BoxLayoutRow };
