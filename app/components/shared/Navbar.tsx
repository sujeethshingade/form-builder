"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  if (pathname.startsWith("/builder") || pathname.startsWith("/layouts/builder")) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/builder/new" className="text-xl font-bold text-slate-800">
            Form Builder
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/forms"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/forms")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Forms
            </Link>
            <Link
              href="/layouts"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/layouts")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Layouts
            </Link>
            <Link
              href="/fields"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/fields") || isActive("/custom-fields")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Fields
            </Link>
          </div>
        </div>
        <div>
          <Link
            href="/builder/new"
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-md hover:bg-sky-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Form
          </Link>
        </div>
      </div>
    </nav>
  );
}
