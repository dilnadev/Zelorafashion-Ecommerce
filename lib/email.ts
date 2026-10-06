import { Resend } from "resend";
import { getOrderById } from "@/lib/queries/order-confirmation";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency } from "@/lib/utils";

function renderOrderConfirmationEmail({
  siteName,
  orderNumber,
  items,
  subtotal,
  shippingCost,
  discountAmount,
  taxAmount,
  total,
  shippingAddress,
  orderUrl,
  currencyCode,
}: {
  siteName: string;
  orderNumber: string;
  items: { title: string; quantity: number; line_total: number }[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  orderUrl: string;
  currencyCode: string;
}) {
  const fmt = (n: number) => formatCurrency(n, currencyCode);
  const fullName = String(shippingAddress.full_name ?? "");
  const addressLines = [
    String(shippingAddress.address_line1 ?? ""),
    shippingAddress.address_line2 ? String(shippingAddress.address_line2) : null,
    [shippingAddress.city, shippingAddress.state, shippingAddress.zip].filter(Boolean).join(", "),
    shippingAddress.country ? String(shippingAddress.country) : null,
  ].filter(Boolean);

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #ece7e0;color:#171717;font-size:14px;">
            ${item.title} &times; ${item.quantity}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #ece7e0;color:#171717;font-size:14px;text-align:right;">
            ${fmt(item.line_total)}
          </td>
        </tr>`
    )
    .join("");

  const summaryRow = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;color:${bold ? "#171717" : "#75706A"};font-size:${bold ? "15px" : "13px"};font-weight:${bold ? "600" : "400"};">${label}</td>
      <td style="padding:4px 0;color:${bold ? "#171717" : "#75706A"};font-size:${bold ? "15px" : "13px"};font-weight:${bold ? "600" : "400"};text-align:right;">${value}</td>
    </tr>`;

  return `
  <div style="background-color:#F8F5EF;padding:40px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #ece7e0;">
      <div style="padding:32px 32px 0;text-align:center;">
        <p style="margin:0;letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:#C99A96;font-family:Arial,sans-serif;">Order Confirmed</p>
        <h1 style="margin:12px 0 0;font-size:26px;color:#171717;font-weight:400;">${siteName}</h1>
      </div>
      <div style="padding:24px 32px 0;font-family:Arial,sans-serif;">
        <p style="font-size:14px;color:#171717;margin:0 0 4px;">Hi ${fullName || "there"},</p>
        <p style="font-size:14px;color:#75706A;line-height:1.6;margin:0 0 24px;">
          Thank you for your order — we're getting it ready. Here's a summary of what you purchased.
        </p>
        <p style="font-size:13px;color:#75706A;margin:0 0 24px;text-transform:uppercase;letter-spacing:0.08em;">
          Order ${orderNumber}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${itemRows}
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
          ${summaryRow("Subtotal", fmt(subtotal))}
          ${summaryRow("Shipping", shippingCost > 0 ? fmt(shippingCost) : "Free")}
          ${discountAmount > 0 ? summaryRow("Discount", `-${fmt(discountAmount)}`) : ""}
          ${taxAmount > 0 ? summaryRow("Tax", fmt(taxAmount)) : ""}
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px;border-top:1px solid #171717;padding-top:8px;">
          ${summaryRow("Total", fmt(total), true)}
        </table>
      </div>
      <div style="padding:24px 32px;font-family:Arial,sans-serif;">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#75706A;margin:0 0 8px;">Shipping To</p>
        <p style="font-size:14px;color:#171717;line-height:1.6;margin:0;">
          ${addressLines.join("<br/>")}
        </p>
      </div>
      <div style="padding:0 32px 32px;text-align:center;font-family:Arial,sans-serif;">
        <a href="${orderUrl}" style="display:inline-block;margin-top:8px;background:#171717;color:#ffffff;text-decoration:none;padding:14px 32px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
          View Order
        </a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #ece7e0;text-align:center;font-family:Arial,sans-serif;">
        <p style="font-size:12px;color:#75706A;margin:0;">${siteName}</p>
      </div>
    </div>
  </div>`;
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email.");
    return;
  }

  const [order, settings] = await Promise.all([getOrderById(orderId), getSiteSettings()]);
  if (!order) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${siteUrl}/order-confirmation/${order.id}`;

  const html = renderOrderConfirmationEmail({
    siteName: settings.site_name,
    orderNumber: order.order_number,
    items: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shipping_cost,
    discountAmount: order.discount_amount,
    taxAmount: order.tax_amount,
    total: order.total,
    shippingAddress: order.shipping_address,
    orderUrl,
    currencyCode: settings.currency_code,
  });

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    await resend.emails.send({
      from: `${settings.site_name} <${fromAddress}>`,
      to: order.email,
      subject: `Your ${settings.site_name} order ${order.order_number} is confirmed`,
      html,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}
