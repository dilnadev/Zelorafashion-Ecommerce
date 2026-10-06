import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 501 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminClient();

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const razorpayOrderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (razorpayOrderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (order && order.payment_status !== "paid") {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", razorpay_payment_id: paymentId })
          .eq("id", order.id);
        await supabase.from("order_timeline").insert({
          order_id: order.id,
          status: "confirmed",
          note: "Payment confirmed via Razorpay webhook.",
        });

        await sendOrderConfirmationEmail(order.id);
      }
    }
  }

  if (event.event === "payment.failed") {
    const razorpayOrderId = event.payload?.payment?.entity?.order_id;
    if (razorpayOrderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (order && order.payment_status === "pending") {
        await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
        await supabase.from("order_timeline").insert({
          order_id: order.id,
          status: "failed",
          note: "Payment failed via Razorpay webhook.",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
