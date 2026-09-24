import Decimal from "decimal.js";

import type {
  QuoteDraft,
  QuoteLineDraft,
  QuoteMaterialDraft,
} from "../../domain/quotes/types";
import type { QuoteWithLines } from "./data";

function asText(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function sameDecimal(left: string | null | undefined, right: string | null | undefined): boolean {
  try {
    return new Decimal(String(left ?? "0")).eq(String(right ?? "0"));
  } catch {
    return false;
  }
}

export function mapQuoteToDraft(value: QuoteWithLines): QuoteDraft {
  const { quote } = value;
  const materials: QuoteMaterialDraft[] = value.materials.map((line) => ({
    id: line.id,
    materialId: line.material_id,
    position: line.position,
    stage: line.stage ?? "",
    materialNameSnapshot: line.material_name_snapshot,
    variantSnapshot: line.variant_snapshot ?? "",
    packageSnapshot: line.package_snapshot ?? "",
    calculationType: line.calculation_type,
    consumptionOrQuantity: asText(line.consumption_or_quantity),
    unit: line.unit ?? "",
    unitPrice: asText(line.unit_price),
    areaFactor: asText(line.area_factor),
    areaFactorOverridden:
      line.calculation_type === "per_m2" &&
      !sameDecimal(line.area_factor, quote.area),
    costTotal: asText(line.cost_total),
    notes: line.notes ?? "",
  }));

  const lines = (rows: QuoteWithLines["subcontracts"]): QuoteLineDraft[] =>
    rows.map((line) => ({
      id: line.id,
      position: line.position,
      description: line.description,
      quantity: asText(line.quantity),
      unit: line.unit,
      unitPrice: asText(line.unit_price),
      totalAmount: asText(line.total_amount),
      note: line.note ?? "",
    }));

  return {
    id: quote.id,
    quoteNumber: quote.quote_number,
    clientId: quote.client_id,
    projectLocation: quote.project_location ?? "",
    quoteDate: quote.quote_date,
    description: quote.description ?? "",
    internalNotes: quote.internal_notes ?? "",
    area: asText(quote.area),
    areaUnit: quote.area_unit,
    hourlyRate: asText(quote.hourly_rate),
    desiredMargin: asText(quote.desired_margin),
    commercialDiscount: asText(quote.commercial_discount),
    fixedDeduction: asText(quote.fixed_deduction),
    manualGross: asText(quote.manual_gross),
    materials,
    labor: value.labor.map((line) => ({
      id: line.id,
      position: line.position,
      label: line.label,
      people: asText(line.people),
      workHoursPerPerson: asText(line.work_hours_per_person),
      travelHoursPerPerson: asText(line.travel_hours_per_person),
      totalHours: asText(line.total_hours),
      hourlyRate: asText(line.hourly_rate),
      costTotal: asText(line.cost_total),
      note: line.note ?? "",
    })),
    subcontracts: lines(value.subcontracts),
    equipment: lines(value.equipment),
    surcharges: value.surcharges.map((line) => ({
      id: line.id,
      position: line.position,
      name: line.name,
      baseType: line.base_type,
      rate: asText(line.rate),
      baseAmount: asText(line.base_amount),
      amount: asText(line.amount),
    })),
  };
}
