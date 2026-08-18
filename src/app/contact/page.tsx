import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactSection } from "@/components/ContactSection";
import { SocialSection } from "@/components/SocialSection";
import { BookingCta } from "@/components/BookingCta";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter Beauty Ley à Hurghada. Réservation via Instagram, Facebook et Snapchat.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Contact">
        <p>Beauty & Wellness Studio à Hurghada. Réservation via les réseaux officiels.</p>
      </PageHeader>
      <ContactSection />
      <SocialSection />
      <BookingCta />
    </>
  );
}
