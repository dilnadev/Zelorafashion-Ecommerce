import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings } from "@/lib/site-settings";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { PageBanner } from "@/components/storefront/PageBanner";

const FAQS = [
  {
    question: "How do I place an order?",
    answer:
      "Browse our collections, add your chosen pieces to your bag, and proceed to checkout. You'll be asked for your shipping details and payment information to complete the order.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, UPI, net banking, and popular wallets through our secure checkout partner.",
  },
  {
    question: "Can I modify or cancel my order after it has been placed?",
    answer:
      "If your order hasn't shipped yet, we're happy to help with changes or cancellations. Contact us as soon as possible using the form below and we'll do our best to accommodate your request.",
  },
  {
    question: "What are your shipping options and how much do they cost?",
    answer:
      "We offer standard shipping across India, with free shipping on orders over ₹2,000. Shipping costs for smaller orders are calculated at checkout based on your location.",
  },
  {
    question: "How long will it take to receive my order?",
    answer:
      "Most orders arrive within 3–7 business days, depending on your location. You'll receive a tracking link by email as soon as your order ships.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of delivery, provided items are unworn, unwashed, and in their original packaging. Reach out to our team to start a return.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "At this time we ship within India only. We're working on expanding to more countries soon — follow us or subscribe to our newsletter for updates.",
  },
];

export const metadata: Metadata = {
  title: "About Us",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageBanner title="About Us" breadcrumbLabel="About" />

      <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
      <div className="mx-auto grid max-w-4xl items-start gap-10 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1791184587791-Golden-Elegance_-Layered-Jewelry-and-Ring.png"
            alt={settings.site_name}
            fill
            className="object-cover object-left"
            sizes="(min-width: 768px) 400px, 100vw"
          />
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-xl text-ink">Who We Are</h2>
            <p className="mt-3 text-body text-ink-muted">
              {settings.site_name} is a modern women&apos;s fashion destination, built for those
              who value quality over quantity. Every piece in our collection is chosen with care —
              considered silhouettes, refined details, and fabrics that are made to last. We
              believe getting dressed should feel effortless, and that true style never goes out of
              fashion.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink">What We Stand For</h2>
            <p className="mt-3 text-body text-ink-muted">
              Minimalism, craftsmanship, and confidence. We work with a close circle of makers and
              partners who share our commitment to quality, and we hold every piece to the same
              standard before it reaches you. No fast fashion, no fleeting trends — just pieces
              designed to become part of your everyday wardrobe for years to come.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink">Get in Touch</h2>
            <p className="mt-3 text-body text-ink-muted">
              Have a question about an order, a product, or anything else? Our team is always
              happy to help.
              {settings.contact_email && (
                <>
                  {" "}
                  Reach us anytime at{" "}
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-accent underline underline-offset-4"
                  >
                    {settings.contact_email}
                  </a>
                  .
                </>
              )}
            </p>
          </section>
        </div>
      </div>

      <div className="relative left-1/2 right-1/2 mt-20 aspect-[3/2] w-screen -translate-x-1/2 overflow-hidden md:aspect-[4/1]">
        <Image
          src="https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1791187997072-Pearl-and-Gold-Shell-Earrings-Flatlay-(2).png"
          alt="Pearl and gold jewellery"
          fill
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
      </div>

      <div id="faq" className="mx-auto mt-20 max-w-2xl scroll-mt-24">
        <h2 className="font-serif text-section text-ink">Frequently Asked Questions</h2>
        <div className="mt-8">
          <Accordion>
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                id={`faq-${i}`}
                title={faq.question}
                titleClassName="font-serif text-lg normal-case tracking-normal"
              >
                {faq.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      </div>
    </div>
  );
}
