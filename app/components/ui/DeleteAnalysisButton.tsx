"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteAnalysisButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this analysis? This cannot be undone.")) return;

    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={error ? "Delete failed — try again" : "Delete analysis"}
      className={`p-1 rounded transition-colors shrink-0 ${
        error
          ? "text-red-500 hover:text-red-600"
          : "text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
      } disabled:opacity-50`}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
