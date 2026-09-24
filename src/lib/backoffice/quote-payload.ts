import type { QuoteCalculationResult, QuoteDraft } from "../../domain/quotes/types";
import type { Json } from "../supabase/database.types";
import { normalizeLocaleDecimal } from "./validation";

function normalizeDecimal(value: string | null | undefined, fallback = "0"): string {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return normalizeLocaleDecimal(text) ?? fallback;
}

function numericJson(value: string): string {
  return normalizeDecimal(value);
}

function nullableNumericJson(value: string | null | undefined): string | null {
  const text = String(value ?? "").trim();
  return text ? normalizeDecimal(text) : null;
}

export function quotePersistPayload(draft: QuoteDraft, result: QuoteCalculationResult): Json {
  return {
    id: draft.id,
    client_id: draft.clientId,
    project_location: draft.projectLocation,
    quote_date: draft.quoteDate,
    description: draft.description,
    internal_notes: draft.internalNotes.trim() ? draft.internalNotes : null,
    area: nullableNumericJson(draft.area),
    area_unit: draft.areaUnit,
    hourly_rate: nullableNumericJson(draft.hourlyRate),
    desired_margin: nullableNumericJson(draft.desiredMargin),
    commercial_discount: nullableNumericJson(draft.commercialDiscount),
    fixed_deduction: nullableNumericJson(draft.fixedDeduction),
    materials_total: result.materials.total,
    labor_total: result.labor.total,
    subcontracts_total: result.subcontracts.total,
    equipment_total: result.equipment.total,
    direct_costs_total: result.directCosts,
    surcharges_total: result.surcharges.total,
    total_cost: result.totalCost,
    recommended_gross: result.recommendedGross,
    manual_gross: draft.manualGross.trim() ? numericJson(draft.manualGross) : null,
    gross_used: result.grossUsed,
    net_value: result.netValue,
    profit: result.profit,
    real_margin: result.realMargin,
    total_hours: result.totalHours,
    materials: draft.materials.map((line, index) => ({
      material_id: line.materialId,
      position: index,
      stage: line.stage,
      material_name_snapshot: line.materialNameSnapshot,
      variant_snapshot: line.variantSnapshot,
      package_snapshot: line.packageSnapshot,
      calculation_type: line.calculationType,
      consumption_or_quantity: numericJson(line.consumptionOrQuantity),
      unit: line.unit.trim() ? line.unit.trim() : null,
      unit_price: numericJson(line.unitPrice),
      area_factor: result.materials.lines[index]?.areaFactor ?? numericJson(line.areaFactor),
      cost_total: result.materials.lines[index]?.costTotal ?? "0",
      notes: line.notes,
    })),
    labor: draft.labor.map((line, index) => ({
      position: index,
      label: line.label,
      people: numericJson(line.people),
      work_hours_per_person: numericJson(line.workHoursPerPerson),
      travel_hours_per_person: numericJson(line.travelHoursPerPerson),
      total_hours: result.labor.lines[index]?.totalHours ?? "0",
      hourly_rate: nullableNumericJson(draft.hourlyRate),
      cost_total: result.labor.lines[index]?.costTotal ?? "0",
      note: line.note,
    })),
    subcontracts: draft.subcontracts.map((line, index) => ({
      position: index,
      description: line.description,
      quantity: numericJson(line.quantity),
      unit: line.unit,
      unit_price: numericJson(line.unitPrice),
      total_amount: result.subcontracts.lineTotals[index] ?? "0",
      note: line.note,
    })),
    equipment: draft.equipment.map((line, index) => ({
      position: index,
      description: line.description,
      quantity: numericJson(line.quantity),
      unit: line.unit,
      unit_price: numericJson(line.unitPrice),
      total_amount: result.equipment.lineTotals[index] ?? "0",
      note: line.note,
    })),
    surcharges: draft.surcharges.map((line, index) => ({
      position: index,
      name: line.name,
      base_type: line.baseType,
      rate: numericJson(line.rate),
      base_amount: result.surcharges.lines[index]?.baseAmount ?? "0",
      amount: result.surcharges.lines[index]?.amount ?? "0",
    })),
  };
}
