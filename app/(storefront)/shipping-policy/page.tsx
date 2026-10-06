import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

const SECTIONS = [
  {
    heading: "Processing Time",
    body: [
      "Orders are typically processed within 1–2 business days of being placed. Orders placed on weekends or public holidays are processed on the next business day.",
      "During sale periods or promotions, processing may take slightly longer. We'll notify you by email if there's a significant delay.",
    ],
  },
  {
    heading: "Delivery Times",
    body: [
      "Once shipped, delivery typically takes 3–7 business days depending on your location. Remote areas may take longer.",
      "Estimated delivery dates shown at checkout are our best estimate and are not guaranteed, as delivery can be affected by courier delays, weather, or customs processing.",
    ],
  },
  {
    heading: "Shipping Costs",
    body: [
      "Shipping costs are calculated at checkout based on your delivery address and the shipping method you choose. Any applicable free-shipping thresholds will be shown in your cart.",
    ],
  },
  {
    heading: "Order Tracking",
    body: [
      "Once your order ships, you'll receive a confirmation email with your tracking number and carrier. You can also check your order's status anytime on our Track Order page.",
    ],
  },
  {
    heading: "Shipping Address",
    body: [
      "Please double-check your shipping address before placing your order. We're unable to redirect packages once they've been handed to the courier, and we're not responsible for orders delivered to an incorrect address supplied at checkout.",
    ],
  },
  {
    heading: "Lost or Damaged Packages",
    body: [
      "If your order arrives damaged or doesn't arrive within the estimated delivery window, please contact us so we can investigate with the carrier and arrange a replacement or refund where appropriate.",
    ],
  },
];

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const updatedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-section text-ink">Shipping Policy</h1>
        <p className="mt-3 text-caption normal-case tracking-normal text-ink-muted">
          Last updated: {updatedDate}
        </p>
        <p className="mt-6 text-body text-ink-muted">
          This shipping policy explains how {settings.site_name} processes, ships, and delivers
          your order.
        </p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-xl text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-body text-ink-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="font-serif text-xl text-ink">Contact Us</h2>
            <p className="mt-3 text-body text-ink-muted">
              If you have any questions about shipping or an existing order, please contact us
              {settings.contact_email ? (
                <>
                  {" "}
                  at{" "}
                  <a href={`mailto:${settings.contact_email}`} className="text-accent underline underline-offset-4">
                    {settings.contact_email}
                  </a>
                  .
                </>
              ) : (
                "."
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
