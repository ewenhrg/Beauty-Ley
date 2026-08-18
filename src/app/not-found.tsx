import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-5 pt-24 text-center">
      <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
        Beauty Ley
      </Reveal>
      <Reveal as="h1" delay={80} className="font-display mt-4 text-5xl">
        Page introuvable
      </Reveal>
      <Reveal delay={160}>
        <Link
          href="/"
          className="nav-link mt-8 inline-block text-[11px] tracking-[0.22em] text-rose uppercase transition-colors hover:text-terracotta"
        >
          Retour à l’accueil
        </Link>
      </Reveal>
    </section>
  );
}
