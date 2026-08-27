import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";
import { firstAdminHref, getAdminSession } from "@/server/auth";
import { getT } from "@/i18n/server";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("admin.login.title"),
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const t = await getT();
  const session = await getAdminSession();
  if (session) redirect(firstAdminHref(session));

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-10 rounded-[1.75rem] border border-line bg-white/70 p-7 shadow-soft">
          <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
            {t("admin.login.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-3xl text-ink">{t("admin.login.title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("admin.login.lead")}</p>

          <div className="mt-7">
            <LoginForm />
          </div>
          <div className="mt-6 flex justify-center">
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>
    </main>
  );
}
