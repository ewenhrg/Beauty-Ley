"use client";

import { deleteUserAction, saveUserAction } from "@/app/admin/actions";
import { ADMIN_NAV, type AdminPageId } from "@/server/admin-pages";
import { ActionForm, LabelledField, SubmitButton, adminInput, adminLabel } from "./ui";

export type UserEditorValue = {
  id: string;
  username: string;
  display_name: string;
  pages: AdminPageId[];
  staff_id: string | null;
  own_agenda: boolean;
  active: boolean;
};

export function UserForm({
  user,
  staff,
  ntfy,
}: {
  user?: UserEditorValue;
  staff: Array<{ id: string; name: string }>;
  ntfy?: { topic: string; url: string } | null;
}) {
  return (
    <>
      <ActionForm action={saveUserAction}>
        {user ? <input type="hidden" name="id" value={user.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelledField label="Identifiant">
            <input
              name="username"
              required
              autoComplete="off"
              defaultValue={user?.username ?? ""}
              placeholder="sara"
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Nom affiché">
            <input
              name="displayName"
              required
              defaultValue={user?.display_name ?? ""}
              placeholder="Sara"
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label={user ? "Nouveau mot de passe" : "Mot de passe"} className="sm:col-span-2">
            <input
              name="password"
              type="password"
              required={!user}
              autoComplete="new-password"
              placeholder={user ? "Laisser vide pour ne pas changer" : ""}
              className={adminInput}
            />
          </LabelledField>
          <LabelledField label="Personne (équipe)" className="sm:col-span-2">
            <select name="staffId" required defaultValue={user?.staff_id ?? ""} className={adminInput}>
              <option value="" disabled>
                Choisir qui est ce compte
              </option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </LabelledField>
        </div>

        <fieldset className="mt-5">
          <legend className={adminLabel}>Pages visibles</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ADMIN_NAV.filter((item) => item.id !== "comptes").map((item) => (
              <label key={item.id} className="flex min-h-11 items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="pages"
                  value={item.id}
                  defaultChecked={
                    user
                      ? user.pages.includes(item.id)
                      : item.id === "calendrier" || item.id === "rendez-vous"
                  }
                  className="h-4 w-4 accent-[#c17a5c]"
                />
                {item.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Décochez ce que cette personne ne doit pas voir. Les comptes restent réservés à
            l&apos;administrateur.
          </p>
        </fieldset>

        <label className="mt-4 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="ownAgenda"
            defaultChecked={user?.own_agenda ?? true}
            className="h-4 w-4 accent-[#c17a5c]"
          />
          Voir uniquement son planning
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={user?.active ?? true}
            className="h-4 w-4 accent-[#c17a5c]"
          />
          Compte actif
        </label>

        <SubmitButton className="mt-5">{user ? "Enregistrer" : "Créer le compte"}</SubmitButton>
      </ActionForm>

      {ntfy ? (
        <div className="mt-5 rounded-xl border border-terracotta/30 bg-blush/20 px-4 py-4 text-sm leading-relaxed text-ink">
          <p className="text-[10px] tracking-[0.2em] text-rose uppercase">Son téléphone</p>
          <p className="mt-2">
            Cette personne s&apos;abonne dans l&apos;app ntfy au sujet{" "}
            <code className="break-all text-xs">{ntfy.topic}</code>
            . Elle ne reçoit une alerte que lorsque vous lui attribuez un rendez-vous.
          </p>
          <a
            href={ntfy.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-[10px] tracking-[0.18em] text-terracotta uppercase"
          >
            Ouvrir le sujet ntfy
          </a>
        </div>
      ) : null}

      {user ? (
        <ActionForm action={deleteUserAction} className="mt-5 border-t border-line pt-5">
          <input type="hidden" name="id" value={user.id} />
          <SubmitButton variant="danger" confirm="Supprimer ce compte ? La personne ne pourra plus se connecter.">
            Supprimer le compte
          </SubmitButton>
        </ActionForm>
      ) : null}
    </>
  );
}
