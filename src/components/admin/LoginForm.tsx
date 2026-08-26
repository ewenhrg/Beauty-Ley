"use client";

import { login } from "@/app/admin/actions";
import { ActionForm, SubmitButton, adminInput, adminLabel } from "./ui";

export function LoginForm() {
  return (
    <ActionForm action={login}>
      <label className="block">
        <span className={adminLabel}>Identifiant</span>
        <input
          name="username"
          autoComplete="username"
          placeholder="admin"
          className={`${adminInput} mt-1.5`}
        />
      </label>
      <label className="mt-4 block">
        <span className={adminLabel}>Mot de passe</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={`${adminInput} mt-1.5`}
        />
      </label>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        Compte studio : identifiant <code>admin</code> et le mot de passe administrateur. Les
        membres de l&apos;équipe utilisent l&apos;identifiant créé pour eux.
      </p>
      <SubmitButton className="mt-5 w-full">Se connecter</SubmitButton>
    </ActionForm>
  );
}
