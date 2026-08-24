import {
  BookingSettingsForm,
  BusinessHoursForm,
  ClosuresForm,
  NotificationStatus,
} from "@/components/admin/SettingsForms";
import { Card } from "@/components/admin/ui";
import { getStoreStatus } from "@/server/db";
import { listNotifications, notificationStatus } from "@/server/notifications";
import { availablePaymentModes, isStripeConfigured } from "@/server/payments";
import { listBusinessHours, listClosures } from "@/server/repo/schedule";
import { getSettings } from "@/server/repo/settings";
import { SALON_TZ } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, hours, closures, notifications] = await Promise.all([
    getSettings(),
    listBusinessHours(),
    listClosures(),
    listNotifications(15),
  ]);
  const status = getStoreStatus();

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Configuration
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Paramètres</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Fuseau horaire du studio : {SALON_TZ} · Base de données :{" "}
          {status.ready ? status.driver : "non configurée"}
        </p>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Horaires d'ouverture">
          <BusinessHoursForm hours={hours} />
        </Card>

        <Card title="Règles de réservation">
          <BookingSettingsForm
            settings={settings}
            paymentModes={availablePaymentModes()}
            stripeConfigured={isStripeConfigured()}
          />
        </Card>

        <Card title="Fermetures et jours fériés">
          <ClosuresForm closures={closures} />
        </Card>

        <Card title="Notifications">
          <NotificationStatus channels={notificationStatus()} />

          <div className="mt-6">
            <p className="text-[10px] tracking-[0.2em] text-rose uppercase">Derniers messages</p>
            <div className="mt-2 space-y-1.5">
              {notifications.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-4 py-4 text-xs text-ink-soft">
                  Aucun message envoyé pour l&apos;instant.
                </p>
              ) : null}
              {notifications.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white/60 px-3.5 py-2.5 text-xs"
                >
                  <span className="text-ink">
                    {row.kind} → {row.recipient}
                  </span>
                  <span
                    className={
                      row.status === "sent"
                        ? "text-gold-deep"
                        : row.status === "failed"
                          ? "text-rose"
                          : "text-ink-soft"
                    }
                  >
                    {row.status}
                    {row.error ? ` · ${row.error}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
