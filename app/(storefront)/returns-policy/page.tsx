import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Returns Policy",
};

const SECTIONS = [
  {
    heading: "Return Window",
    body: [
      "If you're not satisfied with your purchase, you may return it within 30 days of delivery for a refund or exchange, provided the item meets the conditions below.",
    ],
  },
  {
    heading: "Condition of Returned Items",
    body: [
      "Items must be unworn, unwashed, and in their original condition with all tags and packaging attached. Items returned damaged, altered, or without their original packaging may not be eligible for a refund.",
      "Final sale and clearance items cannot be returned unless they arrived defective or damaged.",
    ],
  },
  {
    heading: "How to Start a Return",
    body: [
      "To start a return, contact us with your order number and the item(s) you'd like to return. We'll provide instructions on how and where to send your package.",
      "Return shipping costs are the customer's responsibility unless the item arrived defective, damaged, or incorrect.",
    ],
  },
  {
    heading: "Refunds",
    body: [
      "Once we receive and inspect your return, we'll notify you of the approval status. Approved refunds are issued to your original payment method within 5–10 business days.",
      "Original shipping charges are non-refundable, except where the return is due to our error.",
    ],
  },
  {
    heading: "Exchanges",
    body: [
      "If you'd like a different size or color, let us know when you start your return — we'll ship the replacement as soon as the original item is received, subject to availability.",
    ],
  },
  {
    heading: "Damaged or Incorrect Items",
    body: [
      "If you receive a damaged, defective, or incorrect item, please contact us within 7 days of delivery with photos of the issue so we can arrange a replacement or refund at no extra cost to you.",
    ],
  },
];

export default async function ReturnsPolicyPage() {
  const settings = await getSiteSettings();
  const updatedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-section text-ink">Returns Policy</h1>
        <p className="mt-3 text-caption normal-case tracking-normal text-ink-muted">
          Last updated: {updatedDate}
        </p>
        <p className="mt-6 text-body text-ink-muted">
          This returns policy explains how to return or exchange an item purchased from{" "}
          {settings.site_name}.
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
              To start a return or ask about an exchange, please contact us
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
