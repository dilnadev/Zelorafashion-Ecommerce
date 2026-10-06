import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ success: false, message: "Missing fields." }, { status: 400 });
  }

  const isValid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "Payment signature verification failed." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, razorpay_order_id, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.razorpay_order_id !== razorpay_order_id) {
    return NextResponse.json({ success: false, message: "Order mismatch." }, { status: 400 });
  }

  if (order.payment_status !== "paid") {
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("id", orderId);

    await supabase.from("order_timeline").insert({
      order_id: orderId,
      status: "confirmed",
      note: "Payment received via Razorpay.",
    });

    await sendOrderConfirmationEmail(orderId);
  }

  return NextResponse.json({ success: true, orderNumber: order.order_number });
}
