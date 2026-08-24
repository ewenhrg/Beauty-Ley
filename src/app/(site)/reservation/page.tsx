import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BookingModalFallback } from "@/components/booking/BookingModalFallback";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/booking/ui";
import { getStoreStatus } from "@/server/db";

export const metadata: Metadata = {
  title: "Réserver",
  description:
    "Réservez votre rendez-vous chez Beauty Ley à Hurghada : prestation, professionnelle, date et créneau en quelques étapes.",
};

export const dynamic = "force-dynamic";

export default function ReservationPage() {
  const status = getStoreStatus();

  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Réserver">
        <p>
          {status.ready
            ? "Choisissez votre prestation, votre professionnelle et votre créneau. Confirmation immédiate."
            : "Beauty & Wellness Studio à Hurghada. Contactez le studio pour convenir d'un rendez-vous."}
        </p>
      </PageHeader>

      <section className="relative">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="rounded-[2rem] border border-line bg-cream/70 px-5 py-8 shadow-soft sm:px-8 sm:py-10">
            {status.ready ? (
              <Suspense fallback={<FlowSkeleton />}>
                <BookingFlow />
              </Suspense>
            ) : (
              <BookingModalFallback reason={status.reason} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FlowSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}
