"use client";

import { useState } from "react";
import {
  deleteBannerOfferAction,
  saveBannerEnabledAction,
  saveBannerOfferAction,
} from "@/app/admin/actions";
import type { BannerOfferRow } from "@/server/db/types";
import { ActionForm, LabelledField, SubmitButton, adminInput, adminLabel } from "./ui";

export function BannerEditor({
  enabled,
  offers,
}: {
  enabled: boolean;
  offers: BannerOfferRow[];
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-[1.25rem] border border-line bg-white/70 p-5">
        <ActionForm action={saveBannerEnabledAction}>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={enabled}
              className="mt-0.5 h-4 w-4 accent-[#c17a5c]"
            />
            <span>
              <span className="block font-medium">Afficher la bannière sur le site</span>
              <span className="mt-1 block text-xs text-ink-soft">
                Les offres actives défilent en haut de toutes les pages publiques.
              </span>
            </span>
          </label>
          <SubmitButton className="mt-4">Enregistrer l&apos;affichage</SubmitButton>
        </ActionForm>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Offres</h2>
          <button
            type="button"
            onClick={() => {
              setCreating((value) => !value);
              setEditing(null);
            }}
            className="rounded-xl bg-terracotta px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] text-cream uppercase transition-colors hover:bg-rose"
          >
            {creating ? "Fermer" : "Nouvelle offre"}
          </button>
        </div>

        {creating ? (
          <div className="step-in mb-4 rounded-[1.25rem] border border-line bg-white/70 p-5">
            <OfferForm sortOrder={offers.length} />
          </div>
        ) : null}

        <div className="space-y-2">
          {offers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-ink-soft">
              Aucune offre pour l&apos;instant. Ajoutez un texte promotionnel pour le faire défiler
              sur le site.
            </p>
          ) : null}

          {offers.map((offer) => (
            <div key={offer.id} className="rounded-[1.25rem] border border-line bg-white/70">
              <button
                type="button"
                onClick={() => {
                  setEditing(editing === offer.id ? null : offer.id);
                  setCreating(false);
                }}
                className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3.5 text-left sm:px-5"
              >
                <span className="min-w-0">
                  <span className="block text-[15px] text-ink">{offer.message}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    {offer.active ? "Active" : "Inactive"} · ordre {offer.sort_order}
                  </span>
                </span>
              </button>

              {editing === offer.id ? (
                <div className="step-in border-t border-line p-5">
                  <OfferForm offer={offer} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OfferForm({ offer, sortOrder = 0 }: { offer?: BannerOfferRow; sortOrder?: number }) {
  return (
    <>
      <ActionForm action={saveBannerOfferAction}>
        {offer ? <input type="hidden" name="id" value={offer.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Texte de l'offre" className="sm:col-span-2">
            <input
              name="message"
              required
              maxLength={160}
              defaultValue={offer?.message ?? ""}
              placeholder="Ex. -20 % sur la manucure ce week-end"
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Ordre d'affichage">
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={offer?.sort_order ?? sortOrder}
              className={adminInput}
            />
          </LabelledField>
          <label className="flex items-end gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="active"
              defaultChecked={offer?.active ?? true}
              className="h-4 w-4 accent-[#c17a5c]"
            />
            Active dans la bannière
          </label>
        </div>
        <p className={`mt-2 ${adminLabel}`}>
          Conseil : gardez un message court pour une lecture confortable en défilement.
        </p>
        <SubmitButton className="mt-4">{offer ? "Enregistrer" : "Ajouter l'offre"}</SubmitButton>
      </ActionForm>

      {offer ? (
        <ActionForm action={deleteBannerOfferAction} className="mt-4 border-t border-line pt-4">
          <input type="hidden" name="id" value={offer.id} />
          <SubmitButton variant="danger" confirm="Supprimer cette offre ?">
            Supprimer
          </SubmitButton>
        </ActionForm>
      ) : null}
    </>
  );
}
