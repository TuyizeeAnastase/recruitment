import { requireAdmin } from "@/lib/auth";
import { SettingsNav } from "@/components/SettingsNav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#00a651]">Administration</p>
      <h1 className="mt-1 text-2xl font-semibold text-[#0a4a7c]">Settings</h1>
      <p className="mt-2 mb-6 text-sm text-[#5a7384]">
        Email, applicants, and live roles. Only administrators can open this menu.
      </p>
      <SettingsNav />
      {children}
    </div>
  );
}
