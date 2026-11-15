"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="mt-5 space-y-4">
      <label className="block text-sm font-semibold">
        Email
        <input name="email" type="email" autoComplete="username" required className="mt-1 w-full rounded border border-line-strong px-3 py-2 font-normal" />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded border border-line-strong px-3 py-2 font-normal" />
      </label>
      {state.error && <p role="alert" className="rounded bg-[#fff5f5] px-3 py-2 text-sm text-accent">{state.error}</p>}
      <button disabled={pending} className="inline-flex h-11 w-full items-center justify-center rounded bg-accent font-semibold text-white disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
