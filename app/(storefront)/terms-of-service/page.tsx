import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const SECTIONS = [
  {
    heading: "Acceptance of Terms",
    body: [
      "By accessing or using our site, you agree to be bound by these terms of service. If you do not agree to these terms, please do not use our site.",
    ],
  },
  {
    heading: "Use of the Site",
    body: [
      "You agree to use our site only for lawful purposes and in a way that does not infringe the rights of, or restrict or inhibit the use and enjoyment of, this site by anyone else.",
      "You must be at least 18 years old, or have the consent of a parent or guardian, to make a purchase on our site.",
    ],
  },
  {
    heading: "Products & Pricing",
    body: [
      "We make every effort to display our products and their prices accurately. However, we reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information at any time without prior notice.",
      "All prices are listed in the currency shown at checkout and are subject to change without notice.",
    ],
  },
  {
    heading: "Orders & Payment",
    body: [
      "When you place an order, you are making an offer to purchase the product(s) in your cart. We reserve the right to accept or decline your order for any reason, including product availability or errors in pricing.",
      "Payment must be received in full before an order is processed and shipped.",
    ],
  },
  {
    heading: "Shipping & Delivery",
    body: [
      "Estimated delivery times are provided at checkout and are not guaranteed. We are not responsible for delays caused by circumstances outside our control, including courier delays or customs processing.",
    ],
  },
  {
    heading: "Returns & Refunds",
    body: [
      "If you're not completely satisfied with your purchase, please refer to our returns policy for eligibility and instructions. Refunds, where applicable, will be issued to your original payment method.",
    ],
  },
  {
    heading: "Intellectual Property",
    body: [
      "All content on this site — including text, graphics, logos, and images — is the property of the site owner and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our prior written permission.",
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of our site or products.",
    ],
  },
  {
    heading: "Governing Law",
    body: [
      "These terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.",
    ],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may revise these terms of service at any time. Continued use of the site after any changes constitutes your acceptance of the new terms.",
    ],
  },
];

export default async function TermsOfServicePage() {
  const settings = await getSiteSettings();
  const updatedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-section text-ink">Terms of Service</h1>
        <p className="mt-3 text-caption normal-case tracking-normal text-ink-muted">
          Last updated: {updatedDate}
        </p>
        <p className="mt-6 text-body text-ink-muted">
          These terms of service govern your use of the {settings.site_name} website and your
          purchase of products from us. Please read them carefully.
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
              If you have any questions about these terms, please contact us
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
