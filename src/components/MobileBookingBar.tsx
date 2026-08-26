"use client";

import { usePathname } from "next/navigation";
import { BookingButton } from "./BookingButton";

export function MobileBookingBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/reservation") || pathname.startsWith("/rendez-vous")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <BookingButton className="min-h-12 w-full" />
    </div>
  );
}
