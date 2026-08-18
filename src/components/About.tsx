import { Reveal } from "./Reveal";

export function About() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="relative pb-10 sm:pb-12">
          <picture>
            <source srcSet="/images/salon/reception.webp" type="image/webp" />
            <img
              src="/images/salon/reception.jpg"
              alt="Espace d’accueil de Beauty Ley, Hurghada"
              className="aspect-4/5 w-full rounded-[2rem] object-cover"
              loading="lazy"
            />
          </picture>
          <div className="absolute right-4 -bottom-8 hidden w-36 overflow-hidden rounded-[1.5rem] shadow-soft sm:block lg:right-6 lg:w-44">
            <picture>
              <source srcSet="/images/work/hair-balayage.webp" type="image/webp" />
              <img
                src="/images/work/hair-balayage.jpg"
                alt="Réalisation cheveux Beauty Ley"
                className="aspect-3/4 w-full object-cover"
                loading="lazy"
              />
            </picture>
          </div>
        </div>
        <div className="relative z-10 pt-10 lg:pt-0 lg:pl-4">
          <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
            Le studio
          </Reveal>
          <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
            Beauty Ley
          </Reveal>
          <Reveal delay={140} className="gold-rule mt-6" />
          <Reveal
            as="p"
            delay={180}
            className="mt-8 max-w-md text-base leading-8 text-ink-soft"
          >
            Beauty & Wellness Studio à Hurghada. Cheveux, ongles, cils, sourcils,
            maquillage permanent, épilation et soins du corps.
          </Reveal>
          <dl className="mt-10 grid max-w-md grid-cols-2 gap-x-6 gap-y-8">
            <Reveal as="div" delay={240}>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">Lieu</dt>
              <dd className="mt-2 font-display text-2xl">Hurghada</dd>
            </Reveal>
            <Reveal as="div" delay={300}>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">Studio</dt>
              <dd className="mt-2 font-display text-2xl">Beauté & Wellness</dd>
            </Reveal>
          </dl>
        </div>
      </div>
    </section>
  );
}
