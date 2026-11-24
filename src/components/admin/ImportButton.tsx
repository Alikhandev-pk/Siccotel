"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";
import { runImport } from "@/app/admin/import-action";

/**
 * First-run setup: copies the built-in website content into an empty database
 * (see runImport). The Dashboard shows it only until the import has run.
 */
export function ImportButton() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { const r = await runImport(); setResult(r); router.refresh(); })}
        className="inline-flex h-10 items-center rounded bg-accent px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Importing… (this can take a minute)" : "Import the current website"}
      </button>
      {result && <p role="status" className={`text-sm ${result.ok ? "text-[#1f6b43]" : "text-accent"}`}>{result.ok ? result.message : result.error}</p>}
    </div>
  );
}
