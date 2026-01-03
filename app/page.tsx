"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to forms page
    router.push("/forms");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-lg text-slate-600">Redirecting to Forms</div>
    </div>
  );
}
