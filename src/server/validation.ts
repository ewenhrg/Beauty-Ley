export class ValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export function asString(value: unknown, field: string, options: { max?: number; min?: number } = {}) {
  if (typeof value !== "string") throw new ValidationError("Champ manquant.", field);
  const trimmed = value.trim();
  const { min = 1, max = 255 } = options;
  if (trimmed.length < min) throw new ValidationError("Champ obligatoire.", field);
  if (trimmed.length > max) throw new ValidationError(`Maximum ${max} caractères.`, field);
  return trimmed;
}

export function asOptionalString(value: unknown, field: string, max = 1000) {
  if (value === undefined || value === null || value === "") return null;
  return asString(value, field, { max });
}

export function asNumber(value: unknown, field: string, options: { min?: number; max?: number } = {}) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new ValidationError("Valeur numérique attendue.", field);
  if (options.min !== undefined && parsed < options.min) {
    throw new ValidationError(`Minimum ${options.min}.`, field);
  }
  if (options.max !== undefined && parsed > options.max) {
    throw new ValidationError(`Maximum ${options.max}.`, field);
  }
  return parsed;
}

export function asInteger(value: unknown, field: string, options: { min?: number; max?: number } = {}) {
  return Math.round(asNumber(value, field, options));
}

export function asBoolean(value: unknown, field: string) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ValidationError("Valeur booléenne attendue.", field);
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) return value as T;
  throw new ValidationError("Valeur non autorisée.", field);
}

/** Deliberately permissive: international formats vary a lot in Hurghada. */
export function asPhone(value: unknown, field = "phone") {
  const raw = asString(value, field, { max: 32 });
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) throw new ValidationError("Numéro de téléphone invalide.", field);
  return raw;
}

export function asEmail(value: unknown, field = "email") {
  const raw = asString(value, field, { max: 160 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw)) {
    throw new ValidationError("Adresse email invalide.", field);
  }
  return raw.toLowerCase();
}

export function asOptionalEmail(value: unknown, field = "email") {
  if (value === undefined || value === null || value === "") return null;
  return asEmail(value, field);
}

export function asIsoInstant(value: unknown, field: string) {
  const raw = asString(value, field, { max: 40 });
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) throw new ValidationError("Date invalide.", field);
  return new Date(parsed).toISOString();
}

export function asDateKey(value: unknown, field: string) {
  const raw = asString(value, field, { max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new ValidationError("Date invalide.", field);
  return raw;
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ValidationError("Corps de requête invalide.");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Corps de requête invalide.");
  }
}
