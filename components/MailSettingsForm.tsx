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
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {saveState.error}
          </p>
        ) : null}
        {saveState?.saved ? (
          <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
            Email settings saved. Send a test message below.
          </p>
        ) : null}
        <p className="text-sm text-[#5a7384]">
          {configured ? "A sending mailbox is saved." : "No sending mailbox yet — applicants will not get mail."}
        </p>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">SMTP host</span>
          <input
            name="host"
            required
            defaultValue={host}
            placeholder="smtp.office365.com or mail.boarwanda.com"
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[#0a2f4a]">Port</span>
            <input
              name="port"
              type="number"
              required
              defaultValue={port || 587}
              className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5"
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-[#0a2f4a]">
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
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Sending mailbox</span>
          <input
            name="username"
            type="email"
            required
            defaultValue={username}
            placeholder="careers@boarwanda.com"
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">SMTP password</span>
          <input
            name="password"
            type="password"
            placeholder={configured ? "Leave blank to keep the saved password" : "Mailbox or relay password"}
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">From name</span>
          <input
            name="fromName"
            defaultValue={fromName}
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5"
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

      <form action={testAction} className="space-y-4 border-t border-[#0a4a7c]/15 pt-6">
        <p className="text-sm font-medium text-[#0a2f4a]">Send a test email</p>
        {testState?.error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {testState.error}
          </p>
        ) : null}
        {testState?.saved ? (
          <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
            Test message sent. Check the inbox (and Spam) for that address.
          </p>
        ) : null}
        <input
          name="testTo"
          type="email"
          required
          placeholder="your work email"
          className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5"
        />
        <button
          type="submit"
          disabled={testing}
          className="rounded-full border border-[#0a4a7c]/25 px-5 py-2.5 text-sm font-semibold text-[#0a4a7c] disabled:opacity-60"
        >
          {testing ? "Sending…" : "Send test"}
        </button>
      </form>
    </div>
  );
}
