import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactSection } from "@/components/ContactSection";
import { SocialSection } from "@/components/SocialSection";
import { BookingCta } from "@/components/BookingCta";
import { getLocale, getT } from "@/i18n/server";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { seoCopy } from "@/i18n/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "contact");
}

export default async function ContactPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, "contact")} />
      <PageHeader eyebrow={seoCopy(locale).heroKicker} title={t("page.contact.title")}>
        <p>{t("page.contact.lead")}</p>
      </PageHeader>
      <ContactSection />
      <SocialSection />
      <BookingCta />
    </>
  );
}
