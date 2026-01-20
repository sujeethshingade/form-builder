"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SaveAsModal } from "@/app/components/shared/SaveAsModal";

interface LOVItem {
  code: string;
  shortName: string;
  description: string;
  seamlessMapping: string;
  status: "Active" | "Inactive";
}

interface APIConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: string;
  body: string;
  responseKeyPath: string;
  valueKey: string;
  labelKey: string;
}

interface TableColumn {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  customFieldId?: string;
  options?: Array<{ value: string | number; label: string }>;
}

interface CustomFieldForm {
  fieldName: string;
  fieldLabel: string;
  dataType: string;
  className: string;
  category: string;
  enableLOV: boolean;
  lovFieldName: string;
  lovType: "user-defined" | "dynamic-api";
  lovItems: LOVItem[];
  apiConfig: APIConfig;
  tableColumns: TableColumn[];
}

const dataTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Radio Button" },
  { value: "checkbox", label: "Checkbox" },
  { value: "heading", label: "Heading" },
  { value: "divider", label: "Divider" },
  { value: "spacer", label: "Spacer" },
  { value: "table", label: "Table" },
];



function CustomFieldsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [savingAs, setSavingAs] = useState(false);
  const [existingFields, setExistingFields] = useState<any[]>([]);
  const [availableFieldsForColumns, setAvailableFieldsForColumns] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  
  const [form, setForm] = useState<CustomFieldForm>({
    fieldName: "",
    fieldLabel: "",
    dataType: "",
    className: "",
    category: "",
    enableLOV: false,
    lovFieldName: "",
    lovType: "user-defined",
    lovItems: [],
    apiConfig: {
      url: "",
      method: "GET",
      headers: "",
      body: "",
      responseKeyPath: "",
      valueKey: "",
      labelKey: "",
    },
    tableColumns: [],
  });

  const [apiTestResult, setApiTestResult] = useState<any[] | null>(null);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [apiTestError, setApiTestError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomFields();
    fetchCategories();
  }, []);

  // Handle edit query parameter
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && existingFields.length > 0) {
      const fieldToEdit = existingFields.find((f) => f._id === editId);
      if (fieldToEdit) {
        handleEdit(fieldToEdit);
      }
    }
  }, [searchParams, existingFields]);

  const fetchCustomFields = async () => {
    try {
      const response = await fetch("/api/custom-fields");
      const data = await response.json();
      if (data.success) {
        setExistingFields(data.data);

        const selectableFields = data.data.filter((field: any) => 
          !["heading", "divider", "spacer", "table"].includes(field.dataType)
        );
        setAvailableFieldsForColumns(selectableFields);
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

    // Filter out incomplete table columns (columns without selected custom fields)
    const validTableColumns = form.tableColumns.filter(col => 
      col.name && col.label && col.type
    );

    // Validate that if dataType is table, there should be at least one valid column
    if (form.dataType === "table" && validTableColumns.length === 0) {
      alert("Please add at least one column to the table");
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
          tableColumns: validTableColumns, // Use filtered columns
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? "Custom field updated successfully!" : "Custom field created successfully!");
        resetForm();
        fetchCustomFields();
        fetchCategories();
        router.push("/fields");
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
      enableLOV: field.enableLOV || false,
      lovFieldName: field.lovFieldName || "",
      lovType: field.lovType || "user-defined",
      lovItems: field.lovItems || [],
      apiConfig: field.apiConfig || {
        url: "",
        method: "GET",
        headers: "",
        body: "",
        responseKeyPath: "",
        valueKey: "",
        labelKey: "",
      },
      tableColumns: field.tableColumns || [],
    });
    setApiTestResult(null);
    setApiTestError(null);
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

  const handleSaveAsNew = async (newLabel: string) => {
    if (!form.dataType) {
      alert("Please fill in all required fields");
      return;
    }

    const categoryToUse = showNewCategory ? newCategory : form.category;
    if (!categoryToUse) {
      alert("Please select or enter a category");
      return;
    }

    // Filter out incomplete table columns (columns without selected custom fields)
    const validTableColumns = form.tableColumns.filter(col => 
      col.name && col.label && col.type
    );

    // Validate that if dataType is table, there should be at least one valid column
    if (form.dataType === "table" && validTableColumns.length === 0) {
      alert("Please add at least one column to the table");
      return;
    }

    setSavingAs(true);
    try {
      const newFieldName = newLabel.replace(/\s+/g, '_').toLowerCase();
      const response = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldName: newFieldName,
          fieldLabel: newLabel,
          dataType: form.dataType,
          className: form.className,
          category: categoryToUse,
          enableLOV: form.enableLOV,
          lovFieldName: form.lovFieldName,
          lovType: form.lovType,
          lovItems: form.lovItems,
          apiConfig: form.apiConfig,
          tableColumns: validTableColumns, // Use filtered columns
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSaveAsModal(false);
        alert("Field saved as new successfully!");
        resetForm();
        router.replace("/fields");
        fetchCustomFields();
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to save field as new");
    } finally {
      setSavingAs(false);
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
      enableLOV: false,
      lovFieldName: "",
      lovType: "user-defined",
      lovItems: [],
      apiConfig: {
        url: "",
        method: "GET",
        headers: "",
        body: "",
        responseKeyPath: "",
        valueKey: "",
        labelKey: "",
      },
      tableColumns: [],
    });
    setNewCategory("");
    setShowNewCategory(false);
    setApiTestResult(null);
    setApiTestError(null);
  };

  const handleTestApi = async () => {
    if (!form.apiConfig.url) {
      setApiTestError("Please enter an API URL");
      return;
    }

    setApiTestLoading(true);
    setApiTestError(null);
    setApiTestResult(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (form.apiConfig.headers) {
        try {
          const customHeaders = JSON.parse(form.apiConfig.headers);
          Object.assign(headers, customHeaders);
        } catch {
          setApiTestError("Invalid headers JSON format");
          setApiTestLoading(false);
          return;
        }
      }

      const fetchOptions: RequestInit = {
        method: form.apiConfig.method,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(form.apiConfig.method) && form.apiConfig.body) {
        fetchOptions.body = form.apiConfig.body;
      }

      const response = await fetch(form.apiConfig.url, fetchOptions);
      const data = await response.json();

      let extractedData = data;
      if (form.apiConfig.responseKeyPath) {
        const keys = form.apiConfig.responseKeyPath.split(".");
        for (const key of keys) {
          extractedData = extractedData?.[key];
        }
      }

      if (Array.isArray(extractedData)) {
        setApiTestResult(extractedData.slice(0, 5)); // Show first 5 items
      } else {
        setApiTestError("Response is not an array. Check the Response Key Path.");
      }
    } catch (err: any) {
      setApiTestError(err.message || "Failed to fetch API");
    } finally {
      setApiTestLoading(false);
    }
  };

  return (
    <div>
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          {editingId ? "Edit Custom Field" : "Create Custom Field"}
        </h2>
        <button
          onClick={() => {
            if (editingId) {
              resetForm();
              router.replace("/fields");
            } else {
              router.back();
            }
          }}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Class Name
              </label>
              <input
                type="text"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                placeholder="Enter class name"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-2">
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
                    className="px-3 py-2 text-sky-600 hover:bg-sky-50 rounded-md text-sm font-medium whitespace-nowrap"
                  >
                    + New Category
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
                    className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md text-sm whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

              {["dropdown", "radio", "checkbox"].includes(form.dataType) && (
              <div className="pt-4 mt-4">
                <h3 className="text-md font-medium text-slate-700 mb-3">List of Values (LOV)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="lovType"
                        checked={form.lovType === "user-defined"}
                        onChange={() => setForm({ ...form, lovType: "user-defined" })}
                        className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                      />
                      <span className="text-sm text-slate-700">User Defined</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="lovType"
                        checked={form.lovType === "dynamic-api"}
                        onChange={() => setForm({ ...form, lovType: "dynamic-api" })}
                        className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                      />
                      <span className="text-sm text-slate-700">Dynamic API</span>
                    </label>
                  </div>
                </div>
              </div>
              )}

              {["dropdown", "radio", "checkbox"].includes(form.dataType) && form.lovType === "dynamic-api" && (
                <div className="mt-4 space-y-4">
                  <h4 className="text-sm font-medium text-slate-700">API Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        API URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.apiConfig.url}
                        onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, url: e.target.value } })}
                        placeholder="Enter API URL"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Method
                      </label>
                      <select
                        value={form.apiConfig.method}
                        onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, method: e.target.value as any } })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Headers (JSON format)
                    </label>
                    <textarea
                      value={form.apiConfig.headers}
                      onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, headers: e.target.value } })}
                      placeholder='{"Authorization": "Bearer token", "Custom-Header": "value"}'
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500 font-mono text-sm"
                    />
                  </div>

                  {["POST", "PUT", "PATCH"].includes(form.apiConfig.method) && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Request Body (JSON format)
                      </label>
                      <textarea
                        value={form.apiConfig.body}
                        onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, body: e.target.value } })}
                        placeholder='{"key": "value"}'
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500 font-mono text-sm"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Response Key Path
                      </label>
                      <input
                        type="text"
                        value={form.apiConfig.responseKeyPath}
                        onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, responseKeyPath: e.target.value } })}
                        placeholder="data.items"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Value Key
                      </label>
                      <input
                        type="text"
                        value={form.apiConfig.valueKey}
                        onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, valueKey: e.target.value } })}
                        placeholder="id"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Label Key
                      </label>
                      <input
                        type="text"
                        value={form.apiConfig.labelKey}
                        onChange={(e) => setForm({ ...form, apiConfig: { ...form.apiConfig, labelKey: e.target.value } })}
                        placeholder="name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTestApi}
                      disabled={apiTestLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {apiTestLoading ? "Testing..." : "Test API"}
                    </button>
                    {apiTestError && (
                      <span className="text-sm text-red-600">{apiTestError}</span>
                    )}
                  </div>

                  {apiTestResult && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-slate-700 mb-2">Preview (First 5 items)</h5>
                      <div className="border border-slate-200 rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-slate-700">Value ({form.apiConfig.valueKey || "id"})</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-700">Label ({form.apiConfig.labelKey || "name"})</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apiTestResult.map((item, index) => (
                              <tr key={index} className="border-t border-slate-200">
                                <td className="px-3 py-2 text-slate-600">
                                  {item[form.apiConfig.valueKey] ?? item.id ?? "-"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {item[form.apiConfig.labelKey] ?? item.name ?? "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}
                </div>
              )}

              {["dropdown", "radio", "checkbox"].includes(form.dataType) && form.lovType === "user-defined" && (
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
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none "
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.shortName}
                                  onChange={(e) => handleLOVItemChange(index, "shortName", e.target.value)}
                                  placeholder="Short Name"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none "
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleLOVItemChange(index, "description", e.target.value)}
                                  placeholder="Description"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none "
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleLOVItemChange(index, "status", e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none "
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

              {/* Table Configuration - only for table type */}
              {form.dataType === "table" && (
                <div className="pt-4 mt-4">
                  <h3 className="text-md font-medium text-slate-600 mb-3">Table Columns</h3>
                  
                  <div className="space-y-4">
                    {form.tableColumns.map((column, index) => (
                      <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-slate-700">Column {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newColumns = [...form.tableColumns];
                              newColumns.splice(index, 1);
                              setForm({ ...form, tableColumns: newColumns });
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Select Custom Field *</label>
                            <select
                              value={column.customFieldId || ""}
                              onChange={(e) => {
                                const selectedFieldId = e.target.value;
                                const selectedField = availableFieldsForColumns.find(f => f._id === selectedFieldId);
                                
                                if (selectedField) {
                                  // Transform LOV items to VueformItem format
                                  const transformedOptions = (selectedField.lovItems || []).map((item: LOVItem) => ({
                                    value: item.code,
                                    label: item.shortName
                                  }));
                                  
                                  const newColumns = [...form.tableColumns];
                                  newColumns[index] = { 
                                    name: selectedField.fieldName,
                                    label: selectedField.fieldLabel,
                                    type: selectedField.dataType,
                                    required: false,
                                    customFieldId: selectedField._id,
                                    options: transformedOptions
                                  };
                                  setForm({ ...form, tableColumns: newColumns });
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-sky-500"
                            >
                              <option value="">-- Select a Field --</option>
                              {availableFieldsForColumns.map((field) => (
                                <option key={field._id} value={field._id}>
                                  {field.fieldLabel} ({field.dataType})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center pt-6">
                             <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={column.required}
                                onChange={(e) => {
                                  const newColumns = [...form.tableColumns];
                                  newColumns[index] = { ...column, required: e.target.checked };
                                  setForm({ ...form, tableColumns: newColumns });
                                }}
                                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                              />
                              <span className="text-sm text-slate-700">Required</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          tableColumns: [
                            ...form.tableColumns,
                            { 
                              name: '', 
                              label: '', 
                              type: '',
                              required: false,
                              customFieldId: ''
                            }
                          ]
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sky-600 border border-sky-300 rounded-md hover:bg-sky-50 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Column
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              {editingId && (
                <button
                  onClick={() => setShowSaveAsModal(true)}
                  disabled={savingAs}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Save As New
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saving ? "Saving..." : "Save Field"}
              </button>
            </div>
          </div>
      </div>

      <SaveAsModal
        isOpen={showSaveAsModal}
        onClose={() => setShowSaveAsModal(false)}
        onSave={handleSaveAsNew}
        saving={savingAs}
        defaultName={form.fieldLabel ? `${form.fieldLabel} Copy` : ""}
        title="Save Field As New"
        nameLabel="Field Label"
        namePlaceholder="Enter field label"
        saveButtonText="Save As New"
      />
    </div>
  );
}

export default function CustomFieldsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div></div>}>
      <CustomFieldsContent />
    </Suspense>
  );
}
