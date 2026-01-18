"use client";

import { useState, useEffect } from "react";

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  saving: boolean;
  defaultName?: string;
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  saveButtonText?: string;
}

export function SaveAsModal({
  isOpen,
  onClose,
  onSave,
  saving,
  defaultName = "",
  title = "Save As New",
  nameLabel = "Name",
  namePlaceholder = "Enter name",
  saveButtonText = "Save As New",
}: SaveAsModalProps) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert(`Please enter a ${nameLabel.toLowerCase()}`);
      return;
    }
    onSave(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving) {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onKeyDown={handleKeyDown}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            autoFocus
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600"
          >
            {saving ? "Saving..." : saveButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
