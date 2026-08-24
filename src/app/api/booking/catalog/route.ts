import { handler, jsonOk } from "@/server/http";
import { buildCatalog } from "@/server/presenters";

export const dynamic = "force-dynamic";

export const GET = handler(async () => jsonOk(await buildCatalog()));
