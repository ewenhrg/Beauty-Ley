"use client";

import { login } from "@/app/admin/actions";
import { ActionForm, SubmitButton, adminInput, adminLabel } from "./ui";

export function LoginForm({ configured }: { configured: boolean }) {
  if (!configured) {
    return (
      <p className="rounded-xl bg-rose/12 px-4 py-3.5 text-sm leading-relaxed text-rose">
        L&apos;administration n&apos;est pas encore activée. Définissez la variable
        d&apos;environnement <code className="tracking-wide">ADMIN_PASSWORD</code> sur le serveur,
        puis rechargez cette page.
      </p>
    );
  }

  return (
    <ActionForm action={login}>
      <label className="block">
        <span className={adminLabel}>Mot de passe</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={`${adminInput} mt-1.5`}
        />
      </label>
      <SubmitButton className="mt-5 w-full">Se connecter</SubmitButton>
    </ActionForm>
  );
}
