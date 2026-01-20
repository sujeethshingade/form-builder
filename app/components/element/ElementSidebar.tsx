"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";

interface LOVItem {
  code: string;
  shortName: string;
  description?: string;
  status: "Active" | "Inactive";
}

interface BoxLayoutColumn {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  width?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  phoneConfig?: {
    defaultCountry?: string;
    showCountryCode?: boolean;
  };
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
  boxLayoutColumns?: BoxLayoutColumn[];
}

interface FormLayoutData {
  _id: string;
  layoutName: string;
  layoutType: 'form-group' | 'grid-layout' | 'box-layout';
  category?: string;
  fields: any[];
}

function CustomFieldCard({ field }: { field: CustomFieldData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `custom-field-${field._id}`,
    data: { 
      from: "custom-field", 
      customFieldId: field._id,
      type: field.dataType,
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      lovEnabled: field.lovEnabled,
      lovItems: field.lovItems,
      boxLayoutColumns: field.boxLayoutColumns,
    },
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "text":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "textarea":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case "number":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case "email":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "date":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "select":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        );
      case "radio":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        );
      case "checkbox":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "file":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        );
      case "url":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case "heading":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8" />
          </svg>
        );
      case "divider":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case "spacer":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M12 8v8" />
          </svg>
        );
      case "table":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
          </svg>
        );
      case "box-layout":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM4 13h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a1 1 0 011-1z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5v4M12 5v4M16 5v4M8 13v4M12 13v4M16 13v4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 border rounded-sm border-slate-200 bg-white px-2 py-2 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-7 w-7 items-center justify-center text-slate-500 shrink-0">
        {getIconForType(field.dataType)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-700 truncate">{field.fieldLabel}</div>
        <div className="text-xs text-slate-400 truncate">{field.dataType}</div>
      </div>
    </div>
  );
}

function FormLayoutCard({ layout }: { layout: FormLayoutData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `form-layout-${layout._id}`,
    data: { 
      from: "form-layout", 
      layoutId: layout._id,
      layoutType: layout.layoutType,
      layoutName: layout.layoutName,
      fields: layout.fields,
    },
  });

  const isGroup = layout.layoutType === 'form-group';
  const isGrid = layout.layoutType === 'grid-layout';
  const isBox = layout.layoutType === 'box-layout';

  const getLayoutTypeLabel = () => {
    switch (layout.layoutType) {
      case 'form-group':
        return 'Form Group';
      case 'grid-layout':
        return 'Grid Layout';
      case 'box-layout':
        return 'Box Layout';
      default:
        return 'Layout';
    }
  };

  const getBorderClass = () => {
    if (isGroup) return "border-purple-200 bg-purple-50 hover:border-purple-300 hover:bg-purple-100";
    if (isGrid) return "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100";
    if (isBox) return "border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100";
    return "border-slate-200 bg-slate-50 hover:border-slate-300";
  };

  const getIconClass = () => {
    if (isGroup) return "text-purple-500";
    if (isGrid) return "text-emerald-500";
    if (isBox) return "text-blue-500";
    return "text-slate-500";
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 border rounded-sm px-2 py-2 cursor-grab transition hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-md" : ""
      } ${getBorderClass()}`}
    >
      <div className={`flex h-7 w-7 items-center justify-center shrink-0 ${getIconClass()}`}>
        {isGroup ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ) : isBox ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-700 truncate">{layout.layoutName}</div>
        <div className="text-xs text-slate-400 truncate">
          {getLayoutTypeLabel()} • {layout.fields?.length || 0} fields
        </div>
      </div>
    </div>
  );
}

export function ElementSidebar({ 
  formCategory 
}: { 
  formCategory?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"fields" | "layouts">("fields");
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [formLayouts, setFormLayouts] = useState<FormLayoutData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [layoutFilter, setLayoutFilter] = useState<string>("all");
  const [fieldSearch, setFieldSearch] = useState<string>("");
  const [layoutSearch, setLayoutSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch custom fields
  useEffect(() => {
    if (activeTab !== "fields") return;
    
    const fetchCustomFields = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set("category", selectedCategory);
        if (fieldSearch.trim()) params.set("search", fieldSearch.trim());
        const queryString = params.toString();
        const response = await fetch(`/api/custom-fields${queryString ? `?${queryString}` : ""}`);
        const data = await response.json();
        if (data.success) {
          setCustomFields(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch custom fields:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomFields();
  }, [selectedCategory, fieldSearch, activeTab]);

  // Fetch form layouts
  useEffect(() => {
    if (activeTab !== "layouts") return;
    
    const fetchFormLayouts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (layoutFilter !== "all") params.set("type", layoutFilter);
        if (layoutSearch.trim()) params.set("search", layoutSearch.trim());
        const queryString = params.toString();
        const response = await fetch(`/api/form-layouts${queryString ? `?${queryString}` : ""}`);
        const data = await response.json();
        if (data.success) {
          setFormLayouts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch form layouts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormLayouts();
  }, [layoutFilter, layoutSearch, activeTab]);

  // Fetch categories
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Auto-select form category if provided
  useEffect(() => {
    if (formCategory && categories.includes(formCategory)) {
      setSelectedCategory(formCategory);
    }
  }, [formCategory, categories]);

  return (
    <aside className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Tab Header - matching right sidebar style */}
      <div className="border-b border-gray-200 px-2 py-2 flex gap-1">
        <button
          onClick={() => setActiveTab("fields")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "fields"
              ? "bg-sky-100 text-sky-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Fields
        </button>
        <button
          onClick={() => setActiveTab("layouts")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "layouts"
              ? "bg-sky-100 text-sky-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Layouts
        </button>
      </div>

      {activeTab === "fields" ? (
        <>
          {/* Manage Fields Button */}
          <div className="p-2 border-b border-slate-200">
            <button
              onClick={() => router.push("/fields")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manage Fields
            </button>
          </div>

          {/* Search Fields */}
          <div className="p-2 border-b border-slate-200">
            <input
              type="text"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Search fields by name"
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
            />
          </div>

          {/* Category Filter */}
          <div className="p-2 border-b border-slate-200">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Fields List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading fields...</div>
              ) : customFields.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No custom fields found.
                  <br />
                  <span className="text-xs">Click "Manage Fields" to create or edit.</span>
                </div>
              ) : (
                customFields.map((field) => (
                  <CustomFieldCard key={field._id} field={field} />
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Layout Search */}
          <div className="p-2 border-b border-slate-200">
            <input
              type="text"
              value={layoutSearch}
              onChange={(e) => setLayoutSearch(e.target.value)}
              placeholder="Search layouts by name"
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
            />
          </div>

          {/* Layout Type Filter */}
          <div className="p-2 border-b border-slate-200">
            <select
              value={layoutFilter}
              onChange={(e) => setLayoutFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
            >
              <option value="all">All Layouts</option>
              <option value="form-group">Form Groups</option>
              <option value="grid-layout">Grid Layouts</option>
              <option value="box-layout">Box Layouts</option>
            </select>
          </div>

          {/* Form Layouts List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading layouts...</div>
              ) : formLayouts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No form layouts found.
                  <br />
                  <span className="text-xs">Save a form as "Form Group" or "Grid Layout" to view.</span>
                </div>
              ) : (
                formLayouts.map((layout) => (
                  <FormLayoutCard key={layout._id} layout={layout} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
