import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactSection } from "@/components/ContactSection";
import { SocialSection } from "@/components/SocialSection";
import { BookingCta } from "@/components/BookingCta";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("page.contact.title"), description: t("page.contact.meta") };
}

export default async function ContactPage() {
  const t = await getT();
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title={t("page.contact.title")}>
        <p>{t("page.contact.lead")}</p>
      </PageHeader>
      <ContactSection />
      <SocialSection />
      <BookingCta />
    </>
  );
}
