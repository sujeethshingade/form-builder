"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/app/components/shared/SearchInput";
import { SaveAsModal } from "@/app/components/shared/SaveAsModal";

interface LOVItem {
  code: string;
  shortName: string;
  description?: string;
  status: "Active" | "Inactive";
}

interface CustomFieldData {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  dataType: string;
  className?: string;
  category: string;
  lovEnabled: boolean;
  lovType?: string;
  lovItems?: LOVItem[];
  createdAt: string;
  updatedAt: string;
}

const getTypeIcon = (type: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    text: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    number: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />,
    email: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    date: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    select: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />,
    radio: <><circle cx="12" cy="12" r="9" strokeWidth={2} /><circle cx="12" cy="12" r="4" fill="currentColor" /></>,
    checkbox: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    file: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />,
    url: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    textarea: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
    heading: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8" />,
    divider: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />,
    spacer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M12 8v8" />,
    table: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />,
  };
  return icons[type] || <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />;
};

export default function FieldsPage() {
  const router = useRouter();
  const [fields, setFields] = useState<CustomFieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [selectedField, setSelectedField] = useState<CustomFieldData | null>(null);
  const [savingAs, setSavingAs] = useState(false);

  const dataTypes = [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Textarea" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "date", label: "Date" },
    { value: "select", label: "Select/Dropdown" },
    { value: "radio", label: "Radio Button" },
    { value: "checkbox", label: "Checkbox" },
    { value: "file", label: "File Upload" },
    { value: "url", label: "URL" },
    { value: "heading", label: "Heading" },
    { value: "divider", label: "Divider" },
    { value: "spacer", label: "Spacer" },
    { value: "table", label: "Table" },
  ];

  const fetchFields = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterCategory) params.set("category", filterCategory);
      if (filterType) params.set("dataType", filterType);
      
      const queryString = params.toString();
      const response = await fetch(`/api/custom-fields${queryString ? `?${queryString}` : ""}`);
      const data = await response.json();
      if (data.success) {
        setFields(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch fields");
    }
  }, [search, filterCategory, filterType]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/custom-fields/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFields();
      setLoading(false);
    };
    loadData();
  }, [fetchFields]);

  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;

    try {
      const response = await fetch(`/api/custom-fields/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchFields();
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to delete field");
    }
  };

  const handleSaveAsNew = async (newName: string) => {
    if (!selectedField) return;

    setSavingAs(true);
    try {
      const response = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldName: newName.replace(/\s+/g, '_').toLowerCase(),
          fieldLabel: newName,
          dataType: selectedField.dataType,
          className: selectedField.className,
          category: selectedField.category,
          enableLOV: selectedField.lovEnabled,
          lovType: selectedField.lovType,
          lovItems: selectedField.lovItems,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowSaveAsModal(false);
        setSelectedField(null);
        fetchFields();
        alert("Field saved as new successfully!");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to save field as new");
    } finally {
      setSavingAs(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().replace("T", " ").slice(0, -5) + "Z";
  };

  const getTypeBadgeClass = (type: string) => {
    const colors: Record<string, string> = {
      text: "bg-blue-100 text-blue-700",
      textarea: "bg-blue-100 text-blue-700",
      number: "bg-purple-100 text-purple-700",
      email: "bg-green-100 text-green-700",
      date: "bg-orange-100 text-orange-700",
      select: "bg-indigo-100 text-indigo-700",
      radio: "bg-pink-100 text-pink-700",
      checkbox: "bg-pink-100 text-pink-700",
      file: "bg-yellow-100 text-yellow-700",
      url: "bg-cyan-100 text-cyan-700",
      heading: "bg-slate-100 text-slate-700",
      divider: "bg-slate-100 text-slate-700",
      spacer: "bg-slate-100 text-slate-700",
      table: "bg-emerald-100 text-emerald-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-full bg-slate-50">
      <main className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search fields..."
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Types</option>
                {dataTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => router.push("/custom-fields")}
              className="flex items-center gap-2 px-4 py-1.5 bg-sky-500 text-white text-sm rounded-md hover:bg-sky-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Field
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Field Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Created</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Updated</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No fields found. Click &quot;Create Field&quot; to add a new custom field.
                  </td>
                </tr>
              ) : (
                fields.map((field) => (
                  <tr key={field._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-600">{field.fieldName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm text-slate-500`}>
                        {field.dataType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {field.category || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(field.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(field.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/custom-fields?edit=${field._id}`)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 transition-colors"
                          title="Edit Field"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteField(field._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Field"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <SaveAsModal
        isOpen={showSaveAsModal}
        onClose={() => {
          setShowSaveAsModal(false);
          setSelectedField(null);
        }}
        onSave={handleSaveAsNew}
        saving={savingAs}
        defaultName={selectedField ? `${selectedField.fieldLabel} Copy` : ""}
        title="Clone Field"
        nameLabel="Field Label"
        namePlaceholder="Enter field label"
        saveButtonText="Clone Field"
      />
    </div>
  );
}
