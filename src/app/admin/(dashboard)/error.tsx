"use client";

import { useEffect } from "react";
import { ActionButton, Notice } from "@/components/booking/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <Notice tone="error">
        {error.message?.includes("Supabase") || error.message?.includes("fetch")
          ? "La base Supabase est injoignable. Vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel."
          : "Une erreur a interrompu l'administration."}
      </Notice>
      {error.digest ? (
        <p className="mt-3 text-center text-xs text-ink-soft">Réf. {error.digest}</p>
      ) : null}
      <div className="mt-6 flex justify-center">
        <ActionButton variant="ghost" onClick={reset}>
          Réessayer
        </ActionButton>
      </div>
    </div>
  );
}
