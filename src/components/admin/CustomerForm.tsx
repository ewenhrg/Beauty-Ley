"use client";

import { deleteCustomerAction, updateCustomerAction } from "@/app/admin/actions";
import type { CustomerRow } from "@/server/db/types";
import { ActionForm, LabelledField, SubmitButton, adminInput } from "./ui";

export function CustomerForm({ customer }: { customer: CustomerRow }) {
  return (
    <div>
      <ActionForm action={updateCustomerAction}>
        <input type="hidden" name="id" value={customer.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Prénom">
            <input
              name="firstName"
              defaultValue={customer.first_name}
              required
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Nom">
            <input
              name="lastName"
              defaultValue={customer.last_name}
              required
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Téléphone">
            <input name="phone" defaultValue={customer.phone} required className={adminInput} />
          </LabelledField>
          <LabelledField label="Email">
            <input
              name="email"
              type="email"
              defaultValue={customer.email ?? ""}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Notes internes" className="sm:col-span-2">
            <textarea
              name="notes"
              rows={4}
              defaultValue={customer.notes ?? ""}
              placeholder="Allergies, préférences, couleur utilisée…"
              className={`${adminInput} resize-y`}
            />
          </LabelledField>
        </div>
        <SubmitButton className="mt-4">Enregistrer</SubmitButton>
      </ActionForm>

      <ActionForm action={deleteCustomerAction} className="mt-6 border-t border-line pt-5">
        <input type="hidden" name="id" value={customer.id} />
        <SubmitButton
          variant="danger"
          confirm="Supprimer cette fiche cliente ? Ses rendez-vous resteront dans l'historique mais sans coordonnées."
        >
          Supprimer la fiche
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
