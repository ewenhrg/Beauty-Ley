import { salon } from "@/data/salon";
import { InstagramIcon, FacebookIcon, SnapchatIcon } from "./SocialIcons";
import { Reveal } from "./Reveal";

export function SocialSection() {
  const networks = [
    { ...salon.social.instagram, icon: InstagramIcon, tone: "bg-blush/40" },
    { ...salon.social.snapchat, icon: SnapchatIcon, tone: "bg-gold/20" },
    { ...salon.social.facebook, icon: FacebookIcon, tone: "bg-rose/15" },
  ];

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Suivez Beauty Ley
        </Reveal>
        <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
          Réseaux sociaux
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {networks.map((network, index) => (
            <Reveal as="li" key={network.label} delay={160 + index * 90}>
              <a
                href={network.href}
                target="_blank"
                rel="noreferrer"
                className={`hover-lift group flex h-full flex-col justify-between rounded-[1.75rem] ${network.tone} px-6 py-8 ring-1 ring-transparent transition-[box-shadow,transform,background-color] hover:ring-gold/50`}
              >
                <network.icon className="h-5 w-5 text-terracotta transition-transform duration-300 group-hover:scale-110" />
                <div className="mt-10">
                  <p className="text-[11px] tracking-[0.22em] text-rose uppercase">{network.label}</p>
                  <p className="mt-2 font-display text-2xl">{network.handle}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
