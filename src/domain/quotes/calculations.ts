import Decimal from "decimal.js";

import type {
  CalculationWarning,
  DecimalString,
  LaborCalculationResult,
  QuoteCalculationResult,
  QuoteDraft,
  QuoteLineDraft,
  QuoteMaterialDraft,
  QuoteSurchargeDraft,
} from "./types";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export const FORMULA_ENGINE_VERSION = "excel-v2" as const;

function decimalOrZero(value: string | null | undefined): Decimal {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!normalized) {
    return new Decimal(0);
  }

  try {
    return new Decimal(normalized);
  } catch {
    return new Decimal(0);
  }
}

function decimalString(value: Decimal): string {
  return value.toString();
}

function calculateMaterialLine(line: QuoteMaterialDraft, area: Decimal) {
  const factor = line.areaFactorOverridden
    ? decimalOrZero(line.areaFactor)
    : line.calculationType === "per_m2"
      ? area
      : decimalOrZero(line.areaFactor);
  const quantity = decimalOrZero(line.consumptionOrQuantity);
  const unitPrice = decimalOrZero(line.unitPrice);

  return {
    areaFactor: decimalString(factor),
    costTotal: decimalString(quantity.mul(unitPrice).mul(factor)),
  };
}

function calculateLaborLine(line: QuoteDraft["labor"][number], hourlyRate: Decimal) {
  const people = decimalOrZero(line.people);
  const workHours = decimalOrZero(line.workHoursPerPerson);
  const travelHours = decimalOrZero(line.travelHoursPerPerson);
  const totalHours = people.mul(workHours.add(travelHours));

  return {
    totalHours: decimalString(totalHours),
    hourlyRate: decimalString(hourlyRate),
    costTotal: decimalString(totalHours.mul(hourlyRate)),
  };
}

function calculateSimpleLine(line: QuoteLineDraft) {
  return decimalOrZero(line.quantity).mul(decimalOrZero(line.unitPrice));
}

function baseForSurcharge(
  baseType: QuoteSurchargeDraft["baseType"],
  directCosts: Decimal,
  materials: Decimal,
  labor: Decimal,
  equipment: Decimal,
  subcontracts: Decimal,
  previousSurcharges: Decimal,
): Decimal {
  switch (baseType) {
    case "subcontracts":
      return subcontracts;
    case "materials":
      return materials;
    case "labor":
      return labor;
    case "equipment":
      return equipment;
    case "labor_plus_equipment":
      return labor.add(equipment);
    case "direct_costs":
      return directCosts;
    case "direct_costs_plus_previous":
      return directCosts.add(previousSurcharges);
  }
}

export function calculateMaterialCost(
  line: QuoteMaterialDraft,
  area: string,
): { areaFactor: DecimalString; costTotal: DecimalString } {
  return calculateMaterialLine(line, decimalOrZero(area));
}

export function calculateLaborCost(
  line: QuoteDraft["labor"][number],
  hourlyRate: string,
): LaborCalculationResult {
  return calculateLaborLine(line, decimalOrZero(hourlyRate));
}

export function calculateQuote(draft: QuoteDraft): QuoteCalculationResult {
  const area = decimalOrZero(draft.area);
  const hourlyRate = decimalOrZero(draft.hourlyRate);

  const materialLines = draft.materials.map((line) =>
    calculateMaterialLine(line, area),
  );
  const materialsTotal = materialLines.reduce(
    (total, line) => total.add(decimalOrZero(line.costTotal)),
    new Decimal(0),
  );

  const laborLines = draft.labor.map((line) =>
    calculateLaborLine(line, hourlyRate),
  );
  const laborHours = laborLines.reduce(
    (total, line) => total.add(decimalOrZero(line.totalHours)),
    new Decimal(0),
  );
  const laborTotal = laborLines.reduce(
    (total, line) => total.add(decimalOrZero(line.costTotal)),
    new Decimal(0),
  );

  const subcontractLineTotals = draft.subcontracts.map(calculateSimpleLine);
  const subcontractTotal = subcontractLineTotals.reduce(
    (total, line) => total.add(line),
    new Decimal(0),
  );

  const equipmentLineTotals = draft.equipment.map(calculateSimpleLine);
  const equipmentTotal = equipmentLineTotals.reduce(
    (total, line) => total.add(line),
    new Decimal(0),
  );

  const directCosts = materialsTotal
    .add(laborTotal)
    .add(subcontractTotal)
    .add(equipmentTotal);

  let previousSurcharges = new Decimal(0);
  const surchargeLines = draft.surcharges.map((line) => {
    const baseAmount = baseForSurcharge(
      line.baseType,
      directCosts,
      materialsTotal,
      laborTotal,
      equipmentTotal,
      subcontractTotal,
      previousSurcharges,
    );
    const amount = baseAmount.mul(decimalOrZero(line.rate));
    previousSurcharges = previousSurcharges.add(amount);

    return {
      baseAmount: decimalString(baseAmount),
      amount: decimalString(amount),
    };
  });

  const surchargeTotal = previousSurcharges;
  const totalCost = directCosts.add(surchargeTotal);
  const desiredMargin = decimalOrZero(draft.desiredMargin);
  const commercialDiscount = decimalOrZero(draft.commercialDiscount);
  const recommendedGross =
    desiredMargin.gte(1) ||
    commercialDiscount.gte(1)
      ? new Decimal(0)
      : totalCost
          .div(new Decimal(1).sub(desiredMargin))
          .div(new Decimal(1).sub(commercialDiscount));

  const manualGrossText = draft.manualGross.trim();
  const grossUsed = manualGrossText
    ? decimalOrZero(manualGrossText)
    : recommendedGross;
  const fixedDeduction = decimalOrZero(draft.fixedDeduction);
  const netValue = grossUsed
    .mul(new Decimal(1).sub(commercialDiscount))
    .sub(fixedDeduction);
  const profit = netValue.sub(totalCost);
  const realMargin = netValue.isZero()
    ? new Decimal(0)
    : profit.div(netValue);
  const netPerM2 = area.isZero() ? new Decimal(0) : netValue.div(area);
  const fixedDeductionPerM2 = area.isZero()
    ? new Decimal(0)
    : fixedDeduction.div(area);
  const netPerHour = laborHours.isZero()
    ? new Decimal(0)
    : netValue.div(laborHours);

  const warnings: CalculationWarning[] = [];
  if (manualGrossText) {
    warnings.push({
      code: "MANUAL_GROSS_OVERRIDE",
      message: "Está ativo um preço bruto manual.",
      severity: "info",
      field: "manualGross",
    });
  }
  if (fixedDeduction.gt(0)) {
    warnings.push({
      code: "FIXED_DEDUCTION_NOT_IN_RECOMMENDED_PRICE",
      message:
        "A fórmula excel-v2 não compensa a dedução fixa no preço recomendado.",
      severity: "warning",
      field: "fixedDeduction",
    });
  }
  draft.materials.forEach((line, index) => {
    if (!line.materialNameSnapshot.trim()) {
      warnings.push({
        code: "MATERIAL_MISSING",
        message: "A linha de material não tem material selecionado.",
        severity: "warning",
        field: `materials.${index}`,
      });
    }
    if (line.calculationType === "per_m2" && area.isZero()) {
      warnings.push({
        code: "AREA_MISSING",
        message: "A área da obra está a zero; este material não terá custo calculado.",
        severity: "warning",
        field: `materials.${index}`,
      });
    }
  });
  draft.labor.forEach((line, index) => {
    if (!line.label.trim() && !decimalOrZero(line.people).isZero()) {
      warnings.push({
        code: "LABOR_LABEL_MISSING",
        message: "A linha de mão de obra tem pessoas, mas não tem descrição.",
        severity: "warning",
        field: `labor.${index}`,
      });
    }
  });
  [...draft.subcontracts, ...draft.equipment].forEach((line, index) => {
    if (!line.description.trim() && !decimalOrZero(line.quantity).isZero()) {
      warnings.push({
        code: "LINE_DESCRIPTION_MISSING",
        message: "Existe uma linha de custo sem descrição.",
        severity: "warning",
        field: `cost-line.${index}`,
      });
    }
  });
  if (desiredMargin.gte(1) || commercialDiscount.gte(1)) {
    warnings.push({
      code: "INVALID_RATE",
      message: "Uma taxa é igual ou superior a 100%; o preço recomendado foi zero.",
      severity: "error",
    });
  }
  if (draft.surcharges.some((line) => line.baseType === "direct_costs_plus_previous")) {
    warnings.push({
      code: "CUMULATIVE_SURCHARGE",
      message: "Este acréscimo inclui os acréscimos anteriores pela ordem das linhas.",
      severity: "info",
    });
  }

  return {
    materials: { lines: materialLines, total: decimalString(materialsTotal) },
    labor: {
      lines: laborLines,
      totalHours: decimalString(laborHours),
      total: decimalString(laborTotal),
    },
    subcontracts: {
      lineTotals: subcontractLineTotals.map(decimalString),
      total: decimalString(subcontractTotal),
    },
    equipment: {
      lineTotals: equipmentLineTotals.map(decimalString),
      total: decimalString(equipmentTotal),
    },
    directCosts: decimalString(directCosts),
    surcharges: {
      lines: surchargeLines,
      total: decimalString(surchargeTotal),
    },
    totalCost: decimalString(totalCost),
    recommendedGross: decimalString(recommendedGross),
    grossUsed: decimalString(grossUsed),
    netValue: decimalString(netValue),
    profit: decimalString(profit),
    realMargin: decimalString(realMargin),
    totalHours: decimalString(laborHours),
    netPerM2: decimalString(netPerM2),
    fixedDeductionPerM2: decimalString(fixedDeductionPerM2),
    netPerHour: decimalString(netPerHour),
    warnings,
  };
}

export type { CalculationWarning };
