import { requireHr } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  await requireHr();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-white">No menus assigned</h1>
      <p className="mt-3 text-sm text-slate-400">
        Your account is active, but an administrator has not given you permission to open any HR menus.
        Ask an administrator to assign access.
      </p>
    </div>
  );
}
