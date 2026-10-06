import { createClient } from "@/lib/supabase/server";
import { getAddresses } from "@/lib/queries/account";
import { AddressBook } from "@/components/storefront/account/AddressBook";

export default async function AddressesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const addresses = await getAddresses(user.id);

  return <AddressBook initialAddresses={addresses} />;
}
