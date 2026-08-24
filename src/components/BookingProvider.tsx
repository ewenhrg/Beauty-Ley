"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { BookingModal } from "./BookingModal";

type BookingContextValue = {
  openBooking: () => void;
  closeBooking: () => void;
  /** True when online booking is configured; otherwise the social modal is used. */
  online: boolean;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  online = false,
}: {
  children: React.ReactNode;
  online?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      openBooking: () => setOpen(true),
      closeBooking: () => setOpen(false),
      online,
    }),
    [online],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal open={open} onClose={() => setOpen(false)} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
