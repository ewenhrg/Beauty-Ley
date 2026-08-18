"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { BookingModal } from "./BookingModal";

type BookingContextValue = {
  openBooking: () => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      openBooking: () => setOpen(true),
      closeBooking: () => setOpen(false),
    }),
    [],
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
