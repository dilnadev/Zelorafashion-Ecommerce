"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import { slugify } from "@/lib/utils";

export interface ActionResult {
  success: boolean;
  message?: string;
}

export async function createDraftProduct(title: string): Promise<ActionResult & { id?: string }> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!title.trim()) return { success: false, message: "Title is required." };

  const supabase = createClient();
  const slug = slugify(title);
  const sku = `SKU-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      slug,
      sku,
      price: 0,
      stock_quantity: 0,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: error.code === "23505" ? "A product with that name already exists." : "Couldn't create product.",
    };
  }

  revalidatePath("/admin/products");
  return { success: true, id: data.id };
}

export interface OptionInput {
  name: string;
  values: string[];
}

export interface VariantInput {
  optionValues: { option_name: string; value: string }[];
  sku: string;
  price: number | null;
  stockQuantity: number;
}

export interface ProductFormInput {
  title: string;
  slug: string;
  description: string;
  categoryId: string | null;
  tags: string[];
  price: number;
  salePrice: number | null;
  saleStart: string | null;
  saleEnd: string | null;
  sku: string;
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  status: "draft" | "active";
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  options: OptionInput[];
  variants: VariantInput[];
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();

  const { error: productErr } = await supabase
    .from("products")
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description || null,
      category_id: input.categoryId,
      tags: input.tags,
      price: input.price,
      sale_price: input.salePrice,
      sale_start: input.saleStart,
      sale_end: input.saleEnd,
      sku: input.sku,
      stock_quantity: input.stockQuantity,
      track_inventory: input.trackInventory,
      allow_backorders: input.allowBackorders,
      status: input.status,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      og_image_url: input.ogImageUrl,
    })
    .eq("id", id);

  if (productErr) {
    return {
      success: false,
      message: productErr.code === "23505" ? "That slug or SKU is already in use." : "Couldn't save product.",
    };
  }

  // Options/variants are small in number for a single product, so a
  // replace-all sync (delete then re-insert) is simpler and safe here.
  const { data: existingOptions } = await supabase
    .from("product_options")
    .select("id")
    .eq("product_id", id);
  if (existingOptions && existingOptions.length > 0) {
    await supabase
      .from("product_options")
      .delete()
      .in(
        "id",
        existingOptions.map((o) => o.id)
      );
  }
  await supabase.from("product_variants").delete().eq("product_id", id);

  for (let i = 0; i < input.options.length; i++) {
    const option = input.options[i];
    const { data: optionRow, error: optionErr } = await supabase
      .from("product_options")
      .insert({ product_id: id, name: option.name, sort_order: i })
      .select("id")
      .single();
    if (optionErr || !optionRow) continue;

    await supabase.from("product_option_values").insert(
      option.values.map((value, j) => ({
        option_id: optionRow.id,
        value,
        sort_order: j,
      }))
    );
  }

  if (input.variants.length > 0) {
    await supabase.from("product_variants").insert(
      input.variants.map((v) => ({
        product_id: id,
        sku: v.sku,
        price: v.price,
        stock_quantity: v.stockQuantity,
        option_values: v.optionValues,
      }))
    );
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete product." };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function bulkDeleteProducts(ids: string[]): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) return { success: false, message: "Couldn't delete products." };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function bulkUpdateStatus(
  ids: string[],
  status: "draft" | "active"
): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("products").update({ status }).in("id", ids);
  if (error) return { success: false, message: "Couldn't update products." };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function addProductImage(productId: string, imageUrl: string, sortOrder: number): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: imageUrl,
    sort_order: sortOrder,
  });
  if (error) return { success: false, message: "Couldn't save image." };

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteProductImage(id: string, productId: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete image." };

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}
