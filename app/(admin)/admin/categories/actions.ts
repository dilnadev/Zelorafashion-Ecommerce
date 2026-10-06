"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import { slugify } from "@/lib/utils";

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
}

export interface ActionResult {
  success: boolean;
  message?: string;
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("categories").insert({
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description || null,
    image_url: input.image_url,
  });

  if (error) {
    return {
      success: false,
      message:
        error.code === "23505" ? "A category with that slug already exists." : "Couldn't create category.",
    };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug || slugify(input.name),
      description: input.description || null,
      image_url: input.image_url,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message:
        error.code === "23505" ? "A category with that slug already exists." : "Couldn't update category.",
    };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete category." };

  revalidatePath("/admin/categories");
  return { success: true };
}
