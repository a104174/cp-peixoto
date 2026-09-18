import Decimal from "decimal.js";

import { normalizeMaterialUnit } from "./material-units";
import type { QuoteMaterialDraft } from "./types";

export type MaterialCatalogIdentity = {
  brand: string | null | undefined;
  name: string | null | undefined;
  variant: string | null | undefined;
  packageLabel: string | null | undefined;
  packageQuantity: string | number | null | undefined;
  packageUnit: string | null | undefined;
  calculationType: "per_m2" | "fixed";
  unit: string | null | undefined;
};

function normalizedText(value: string | null | undefined): string {
  return String(value ?? "").trim().toLocaleLowerCase("pt-PT");
}

function normalizedUnit(value: string | null | undefined): string {
  return normalizedText(normalizeMaterialUnit(value));
}

function sameNumber(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
): boolean {
  if (!String(left ?? "").trim() && !String(right ?? "").trim()) return true;
  try {
    return new Decimal(String(left ?? "0")).eq(String(right ?? "0"));
  } catch {
    return false;
  }
}

export function sameMaterialCatalogIdentity(
  left: MaterialCatalogIdentity,
  right: MaterialCatalogIdentity,
): boolean {
  return (
    normalizedText(left.brand) === normalizedText(right.brand) &&
    normalizedText(left.name) === normalizedText(right.name) &&
    normalizedText(left.variant) === normalizedText(right.variant) &&
    normalizedText(left.packageLabel) === normalizedText(right.packageLabel) &&
    normalizedText(left.packageUnit) === normalizedText(right.packageUnit) &&
    left.calculationType === right.calculationType &&
    normalizedUnit(left.unit) === normalizedUnit(right.unit) &&
    sameNumber(left.packageQuantity, right.packageQuantity)
  );
}

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
