"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeToNewsletter(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "You're already subscribed." };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  return { success: true, message: "You're subscribed — welcome!" };
}

export async function submitContactMessage(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) {
    return { success: false, message: "Please enter your name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }
  if (!message) {
    return { success: false, message: "Please enter a message." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, subject: subject || null, message });

  if (error) {
    return { success: false, message: "Something went wrong. Please try again." };
  }

  return { success: true, message: "Your message has been sent — we'll get back to you soon." };
}
