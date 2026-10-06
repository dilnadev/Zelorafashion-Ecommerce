import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminProductById } from "@/lib/queries/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [detail, { data: categories }] = await Promise.all([
    getAdminProductById(params.id),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!detail) notFound();

  return <ProductForm detail={detail} categories={categories ?? []} />;
}
