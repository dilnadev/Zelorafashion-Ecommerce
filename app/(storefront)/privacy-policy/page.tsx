import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const SECTIONS = [
  {
    heading: "Information We Collect",
    body: [
      "When you browse our site, create an account, or place an order, we collect information such as your name, email address, shipping and billing address, phone number, and payment details.",
      "We also automatically collect certain information about your device and how you interact with our site, including your IP address, browser type, pages viewed, and referring URLs, to help us improve your experience.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "We use the information we collect to process and fulfil your orders, communicate with you about your account or purchases, provide customer support, and send you updates about new arrivals and offers if you've opted in.",
      "We may also use this information to improve our products, services, and website, and to detect and prevent fraud or abuse.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember items in your cart, and understand how our site is used. You can control cookies through your browser settings, though disabling them may affect your shopping experience.",
    ],
  },
  {
    heading: "Sharing Your Information",
    body: [
      "We do not sell your personal information. We share it only with trusted third parties who help us operate our business — such as payment processors, shipping carriers, and analytics providers — and only to the extent necessary for them to perform their services.",
    ],
  },
  {
    heading: "Data Security",
    body: [
      "We take reasonable technical and organisational measures to protect your personal information from unauthorised access, loss, or misuse. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "You have the right to access, correct, or delete the personal information we hold about you, and to opt out of marketing communications at any time. To exercise these rights, please contact us using the details below.",
    ],
  },
  {
    heading: "Children's Privacy",
    body: [
      "Our site is not directed to children under 13, and we do not knowingly collect personal information from children.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.",
    ],
  },
];

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const updatedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-section text-ink">Privacy Policy</h1>
        <p className="mt-3 text-caption normal-case tracking-normal text-ink-muted">
          Last updated: {updatedDate}
        </p>
        <p className="mt-6 text-body text-ink-muted">
          This privacy policy describes how {settings.site_name} collects, uses, and protects your
          personal information when you visit or make a purchase from our site.
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
              If you have any questions about this privacy policy or how we handle your
              information, please contact us
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
