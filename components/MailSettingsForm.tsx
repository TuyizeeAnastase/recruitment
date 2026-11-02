"use client";

import { useActionState } from "react";
import { saveMailSettingsAction, sendTestMailAction } from "@/app/actions/mail";

export function MailSettingsForm({
  host,
  port,
  secure,
  username,
  fromName,
  configured,
}: {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  configured: boolean;
}) {
  const [saveState, saveAction, saving] = useActionState(saveMailSettingsAction, null);
  const [testState, testAction, testing] = useActionState(sendTestMailAction, null);

  return (
    <div className="space-y-8">
      <form action={saveAction} className="space-y-4">
        {saveState?.error ? (
          <p className="rounded-lg border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {saveState.error}
          </p>
        ) : null}
        {saveState?.saved ? (
          <p className="rounded-lg border border-teal-400/40 bg-teal-950/40 px-3 py-2 text-sm text-teal-100">
            Email settings saved. Send a test message below.
          </p>
        ) : null}
        <p className="text-sm text-slate-400">
          {configured ? "A sending mailbox is saved." : "No sending mailbox yet — applicants will not get mail."}
        </p>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">SMTP host</span>
          <input
            name="host"
            required
            defaultValue={host}
            placeholder="smtp.office365.com or mail.boarwanda.com"
            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-200">Port</span>
            <input
              name="port"
              type="number"
              required
              defaultValue={port || 587}
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate-200">
            <input
              type="checkbox"
              name="secure"
              defaultChecked={secure}
              className="h-4 w-4 accent-teal-600"
            />
            SSL (port 465). Leave off for 587 STARTTLS.
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Sending mailbox</span>
          <input
            name="username"
            type="email"
            required
            defaultValue={username}
            placeholder="careers@boarwanda.com"
            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">SMTP password</span>
          <input
            name="password"
            type="password"
            placeholder={configured ? "Leave blank to keep the saved password" : "Mailbox or relay password"}
            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">From name</span>
          <input
            name="fromName"
            defaultValue={fromName}
            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save mail settings"}
        </button>
      </form>

      <form action={testAction} className="space-y-4 border-t border-slate-700 pt-6">
        <p className="text-sm font-medium text-slate-200">Send a test email</p>
        {testState?.error ? (
          <p className="rounded-lg border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {testState.error}
          </p>
        ) : null}
        {testState?.saved ? (
          <p className="rounded-lg border border-teal-400/40 bg-teal-950/40 px-3 py-2 text-sm text-teal-100">
            Test message sent. Check the inbox (and Spam) for that address.
          </p>
        ) : null}
        <input
          name="testTo"
          type="email"
          required
          placeholder="your work email"
          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"
        />
        <button
          type="submit"
          disabled={testing}
          className="rounded-full border border-slate-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {testing ? "Sending…" : "Send test"}
        </button>
      </form>
    </div>
  );
}
