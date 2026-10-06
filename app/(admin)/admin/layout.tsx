import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar adminName={profile.full_name ?? profile.email} />
      <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
