"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/app/components/shared/SearchInput";


interface FormLayoutData {
  _id: string;
  layoutName: string;
  layoutType: "form-group" | "grid-layout";
  category?: string;
  fields: any[];
  createdAt: string;
  updatedAt: string;
}

export default function LayoutsPage() {
  const router = useRouter();
  const [layouts, setLayouts] = useState<FormLayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const fetchLayouts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterType) params.set("type", filterType);
      if (filterCategory) params.set("category", filterCategory);
      
      const queryString = params.toString();
      const url = `/api/form-layouts${queryString ? `?${queryString}` : ""}`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLayouts(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch layouts");
    }
  }, [filterType, filterCategory, search]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/form-layouts/categories");
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
      await fetchLayouts();
      setLoading(false);
    };
    loadData();
  }, [fetchLayouts]);

  const handleDeleteLayout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this layout?")) return;

    try {
      const response = await fetch(`/api/form-layouts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchLayouts();
        fetchCategories(); // Refresh categories in case the deleted layout was the last one in a category
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to delete layout");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().replace("T", " ").slice(0, -5) + "Z";
  };

  const handleLayoutClick = (layoutId: string) => {
    router.push(`/layouts/builder/${layoutId}`);
  };

  const getLayoutTypeLabel = (type: string) => {
    switch (type) {
      case "form-group":
        return "Form Group";
      case "grid-layout":
        return "Grid Layout";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      <main className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search layouts..."
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
                <option value="form-group">Form Groups</option>
                <option value="grid-layout">Grid Layouts</option>
              </select>
            </div>
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
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Layout Name</th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : layouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No layouts found. Create layouts from the form builder using &quot;Save as Form Group&quot; or &quot;Save as Grid Layout&quot;.
                  </td>
                </tr>
              ) : (
                layouts.map((layout) => (
                  <tr key={layout._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleLayoutClick(layout._id)}
                        className="text-sm text-slate-600 hover:text-sky-600 font-medium transition-colors"
                      >
                        {layout.layoutName}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm text-slate-500`}>
                        {getLayoutTypeLabel(layout.layoutType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {layout.category || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(layout.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(layout.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleLayoutClick(layout._id)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 transition-colors"
                          title="Edit Layout"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLayout(layout._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Layout"
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
    </div>
  );
}
