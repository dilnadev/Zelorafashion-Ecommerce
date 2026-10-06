"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ReviewFormState {
  success: boolean;
  message: string;
}

export async function submitReview(
  productId: string,
  productSlug: string,
  _prevState: ReviewFormState | null,
  formData: FormData
): Promise<ReviewFormState> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Sign in to write a review." };
  }

  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: "Select a star rating." };
  }
  if (!body) {
    return { success: false, message: "Write a few words about the product." };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating,
    title: title || null,
    body,
    is_verified: true,
  });

  if (error) {
    if (error.code === "42501") {
      return {
        success: false,
        message: "You can review this product once your order has been delivered.",
      };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath(`/products/${productSlug}`);
  return { success: true, message: "Thanks — your review has been posted." };
}
