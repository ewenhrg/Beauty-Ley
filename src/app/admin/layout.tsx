import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/I18nProvider";
import { messagesFor } from "@/i18n/t";
import { catalogFor } from "@/i18n/catalog";
import { LOCALE_META } from "@/i18n/config";
import { getAdminLocale } from "@/i18n/server-admin";
import { getSiteUrl } from "@/lib/site";
import { cormorant, outfit } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Admin · Beauty Ley", template: "%s · Admin Beauty Ley" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  return (
    <html lang={LOCALE_META[locale].html} className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <I18nProvider locale={locale} messages={messagesFor(locale)} catalog={catalogFor(locale)}>{children}</I18nProvider>
      </body>
    </html>
  );
}
