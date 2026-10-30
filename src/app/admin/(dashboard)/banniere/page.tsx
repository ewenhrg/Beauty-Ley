import { requirePage } from "@/server/access";
import { BannerEditor } from "@/components/admin/BannerEditor";
import { getBannerSettings, listBannerOffers } from "@/server/repo/banner";

export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  await requirePage("banniere");
  const [settings, offers] = await Promise.all([getBannerSettings(), listBannerOffers()]);

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Site
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Bannière</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Rédigez vos offres et activez la bannière défilante en haut du site. Seules les offres
          marquées actives apparaissent.
        </p>
      </header>

      <div className="mt-8">
        <BannerEditor enabled={settings.enabled} offers={offers} />
      </div>
    </div>
  );
}
