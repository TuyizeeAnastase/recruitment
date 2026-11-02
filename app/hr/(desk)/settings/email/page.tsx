import { prisma } from "@/lib/prisma";
import { MailSettingsForm } from "@/components/MailSettingsForm";

export const dynamic = "force-dynamic";

export default async function EmailSettingsPage() {
  const settings = await prisma.mailSetting.findUnique({ where: { id: "default" } });

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-white">Mail server</h2>
      <p className="mt-2 mb-6 text-sm text-slate-400">
        On the live server, save the bank’s SMTP host (Microsoft 365 or the internal relay). Gmail is only
        for local testing.
      </p>
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <MailSettingsForm
          host={settings?.host ?? ""}
          port={settings?.port ?? 587}
          secure={settings?.secure ?? false}
          username={settings?.username ?? ""}
          fromName={settings?.fromName ?? "BANK OF AFRICA RWANDA Careers"}
          configured={Boolean(settings?.username && settings?.password)}
        />
      </div>
    </div>
  );
}
