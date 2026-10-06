import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/storefront/account/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10 pb-24 md:px-16 md:pb-10">
      <div className="flex flex-col gap-10 md:flex-row">
        <AccountNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
