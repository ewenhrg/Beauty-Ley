import type { Metadata } from "next";
import { ManageAppointment } from "@/components/booking/ManageAppointment";
import { PageHeader } from "@/components/PageHeader";
import { Notice } from "@/components/booking/ui";
import { BookingError, describeAppointment, loadForCustomer } from "@/server/booking";
import { getStoreStatus } from "@/server/db";
import type { AppointmentDto } from "@/lib/booking-types";
import { toAppointmentDto } from "@/server/presenters";

export const metadata: Metadata = {
  title: "Mon rendez-vous",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ t?: string }>;
};

type Loaded =
  | { ok: true; appointment: AppointmentDto; cancellationWindowHours: number }
  | { ok: false; message: string };

async function load(reference: string, token?: string): Promise<Loaded> {
  const status = getStoreStatus();
  if (!status.ready) return { ok: false, message: status.reason };
  if (!token) {
    return {
      ok: false,
      message:
        "Ce lien est incomplet. Utilisez le lien reçu par email pour accéder à votre rendez-vous.",
    };
  }

  try {
    const appointment = await loadForCustomer(reference, token);
    const described = await describeAppointment(appointment);
    if (!described.service || !described.staff || !described.customer) {
      return { ok: false, message: "Rendez-vous introuvable." };
    }
    return {
      ok: true,
      appointment: toAppointmentDto({
        appointment,
        service: described.service,
        staff: described.staff,
        customer: described.customer,
        settings: described.settings,
      }),
      cancellationWindowHours: described.settings.cancellation_window_hours,
    };
  } catch (error) {
    if (error instanceof BookingError) return { ok: false, message: error.message };
    throw error;
  }
}

export default async function AppointmentPage({ params, searchParams }: Props) {
  const [{ reference }, { t }] = await Promise.all([params, searchParams]);
  const result = await load(reference, t);

  return (
    <>
      <PageHeader eyebrow="Beauty Ley" title="Mon rendez-vous">
        <p>Consultez, déplacez ou annulez votre rendez-vous.</p>
      </PageHeader>
      <section className="relative">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
          {result.ok ? (
            <ManageAppointment
              appointment={result.appointment}
              token={t as string}
              cancellationWindowHours={result.cancellationWindowHours}
            />
          ) : (
            <Notice tone="error">{result.message}</Notice>
          )}
        </div>
      </section>
    </>
  );
}
