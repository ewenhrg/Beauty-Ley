"use client";

import { useState } from "react";
import {
  deleteCategoryAction,
  deleteServiceAction,
  saveCategoryAction,
  saveServiceAction,
} from "@/app/admin/actions";
import type { ServiceCategoryRow, ServiceRow } from "@/server/db/types";
import { formatDuration } from "@/lib/time";
import { ActionForm, LabelledField, Money, SubmitButton, adminInput, adminLabel } from "./ui";

type StaffOption = { id: string; name: string };

export function ServiceEditor({
  categories,
  services,
  staff,
  staffByService,
}: {
  categories: ServiceCategoryRow[];
  services: ServiceRow[];
  staff: StaffOption[];
  staffByService: Record<string, string[]>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Prestations</h2>
          <button
            type="button"
            onClick={() => {
              setCreating((value) => !value);
              setEditing(null);
            }}
            className="rounded-xl bg-terracotta px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] text-cream uppercase transition-colors hover:bg-rose"
          >
            {creating ? "Fermer" : "Nouvelle prestation"}
          </button>
        </div>

        {creating ? (
          <div className="step-in mb-4 rounded-[1.25rem] border border-line bg-white/70 p-5">
            <ServiceForm categories={categories} staff={staff} selectedStaff={[]} />
          </div>
        ) : null}

        <div className="space-y-6">
          {categories.map((category) => {
            const list = services.filter((service) => service.category_id === category.id);
            return (
              <div key={category.id}>
                <p className="text-[11px] tracking-[0.2em] text-rose uppercase">
                  {category.name}
                  {category.active ? "" : " · masquée"}
                </p>
                <div className="mt-2 space-y-2">
                  {list.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-line px-4 py-4 text-xs text-ink-soft">
                      Aucune prestation dans cette catégorie.
                    </p>
                  ) : null}
                  {list.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-[1.25rem] border border-line bg-white/70"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(editing === service.id ? null : service.id);
                          setCreating(false);
                        }}
                        className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3.5 text-left sm:px-5"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15px] text-ink">
                            {service.name}
                            {service.active ? "" : " · inactive"}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-soft">
                            {(staffByService[service.id] ?? [])
                              .map((id) => staff.find((member) => member.id === id)?.name)
                              .filter(Boolean)
                              .join(", ") || "Aucune professionnelle assignée"}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-4 text-xs text-ink-soft">
                          <span>{formatDuration(service.duration_min)}</span>
                          <span className="font-display text-base text-terracotta">
                            <Money value={service.price} />
                          </span>
                        </span>
                      </button>

                      {editing === service.id ? (
                        <div className="step-in border-t border-line p-5">
                          <ServiceForm
                            categories={categories}
                            staff={staff}
                            service={service}
                            selectedStaff={staffByService[service.id] ?? []}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">Catégories</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {categories.map((category) => (
            <div key={category.id} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
              <CategoryForm category={category} />
            </div>
          ))}
          <div className="rounded-[1.25rem] border border-dashed border-line bg-white/40 p-4">
            <p className={adminLabel}>Nouvelle catégorie</p>
            <div className="mt-3">
              <CategoryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceForm({
  categories,
  staff,
  service,
  selectedStaff,
}: {
  categories: ServiceCategoryRow[];
  staff: StaffOption[];
  service?: ServiceRow;
  selectedStaff: string[];
}) {
  return (
    <>
      <ActionForm action={saveServiceAction}>
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Nom" className="sm:col-span-2">
            <input name="name" required defaultValue={service?.name ?? ""} className={adminInput} />
          </LabelledField>
          <LabelledField label="Description" className="sm:col-span-2">
            <textarea
              name="description"
              rows={2}
              defaultValue={service?.description ?? ""}
              className={`${adminInput} resize-y`}
            />
          </LabelledField>
          <LabelledField label="Catégorie">
            <select
              name="categoryId"
              defaultValue={service?.category_id ?? categories[0]?.id}
              className={adminInput}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </LabelledField>
          <LabelledField label="Image (URL)">
            <input name="image" defaultValue={service?.image ?? ""} className={adminInput} />
          </LabelledField>
          <LabelledField label="Durée (min)">
            <input
              name="duration"
              type="number"
              min={5}
              max={600}
              step={5}
              required
              defaultValue={service?.duration_min ?? 60}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Battement après (min)">
            <input
              name="buffer"
              type="number"
              min={0}
              max={120}
              step={5}
              defaultValue={service?.buffer_min ?? 10}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Prix (EGP)">
            <input
              name="price"
              type="number"
              min={0}
              required
              defaultValue={service?.price ?? 0}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Affichage du prix">
            <select
              name="priceKind"
              defaultValue={service?.price_kind ?? "fixed"}
              className={adminInput}
            >
              <option value="fixed">Prix fixe</option>
              <option value="from">À partir de</option>
            </select>
          </LabelledField>
          <LabelledField label="Ordre d'affichage">
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={service?.sort_order ?? 0}
              className={adminInput}
            />
          </LabelledField>
          <label className="flex items-end gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="active"
              defaultChecked={service?.active ?? true}
              className="h-4 w-4 accent-[#c17a5c]"
            />
            Réservable en ligne
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className={adminLabel}>Professionnelles autorisées</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {staff.map((member) => (
              <label key={member.id} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="staffIds"
                  value={member.id}
                  defaultChecked={selectedStaff.includes(member.id)}
                  className="h-4 w-4 accent-[#c17a5c]"
                />
                {member.name}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Une prestation sans professionnelle assignée n&apos;apparaît pas à la réservation.
          </p>
        </fieldset>

        <SubmitButton className="mt-4">
          {service ? "Enregistrer" : "Créer la prestation"}
        </SubmitButton>
      </ActionForm>

      {service ? (
        <ActionForm action={deleteServiceAction} className="mt-4 border-t border-line pt-4">
          <input type="hidden" name="id" value={service.id} />
          <SubmitButton variant="danger" confirm="Supprimer définitivement cette prestation ?">
            Supprimer
          </SubmitButton>
        </ActionForm>
      ) : null}
    </>
  );
}

function CategoryForm({ category }: { category?: ServiceCategoryRow }) {
  return (
    <>
      <ActionForm action={saveCategoryAction}>
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <div className="grid gap-3">
          <LabelledField label="Nom">
            <input
              name="name"
              required
              defaultValue={category?.name ?? ""}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Description">
            <input
              name="description"
              defaultValue={category?.description ?? ""}
              className={adminInput}
            />
          </LabelledField>
          <div className="grid grid-cols-2 gap-3">
            <LabelledField label="Image (URL)">
              <input name="image" defaultValue={category?.image ?? ""} className={adminInput} />
            </LabelledField>
            <LabelledField label="Ordre">
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={category?.sort_order ?? 0}
                className={adminInput}
              />
            </LabelledField>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="active"
              defaultChecked={category?.active ?? true}
              className="h-4 w-4 accent-[#c17a5c]"
            />
            Visible
          </label>
        </div>
        <SubmitButton variant="ghost" className="mt-3">
          {category ? "Enregistrer" : "Créer"}
        </SubmitButton>
      </ActionForm>

      {category ? (
        <ActionForm action={deleteCategoryAction} className="mt-3">
          <input type="hidden" name="id" value={category.id} />
          <SubmitButton variant="danger" confirm="Supprimer cette catégorie ?">
            Supprimer
          </SubmitButton>
        </ActionForm>
      ) : null}
    </>
  );
}
