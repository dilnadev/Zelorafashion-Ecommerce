import { NextResponse, type NextRequest } from "next/server";
import { searchProductsQuick } from "@/lib/queries/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchProductsQuick(q, 6);
  return NextResponse.json({ results });
}
