import { Suspense } from "react";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/cms/auth";
import { SiccotelLogo } from "@/components/SiccotelLogo";
import { LoginForm } from "./LoginForm";
import { signOut } from "../actions";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">
        <SiccotelLogo tone="light" className="h-7 w-auto" />
        <h1 className="mt-6 text-2xl font-semibold">Admin sign-in</h1>
        <Suspense fallback={<p className="mt-4 text-muted">Loading…</p>}>
          <LoginState />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginState() {
  const check = await checkAdmin();
  if (check.state === "admin") redirect("/admin");
  if (check.state === "unconfigured")
    return (
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        The database is not configured yet. Set <code>DATABASE_URL</code> in <code>.env.local</code> (see <code>README.md</code>).
      </p>
    );
  if (check.state === "forbidden")
    return (
      <div className="mt-4 space-y-3 text-sm">
        <p className="rounded bg-[#fff5f5] px-3 py-2 text-accent">{check.email} is signed in but is not an admin. Ask an existing admin to grant access.</p>
        <form action={signOut}>
          <button className="font-semibold underline">Sign out</button>
        </form>
      </div>
    );
  return (
    <>
      <p className="mt-2 text-sm text-muted">Accounts are invite-only. There is no public sign-up.</p>
      <LoginForm />
    </>
  );
}
