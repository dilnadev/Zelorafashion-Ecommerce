import { createClient } from "@/lib/supabase/server";
import type { MediaAsset } from "@/types";

export interface AdminMediaListResult {
  media: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getMediaAssets({
  page = 1,
  pageSize = 30,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<AdminMediaListResult> {
  const supabase = createClient();

  let query = supabase.from("media").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (search) query = query.ilike("filename", `%${search}%`);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count } = await query;
  return { media: data ?? [], total: count ?? 0, page, pageSize };
}
