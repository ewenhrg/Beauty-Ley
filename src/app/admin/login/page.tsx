import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";
import { firstAdminHref, getAdminSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
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
            Espace équipe
          </p>
          <h1 className="font-display mt-3 text-3xl text-ink">Administration</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Connectez-vous pour gérer le planning, les rendez-vous et le catalogue.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
