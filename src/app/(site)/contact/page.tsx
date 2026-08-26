import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactSection } from "@/components/ContactSection";
import { SocialSection } from "@/components/SocialSection";
import { BookingCta } from "@/components/BookingCta";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter Beauty Ley à Hurghada. Réservation en ligne ou via Instagram, Facebook et Snapchat.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Contact">
        <p>Beauty & Wellness Studio à Hurghada. Réservez en ligne ou via les réseaux officiels.</p>
      </PageHeader>
      <ContactSection />
      <SocialSection />
      <BookingCta />
    </>
  );
}
