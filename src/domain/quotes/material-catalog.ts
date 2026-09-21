import type { QuoteMaterialDraft } from "./types";

export function materialNameOverride(
  name: string,
): Pick<QuoteMaterialDraft, "materialId" | "materialNameSnapshot"> {
  return {
    materialId: null,
    materialNameSnapshot: name,
  };
}

export function attachCatalogMaterial(
  materialId: string,
): Pick<QuoteMaterialDraft, "materialId"> {
  return { materialId };
}
