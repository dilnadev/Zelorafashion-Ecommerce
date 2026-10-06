import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

const DEFAULT_ROBOTS = "User-agent: *\nAllow: /\n";

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.from("seo_settings").select("robots_txt").limit(1).maybeSingle();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const body = `${data?.robots_txt ?? DEFAULT_ROBOTS}\nSitemap: ${baseUrl}/sitemap.xml\n`;

  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
