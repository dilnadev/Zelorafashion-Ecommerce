"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";

export interface ActionResult {
  success: boolean;
  message?: string;
}

export async function updateCustomerStatus(userId: string, isActive: boolean): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const admin = createAdminClient();

  const { error: profileErr } = await admin.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (profileErr) return { success: false, message: "Couldn't update customer status." };

  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? "none" : "876000h",
  });
  if (authErr) return { success: false, message: "Profile updated, but couldn't change account access." };

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return { success: true };
}

export async function updateCustomerNotes(userId: string, notes: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ internal_notes: notes }).eq("id", userId);
  if (error) return { success: false, message: "Couldn't save notes." };

  revalidatePath(`/admin/customers/${userId}`);
  return { success: true };
}
