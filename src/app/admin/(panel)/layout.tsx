import Link from "next/link";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/cms/auth";
import { docSchemas } from "@/lib/cms/schemas";
import { DOC_KEYS } from "@/lib/cms/types";
import { SiccotelLogo } from "@/components/SiccotelLogo";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../actions";


export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>
      <Panel>{children}</Panel>
    </Suspense>
  );
}

async function Panel({ children }: { children: React.ReactNode }) {
  const check = await requireAdminPage();
  if (check.state === "unconfigured")
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">CMS not configured</h1>
        <p className="mt-3 text-ink-soft">Set <code>DATABASE_URL</code>, run <code>npm run db:migrate</code> and create the first admin. Steps are in <code>README.md</code>.</p>
      </div>
    );
  if (check.state !== "admin")
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Not authorized</h1>
        <p className="mt-3 text-ink-soft">This account does not have admin access.</p>
        <form action={signOut} className="mt-4"><button className="font-semibold underline">Sign out</button></form>
      </div>
    );
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-[#101114] lg:border-r lg:border-b-0">
        <div className="lg:sticky lg:top-0 lg:max-h-dvh lg:overflow-y-auto">
          <AdminNav
            brand={<Link href="/admin" aria-label="Admin dashboard" className="inline-block"><SiccotelLogo tone="light" className="h-6 w-auto" /></Link>}
            email={check.email}
            pages={DOC_KEYS.filter((k) => k !== "settings").map((key) => ({ href: `/admin/content/${key}`, label: docSchemas[key].title }))}
          />
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">{children}</main>
    </div>
  );
}
