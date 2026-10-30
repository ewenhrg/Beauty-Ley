"use client";

import { useState } from "react";
import {
  deleteFlyerOfferAction,
  saveFlyerEnabledAction,
  saveFlyerOfferAction,
} from "@/app/admin/actions";
import type { FlyerOfferRow } from "@/server/db/types";
import { ActionForm, LabelledField, SubmitButton, adminInput, adminLabel } from "./ui";

export function FlyerEditor({
  enabled,
  offers,
}: {
  enabled: boolean;
  offers: FlyerOfferRow[];
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-[1.25rem] border border-line bg-white/70 p-5">
        <ActionForm action={saveFlyerEnabledAction}>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={enabled}
              className="mt-0.5 h-4 w-4 accent-[#c17a5c]"
            />
            <span>
              <span className="block font-medium">Afficher le popup flyer à l&apos;arrivée</span>
              <span className="mt-1 block text-xs text-ink-soft">
                À chaque visite, le client voit les flyers actifs et peut les faire défiler, puis
                fermer avec la croix.
              </span>
            </span>
          </label>
          <SubmitButton className="mt-4">Enregistrer l&apos;affichage</SubmitButton>
        </ActionForm>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Flyers</h2>
          <button
            type="button"
            onClick={() => {
              setCreating((value) => !value);
              setEditing(null);
            }}
            className="rounded-xl bg-terracotta px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] text-cream uppercase transition-colors hover:bg-rose"
          >
            {creating ? "Fermer" : "Nouveau flyer"}
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
              Aucun flyer. Ajoutez une photo (URL) et une description pour l&apos;afficher au client.
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
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left sm:px-5"
              >
                {offer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blush/40 text-xs text-ink-soft">
                    —
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-[15px] text-ink">
                    {offer.description || "Sans description"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    {offer.active ? "Actif" : "Inactif"} · ordre {offer.sort_order}
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

function OfferForm({ offer, sortOrder = 0 }: { offer?: FlyerOfferRow; sortOrder?: number }) {
  return (
    <>
      <ActionForm action={saveFlyerOfferAction}>
        {offer ? <input type="hidden" name="id" value={offer.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Photo (URL)" className="sm:col-span-2">
            <input
              name="image"
              required
              defaultValue={offer?.image ?? ""}
              placeholder="https://…"
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Description" className="sm:col-span-2">
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={offer?.description ?? ""}
              placeholder="Texte affiché sous la photo"
              className={`${adminInput} resize-y`}
            />
          </LabelledField>
          <LabelledField label="Ordre">
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
            Actif dans le popup
          </label>
        </div>
        <p className={`mt-2 ${adminLabel}`}>
          Astuce : hébergez l&apos;image (Imgur, Cloudinary, etc.) puis collez l&apos;URL ici.
        </p>
        <SubmitButton className="mt-4">{offer ? "Enregistrer" : "Ajouter le flyer"}</SubmitButton>
      </ActionForm>

      {offer ? (
        <ActionForm action={deleteFlyerOfferAction} className="mt-4 border-t border-line pt-4">
          <input type="hidden" name="id" value={offer.id} />
          <SubmitButton variant="danger" confirm="Supprimer ce flyer ?">
            Supprimer
          </SubmitButton>
        </ActionForm>
      ) : null}
    </>
  );
}
