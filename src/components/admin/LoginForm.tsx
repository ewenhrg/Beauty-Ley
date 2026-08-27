"use client";

import { login } from "@/app/admin/actions";
import { ActionForm, SubmitButton, adminInput, adminLabel } from "./ui";
import { useT } from "@/i18n/I18nProvider";

export function LoginForm() {
  const t = useT();
  return (
    <ActionForm action={login}>
      <label className="block">
        <span className={adminLabel}>{t("admin.login.username")}</span>
        <input
          name="username"
          autoComplete="username"
          placeholder="admin"
          className={`${adminInput} mt-1.5`}
        />
      </label>
      <label className="mt-4 block">
        <span className={adminLabel}>{t("admin.login.password")}</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={`${adminInput} mt-1.5`}
        />
      </label>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t("admin.login.hint")}</p>
      <SubmitButton className="mt-5 w-full">{t("admin.login.submit")}</SubmitButton>
    </ActionForm>
  );
}
