import { requirePage } from "@/server/access";
import { FlyerEditor } from "@/components/admin/FlyerEditor";
import { getFlyerSettings, listFlyerOffers } from "@/server/repo/flyers";

export const dynamic = "force-dynamic";

export default async function AdminFlyersPage() {
  await requirePage("flyers");
  const [settings, offers] = await Promise.all([getFlyerSettings(), listFlyerOffers()]);

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Site
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Flyer offre</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Ajoutez des photos + descriptions. Quand le popup est activé, chaque visite ouvre ces
          flyers à l&apos;écran : le client fait défiler et ferme avec la croix.
        </p>
      </header>

      <div className="mt-8">
        <FlyerEditor enabled={settings.enabled} offers={offers} />
      </div>
    </div>
  );
}
