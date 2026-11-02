"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {state.error}
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700">Work email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-[#0a4a6e] focus:ring-2 focus:ring-[#0a4a6e]/15"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-[#0a4a6e] focus:ring-2 focus:ring-[#0a4a6e]/15"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#0a4a6e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#083a57] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
