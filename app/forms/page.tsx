"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/app/components/shared/SearchInput";
import type { FormData as BaseFormData, CollectionData, FormField, FormStyles } from "../lib/types";

interface FormJson {
  fields: FormField[];
  styles: FormStyles;
}

interface FormData extends BaseFormData {
  formJson?: FormJson;
}

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [filterCollection, setFilterCollection] = useState<string>("");
  const [search, setSearch] = useState("");

  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
  });

  const fetchForms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterCollection) params.set("collection", filterCollection);
      
      const queryString = params.toString();
      const url = `/api/forms${queryString ? `?${queryString}` : ""}`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setForms(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch forms");
    }
  }, [filterCollection, search]);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      if (data.success) {
        setCollections(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch collections");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchForms(), fetchCollections()]);
      setLoading(false);
    };
    loadData();
  }, [fetchForms]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCollection.name) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollection),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowNewCollectionModal(false);
        setNewCollection({
          name: "",
          description: "",
        });
        fetchCollections();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to create collection");
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchForms();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to delete form");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().replace("T", " ").slice(0, -5) + "Z";
  };

  const handleFormClick = (formId: string) => {
    router.push(`/builder/${formId}`);
  };

  return (
    <div className="min-h-full bg-slate-50">


      <main className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search forms..."
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Collection:</label>
              <select
                value={filterCollection}
                onChange={(e) => setFilterCollection(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Collections</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNewCollectionModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-sky-500 text-white text-sm rounded-md hover:bg-sky-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Collection
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
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Collection</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Form Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Created</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Updated</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No forms found. Click &quot;New Form&quot; to create your first form.
                  </td>
                </tr>
              ) : (
                forms.map((form) => (
                  <tr key={form._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{form.collectionName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleFormClick(form._id)}
                        className="text-sm text-slate-600 hover:text-sky-600 font-medium transition-colors"
                      >
                        {form.formName}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(form.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(form.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleFormClick(form._id)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 transition-colors"
                          title="Edit Form"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Form"
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

      {showNewCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Add New Collection</h2>
              <button
                onClick={() => setShowNewCollectionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateCollection} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCollectionModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
