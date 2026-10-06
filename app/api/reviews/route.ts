import { NextResponse, type NextRequest } from "next/server";
import { getProductReviews } from "@/lib/queries/product-detail";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const productId = params.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const page = params.get("page") ? Number(params.get("page")) : 1;
  const result = await getProductReviews(productId, page, 5);
  return NextResponse.json(result);
}
