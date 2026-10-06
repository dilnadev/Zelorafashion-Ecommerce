import { createClient } from "@/lib/supabase/server";

export type AdminActionCheck = { ok: true; userId: string } | { ok: false; message: string };

export async function verifyAdminAction(): Promise<AdminActionCheck> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return { ok: false, message: "Admin access required." };

  return { ok: true, userId: user.id };
}
