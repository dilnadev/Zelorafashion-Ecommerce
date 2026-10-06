import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return <CategoryManager initialCategories={categories ?? []} />;
}
