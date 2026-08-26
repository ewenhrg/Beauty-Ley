"use client";

import { useMemo, useState } from "react";
import { createAppointmentAction } from "@/app/admin/actions";
import { ActionForm, LabelledField, SubmitButton, adminInput } from "./ui";

type ServiceOption = { id: string; name: string; categoryName: string; staffIds: string[] };

export function NewAppointmentForm({
  services,
  staff,
  defaultDate,
  lockedStaffId,
}: {
  services: ServiceOption[];
  staff: Array<{ id: string; name: string }>;
  defaultDate: string;
  lockedStaffId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");

  const eligibleStaff = useMemo(() => {
    const service = services.find((item) => item.id === serviceId);
    if (!service) return staff;
    return staff.filter((member) => service.staffIds.includes(member.id));
  }, [serviceId, services, staff]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] text-cream uppercase transition-colors hover:bg-rose sm:w-auto"
      >
        Nouveau rendez-vous
      </button>
    );
  }

  return (
    <div className="step-in w-full rounded-[1.25rem] border border-line bg-white/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg text-ink">Nouveau rendez-vous</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[10px] tracking-[0.18em] text-ink-soft uppercase hover:text-ink"
        >
          Fermer
        </button>
      </div>

      <ActionForm action={createAppointmentAction}>
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Prestation" className="sm:col-span-2">
            <select
              name="serviceId"
              required
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className={adminInput}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.categoryName} — {service.name}
                </option>
              ))}
            </select>
          </LabelledField>

          <LabelledField label="Professionnelle">
            {lockedStaffId ? (
              <input type="hidden" name="staffId" value={lockedStaffId} />
            ) : null}
            <select
              name={lockedStaffId ? undefined : "staffId"}
              className={adminInput}
              defaultValue={lockedStaffId ?? ""}
              disabled={Boolean(lockedStaffId)}
            >
              {lockedStaffId ? null : <option value="">Première disponible</option>}
              {eligibleStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </LabelledField>

          <div className="grid grid-cols-2 gap-3">
            <LabelledField label="Date">
              <input
                type="date"
                name="date"
                required
                defaultValue={defaultDate}
                className={adminInput}
              />
            </LabelledField>
            <LabelledField label="Heure">
              <input type="time" name="time" required step={300} className={adminInput} />
            </LabelledField>
          </div>

          <LabelledField label="Prénom">
            <input name="firstName" required className={adminInput} />
          </LabelledField>
          <LabelledField label="Nom">
            <input name="lastName" required className={adminInput} />
          </LabelledField>
          <LabelledField label="Téléphone">
            <input name="phone" required type="tel" className={adminInput} />
          </LabelledField>
          <LabelledField label="Email">
            <input name="email" type="email" className={adminInput} />
          </LabelledField>
          <LabelledField label="Note" className="sm:col-span-2">
            <textarea name="note" rows={2} className={`${adminInput} resize-y`} />
          </LabelledField>
        </div>

        <p className="mt-3 text-xs text-ink-soft">
          Le créneau est vérifié côté serveur : un chevauchement avec un rendez-vous existant sera
          refusé.
        </p>
        <SubmitButton className="mt-4">Créer le rendez-vous</SubmitButton>
      </ActionForm>
    </div>
  );
}
