"use client";

import { BookingButton } from "./BookingButton";

export function MobileBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 p-3 backdrop-blur-md lg:hidden">
      <BookingButton className="w-full" />
    </div>
  );
}
