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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 border rounded-sm px-2 py-2 cursor-grab transition hover:shadow-sm active:cursor-grabbing bg-white border-slate-200 hover:bg-slate-50 ${
        isDragging ? "opacity-50 shadow-md" : ""
      }`}
    >
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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 border rounded-sm px-2 py-2 cursor-grab transition hover:shadow-sm active:cursor-grabbing bg-white border-slate-200 hover:bg-slate-50 ${
        isDragging ? "opacity-50 shadow-md" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-700 truncate">{layout.layoutName}</div>
        <div className="text-xs text-slate-400 truncate">
          {getLayoutTypeLabel()}
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
          <div className="p-2">
            <button
              onClick={() => router.push("/custom-fields")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Field
            </button>
          </div>

          {/* Search Fields */}
          <div className="p-2">
            <input
              type="text"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Search fields..."
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
            />
          </div>

          {/* Category Filter */}
          <div className="p-2">
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
                  <span className="text-xs">Click "Create Field" to create or edit.</span>
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
          <div className="p-2">
            <input
              type="text"
              value={layoutSearch}
              onChange={(e) => setLayoutSearch(e.target.value)}
              placeholder="Search layouts..."
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
            />
          </div>

          {/* Layout Type Filter */}
          <div className="p-2">
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
