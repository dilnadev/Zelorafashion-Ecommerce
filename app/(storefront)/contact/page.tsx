import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "@/components/storefront/ContactForm";
import { PageBanner } from "@/components/storefront/PageBanner";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageBanner title="Contact Us" />

      <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
      <p className="mx-auto max-w-2xl text-center text-body-lg text-ink-muted">
        Have a question about an order, a product, or anything else? We&apos;d love to hear from
        you.
      </p>

      <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-[minmax(0,280px)_1fr] md:gap-16">
        <div className="space-y-8">
          {settings.business_address && (
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-caption uppercase tracking-[0.12em] text-ink-muted">Visit Us</p>
                <p className="mt-1.5 text-body text-ink">{settings.business_address}</p>
              </div>
            </div>
          )}
          {settings.contact_phone && (
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-caption uppercase tracking-[0.12em] text-ink-muted">Call Us</p>
                <a href={`tel:${settings.contact_phone}`} className="mt-1.5 block text-body text-ink hover:text-accent">
                  {settings.contact_phone}
                </a>
              </div>
            </div>
          )}
          {settings.contact_email && (
            <div className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-caption uppercase tracking-[0.12em] text-ink-muted">Email Us</p>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="mt-1.5 block text-body text-ink hover:text-accent"
                >
                  {settings.contact_email}
                </a>
              </div>
            </div>
          )}
        </div>

        <ContactForm />
      </div>
      </div>
    </div>
  );
}
