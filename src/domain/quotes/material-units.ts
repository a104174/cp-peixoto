export const QUOTE_MATERIAL_UNIT_OPTIONS = [
  "kg",
  "g",
  "L",
  "ml",
  "m²",
  "m",
  "un.",
  "embalagem",
  "saco",
  "rolo",
] as const;

const unitAliases: Record<string, (typeof QUOTE_MATERIAL_UNIT_OPTIONS)[number]> = {
  embalagens: "embalagem",
  g: "g",
  kg: "kg",
  kgs: "kg",
  l: "L",
  litro: "L",
  litros: "L",
  m: "m",
  m2: "m²",
  "m^2": "m²",
  "m²": "m²",
  ml: "ml",
  rolo: "rolo",
  rolos: "rolo",
  saco: "saco",
  sacos: "saco",
  un: "un.",
  "un.": "un.",
  unidade: "un.",
  unidades: "un.",
};

function unitKey(value: string): string {
  return value.trim().toLocaleLowerCase("pt-PT");
}

export function normalizeMaterialUnit(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return unitAliases[unitKey(normalized)] ?? normalized;
}

export function knownMaterialUnit(
  value: string | null | undefined,
): (typeof QUOTE_MATERIAL_UNIT_OPTIONS)[number] | null {
  const normalized = normalizeMaterialUnit(value);
  return QUOTE_MATERIAL_UNIT_OPTIONS.includes(
    normalized as (typeof QUOTE_MATERIAL_UNIT_OPTIONS)[number],
  )
    ? (normalized as (typeof QUOTE_MATERIAL_UNIT_OPTIONS)[number])
    : null;
}
