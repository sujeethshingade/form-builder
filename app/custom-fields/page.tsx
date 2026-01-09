"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LOVItem {
  code: string;
  shortName: string;
  description: string;
  seamlessMapping: string;
  status: "Active" | "Inactive";
}

interface CustomFieldForm {
  fieldName: string;
  fieldLabel: string;
  dataType: string;
  className: string;
  category: string;
  lovFieldName: string;
  lovType: "user-defined" | "api";
  lovItems: LOVItem[];
}

const dataTypes = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select/Dropdown" },
  { value: "radio", label: "Radio Button" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File Upload" },
  { value: "url", label: "URL" },
];

export default function CustomFieldsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [existingFields, setExistingFields] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  
  const [form, setForm] = useState<CustomFieldForm>({
    fieldName: "",
    fieldLabel: "",
    dataType: "",
    className: "",
    category: "",
    lovFieldName: "",
    lovType: "user-defined",
    lovItems: [],
  });

  useEffect(() => {
    fetchCustomFields();
    fetchCategories();
  }, []);

  const fetchCustomFields = async () => {
    try {
      const response = await fetch("/api/custom-fields");
      const data = await response.json();
      if (data.success) {
        setExistingFields(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch custom fields:", err);
    }
  };

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

  const handleAddLOVItem = () => {
    setForm({
      ...form,
      lovItems: [
        ...form.lovItems,
        { code: "", shortName: "", description: "", seamlessMapping: "", status: "Active" },
      ],
    });
  };

  const handleRemoveLOVItem = (index: number) => {
    const newItems = [...form.lovItems];
    newItems.splice(index, 1);
    setForm({ ...form, lovItems: newItems });
  };

  const handleLOVItemChange = (index: number, field: keyof LOVItem, value: string) => {
    const newItems = [...form.lovItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, lovItems: newItems });
  };

  const handleSave = async () => {
    if (!form.fieldName || !form.fieldLabel || !form.dataType) {
      alert("Please fill in Field Name, Field Label, and Data Type");
      return;
    }

    const categoryToUse = showNewCategory ? newCategory : form.category;
    if (!categoryToUse) {
      alert("Please select or enter a category");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/custom-fields/${editingId}` : "/api/custom-fields";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: categoryToUse,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? "Custom field updated successfully!" : "Custom field created successfully!");
        resetForm();
        fetchCustomFields();
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to save custom field");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (field: any) => {
    setEditingId(field._id);
    setForm({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      dataType: field.dataType,
      className: field.className || "",
      category: field.category,
      lovFieldName: field.lovFieldName || "",
      lovType: field.lovType || "user-defined",
      lovItems: field.lovItems || [],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom field?")) return;

    try {
      const response = await fetch(`/api/custom-fields/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchCustomFields();
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to delete custom field");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      fieldName: "",
      fieldLabel: "",
      dataType: "",
      className: "",
      category: "",
      lovFieldName: "",
      lovType: "user-defined",
      lovItems: [],
    });
    setNewCategory("");
    setShowNewCategory(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Custom Fields</h1>
          <button
            onClick={() => router.push("/forms")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Forms
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add/Edit Field Form */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {editingId ? "Edit Field" : "Add Field"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.fieldName}
                  onChange={(e) => setForm({ ...form, fieldName: e.target.value })}
                  placeholder="Enter field name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.fieldLabel}
                  onChange={(e) => setForm({ ...form, fieldLabel: e.target.value })}
                  placeholder="Enter field label"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Data Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.dataType}
                  onChange={(e) => setForm({ ...form, dataType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                >
                  <option value="">Select data type</option>
                  {dataTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Class Name
                </label>
                <input
                  type="text"
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  placeholder="Enter class name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                {!showNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-3 py-2 text-sky-600 hover:bg-sky-50 rounded-md text-sm font-medium"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategory("");
                      }}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  if (editingId) {
                    resetForm();
                  } else {
                    router.back();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {editingId ? "Cancel Edit" : "Close"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">List Of Values</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Field Name
                </label>
                <input
                  type="text"
                  value={form.lovFieldName}
                  onChange={(e) => setForm({ ...form, lovFieldName: e.target.value })}
                  placeholder="Enter field name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-4">
                  {["user-defined", "api"].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="lovType"
                        checked={form.lovType === type}
                        onChange={() => setForm({ ...form, lovType: type as any })}
                        className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {type.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {form.lovType === "user-defined" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-700">User Defined LOVs</h4>
                    <button
                      type="button"
                      onClick={handleAddLOVItem}
                      className="flex items-center gap-1 px-2 py-1 text-sky-600 hover:bg-sky-50 rounded text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Row
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Code</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Short Name</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Description</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Status</th>
                          <th className="px-3 py-2 text-center font-medium text-slate-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.lovItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                              No LOV items. Click "Add Row" to add values.
                            </td>
                          </tr>
                        ) : (
                          form.lovItems.map((item, index) => (
                            <tr key={index} className="border-t border-slate-200">
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.code}
                                  onChange={(e) => handleLOVItemChange(index, "code", e.target.value)}
                                  placeholder="Code"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-300"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.shortName}
                                  onChange={(e) => handleLOVItemChange(index, "shortName", e.target.value)}
                                  placeholder="Short Name"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-300"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleLOVItemChange(index, "description", e.target.value)}
                                  placeholder="Description"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-300"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleLOVItemChange(index, "status", e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-300"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                </select>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLOVItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
