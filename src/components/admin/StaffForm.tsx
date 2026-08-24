"use client";

import { deleteStaffAction, saveStaffAction } from "@/app/admin/actions";
import type { ServiceCategoryRow, ServiceRow, StaffRow } from "@/server/db/types";
import { ActionForm, LabelledField, SubmitButton, adminInput, adminLabel } from "./ui";

export function StaffForm({
  member,
  categories,
  services,
  selectedServices,
}: {
  member?: StaffRow;
  categories: ServiceCategoryRow[];
  services: ServiceRow[];
  selectedServices: string[];
}) {
  return (
    <>
      <ActionForm action={saveStaffAction}>
        {member ? <input type="hidden" name="id" value={member.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Prénom">
            <input
              name="firstName"
              required
              defaultValue={member?.first_name ?? ""}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Nom">
            <input name="lastName" defaultValue={member?.last_name ?? ""} className={adminInput} />
          </LabelledField>
          <LabelledField label="Spécialité" className="sm:col-span-2">
            <input
              name="role"
              placeholder="Prothésiste ongulaire"
              defaultValue={member?.role ?? ""}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Description" className="sm:col-span-2">
            <textarea
              name="bio"
              rows={3}
              defaultValue={member?.bio ?? ""}
              className={`${adminInput} resize-y`}
            />
          </LabelledField>
          <LabelledField label="Photo (URL)">
            <input
              name="photo"
              placeholder="/images/equipe/sarah.jpg"
              defaultValue={member?.photo ?? ""}
              className={adminInput}
            />
          </LabelledField>
          <div className="grid grid-cols-2 gap-3">
            <LabelledField label="Couleur agenda">
              <input
                name="color"
                type="color"
                defaultValue={member?.color ?? "#c17a5c"}
                className={`${adminInput} h-11 p-1`}
              />
            </LabelledField>
            <LabelledField label="Ordre">
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={member?.sort_order ?? 0}
                className={adminInput}
              />
            </LabelledField>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
            <input
              type="checkbox"
              name="active"
              defaultChecked={member?.active ?? true}
              className="h-4 w-4 accent-[#c17a5c]"
            />
            Visible et réservable en ligne
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className={adminLabel}>Prestations réalisées</legend>
          <div className="mt-3 space-y-4">
            {categories.map((category) => {
              const list = services.filter((service) => service.category_id === category.id);
              if (!list.length) return null;
              return (
                <div key={category.id}>
                  <p className="text-[11px] tracking-[0.16em] text-ink-soft uppercase">
                    {category.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {list.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-2 text-sm text-ink"
                      >
                        <input
                          type="checkbox"
                          name="serviceIds"
                          value={service.id}
                          defaultChecked={selectedServices.includes(service.id)}
                          className="h-4 w-4 accent-[#c17a5c]"
                        />
                        {service.name}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>

        <SubmitButton className="mt-5">{member ? "Enregistrer" : "Ajouter"}</SubmitButton>
      </ActionForm>

      {member ? (
        <ActionForm action={deleteStaffAction} className="mt-5 border-t border-line pt-5">
          <input type="hidden" name="id" value={member.id} />
          <SubmitButton
            variant="danger"
            confirm="Supprimer ce membre ? Son planning et ses indisponibilités seront effacés."
          >
            Supprimer le profil
          </SubmitButton>
        </ActionForm>
      ) : null}
    </>
  );
}
