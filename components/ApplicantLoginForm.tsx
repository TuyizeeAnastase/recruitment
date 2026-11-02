"use client";

import { useActionState } from "react";
import { applicantLoginAction, requestPortalPasswordAction } from "@/app/actions/applicant-auth";

export function ApplicantLoginForm() {
  const [requestState, requestAction, requesting] = useActionState(requestPortalPasswordAction, null);
  const [loginState, loginAction, loggingIn] = useActionState(applicantLoginAction, null);

  return (
    <div className="space-y-8">
      <form action={requestAction} className="space-y-4">
        <p className="text-sm font-medium text-slate-800">1. Get a password by email</p>
        {requestState?.error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {requestState.error}
          </p>
        ) : null}
        {requestState?.sent ? (
          <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
            A new portal password was sent to this address. Check Inbox and Spam.
          </p>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Email used to apply</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-[#0a4a7c]/25 px-3 py-2.5 outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
          />
        </label>
        <button
          type="submit"
          disabled={requesting}
          className="w-full rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {requesting ? "Sending…" : "Email me a new password"}
        </button>
      </form>

      <form action={loginAction} className="space-y-4 border-t border-slate-200 pt-6">
        <p className="text-sm font-medium text-slate-800">2. Sign in with that password</p>
        {loginState?.error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {loginState.error}
          </p>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-[#0a4a7c]/25 px-3 py-2.5 outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Password from your email</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-[#0a4a7c]/25 px-3 py-2.5 outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
          />
        </label>
        <button
          type="submit"
          disabled={loggingIn}
          className="w-full rounded-xl bg-[#00a651] px-5 py-3 text-sm font-semibold text-white hover:bg-[#008a44] disabled:opacity-60"
        >
          {loggingIn ? "Signing in…" : "Open portal"}
        </button>
      </form>
    </div>
  );
}
