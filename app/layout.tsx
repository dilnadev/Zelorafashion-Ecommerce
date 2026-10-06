import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AnalyticsScripts } from "@/components/providers/AnalyticsScripts";
import { getSiteSettings } from "@/lib/site-settings";
import { getSeoSettingsRow } from "@/lib/queries/admin-settings";
import { createPublicClient } from "@/lib/supabase/public";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const publicClient = createPublicClient();
  const [siteSettings, seoSettings] = await Promise.all([
    getSiteSettings(publicClient),
    getSeoSettingsRow(publicClient),
  ]);
  const template = (seoSettings?.meta_title_template ?? "{Page Title} | {Site Name}").replace(
    "{Site Name}",
    siteSettings.site_name
  );

  return {
    title: {
      template: template.replace("{Page Title}", "%s"),
      default: siteSettings.site_name,
    },
    description: seoSettings?.default_meta_description ?? siteSettings.tagline ?? "A premium shopping experience.",
    icons: siteSettings.favicon_url ? { icon: siteSettings.favicon_url } : undefined,
    other: seoSettings?.search_console_meta ? { "google-site-verification": seoSettings.search_console_meta } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoSettings = await getSeoSettingsRow(createPublicClient());

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} bg-bg font-sans text-ink antialiased`}
      >
        <AnalyticsScripts
          gaTrackingId={seoSettings?.ga_tracking_id ?? null}
          fbPixelId={seoSettings?.fb_pixel_id ?? null}
        />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
