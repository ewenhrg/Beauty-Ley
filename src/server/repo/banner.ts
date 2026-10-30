import { getStore } from "../db";
import type { BannerOfferRow, BannerSettingsRow } from "../db/types";
import { newId } from "../ids";
import { ensureSeeded } from "./bootstrap";

const SETTINGS_ID = "banner";

async function ensureBannerSettings(): Promise<BannerSettingsRow> {
  await ensureSeeded();
  const store = getStore();
  try {
    const rows = await store.select("banner_settings", { eq: { id: SETTINGS_ID }, limit: 1 });
    if (rows[0]) return rows[0];
    const row: BannerSettingsRow = { id: SETTINGS_ID, enabled: false };
    await store.insert("banner_settings", [row]);
    return row;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/banner_settings|does not exist|42P01|PGRST/i.test(message)) {
      throw new Error(
        "La table bannière n'existe pas encore. Exécutez supabase/migrations/20260328_banner.sql dans Supabase.",
      );
    }
    throw error;
  }
}

export async function getBannerSettings() {
  return ensureBannerSettings();
}

export async function setBannerEnabled(enabled: boolean) {
  await ensureBannerSettings();
  const store = getStore();
  const updated = await store.update("banner_settings", SETTINGS_ID, { enabled });
  return updated ?? { id: SETTINGS_ID, enabled };
}

export async function listBannerOffers() {
  await ensureBannerSettings();
  return getStore().select("banner_offers", { order: { column: "sort_order" } });
}

export async function getPublicBannerMessages(): Promise<string[]> {
  try {
    const settings = await ensureBannerSettings();
    if (!settings.enabled) return [];
    const offers = await listBannerOffers();
    return offers
      .filter((offer) => offer.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((offer) => offer.message.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function createBannerOffer(input: {
  message: string;
  active?: boolean;
  sortOrder?: number;
}) {
  await ensureBannerSettings();
  const existing = await listBannerOffers();
  const row: BannerOfferRow = {
    id: newId("bno"),
    message: input.message.trim(),
    active: input.active !== false,
    sort_order: input.sortOrder ?? existing.length,
  };
  const [created] = await getStore().insert("banner_offers", [row]);
  return created ?? row;
}

export async function updateBannerOffer(id: string, patch: Partial<BannerOfferRow>) {
  await ensureBannerSettings();
  return getStore().update("banner_offers", id, patch);
}

export async function deleteBannerOffer(id: string) {
  await ensureBannerSettings();
  await getStore().remove("banner_offers", id);
}
