import { getStore } from "../db";
import type { FlyerOfferRow, FlyerSettingsRow } from "../db/types";
import { newId } from "../ids";
import { ensureSeeded } from "./bootstrap";

const SETTINGS_ID = "flyer";

async function ensureFlyerSettings(): Promise<FlyerSettingsRow> {
  await ensureSeeded();
  const store = getStore();
  try {
    const rows = await store.select("flyer_settings", { eq: { id: SETTINGS_ID }, limit: 1 });
    if (rows[0]) return rows[0];
    const row: FlyerSettingsRow = { id: SETTINGS_ID, enabled: false };
    await store.insert("flyer_settings", [row]);
    return row;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/flyer_settings|does not exist|42P01|PGRST/i.test(message)) {
      throw new Error(
        "La table flyer n'existe pas encore. Exécutez supabase/migrations/20260328_flyers.sql dans Supabase.",
      );
    }
    throw error;
  }
}

export async function getFlyerSettings() {
  return ensureFlyerSettings();
}

export async function setFlyerEnabled(enabled: boolean) {
  await ensureFlyerSettings();
  const store = getStore();
  const updated = await store.update("flyer_settings", SETTINGS_ID, { enabled });
  return updated ?? { id: SETTINGS_ID, enabled };
}

export async function listFlyerOffers() {
  await ensureFlyerSettings();
  return getStore().select("flyer_offers", { order: { column: "sort_order" } });
}

export type PublicFlyer = {
  id: string;
  description: string;
  image: string;
};

export async function getPublicFlyers(): Promise<PublicFlyer[]> {
  try {
    const settings = await ensureFlyerSettings();
    if (!settings.enabled) return [];
    const offers = await listFlyerOffers();
    return offers
      .filter((offer) => offer.active && offer.image.trim())
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((offer) => ({
        id: offer.id,
        description: offer.description.trim(),
        image: offer.image.trim(),
      }));
  } catch {
    return [];
  }
}

export async function createFlyerOffer(input: {
  description: string;
  image: string;
  active?: boolean;
  sortOrder?: number;
}) {
  await ensureFlyerSettings();
  const existing = await listFlyerOffers();
  const row: FlyerOfferRow = {
    id: newId("fly"),
    description: input.description.trim(),
    image: input.image.trim(),
    active: input.active !== false,
    sort_order: input.sortOrder ?? existing.length,
  };
  const [created] = await getStore().insert("flyer_offers", [row]);
  return created ?? row;
}

export async function updateFlyerOffer(id: string, patch: Partial<FlyerOfferRow>) {
  await ensureFlyerSettings();
  return getStore().update("flyer_offers", id, patch);
}

export async function deleteFlyerOffer(id: string) {
  await ensureFlyerSettings();
  await getStore().remove("flyer_offers", id);
}
