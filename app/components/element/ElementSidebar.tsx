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

export function ElementSidebar({ 
  formCategory 
}: { 
  formCategory?: string;
}) {
  const router = useRouter();
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch custom fields
  useEffect(() => {
    const fetchCustomFields = async () => {
      setLoading(true);
      try {
        const categoryParam = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : "";
        const response = await fetch(`/api/custom-fields${categoryParam}`);
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
  }, [selectedCategory]);

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
      {/* Add Custom Field Button */}
      <div className="p-2 border-b border-slate-200">
        <button
          onClick={() => router.push("/custom-fields")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Custom Field
        </button>
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
              <span className="text-xs">Click "Add Custom Field" to create one.</span>
            </div>
          ) : (
            customFields.map((field) => (
              <CustomFieldCard key={field._id} field={field} />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
