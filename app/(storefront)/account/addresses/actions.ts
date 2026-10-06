"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

async function clearDefaults(userId: string) {
  const supabase = createClient();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
}

export async function createAddress(input: AddressInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sign in required." };

  if (input.isDefault) await clearDefaults(user.id);

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    full_name: input.fullName,
    phone: input.phone,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2 || null,
    city: input.city,
    state: input.state,
    zip: input.zip,
    country: input.country,
    is_default: input.isDefault,
  });

  if (error) return { success: false, message: "Couldn't save address." };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(id: string, input: AddressInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sign in required." };

  if (input.isDefault) await clearDefaults(user.id);

  const { error } = await supabase
    .from("addresses")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2 || null,
      city: input.city,
      state: input.state,
      zip: input.zip,
      country: input.country,
      is_default: input.isDefault,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, message: "Couldn't update address." };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sign in required." };

  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, message: "Couldn't delete address." };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddress(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sign in required." };

  await clearDefaults(user.id);
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, message: "Couldn't set default address." };
  revalidatePath("/account/addresses");
  return { success: true };
}
