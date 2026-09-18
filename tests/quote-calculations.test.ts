import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";

import { calculateQuote } from "../src/domain/quotes/calculations";
import { createEmptyQuoteDraft } from "../src/domain/quotes/defaults";
import { rateToDecimalInput } from "../src/domain/quotes/format";
import { quoteDraftSchema } from "../src/lib/backoffice/schemas";
import type { QuoteDraft, QuoteMaterialDraft } from "../src/domain/quotes/types";

function material(
  position: number,
  consumptionOrQuantity: string,
  unitPrice: string,
  calculationType: "per_m2" | "fixed" = "per_m2",
): QuoteMaterialDraft {
  return {
    id: `material-${position}`,
    materialId: null,
    position,
    stage: "",
    materialNameSnapshot: `Material ${position + 1}`,
    variantSnapshot: "",
    packageSnapshot: "",
    calculationType,
    consumptionOrQuantity,
    unit: "kg",
    unitPrice,
    areaFactor: calculationType === "per_m2" ? "600" : "1",
    areaFactorOverridden: false,
    costTotal: "0",
    notes: "",
  };
}

function baseDraft(overrides: Partial<QuoteDraft> = {}): QuoteDraft {
  return {
    id: null,
    quoteNumber: null,
    clientId: null,
    projectLocation: "",
    quoteDate: "2026-09-15",
    description: "Revestimento de pavimento",
    area: "600",
    areaUnit: "m²",
    hourlyRate: "52",
    desiredMargin: "0.1069",
    commercialDiscount: "0.02",
    skonto: "0.02",
    fixedDeduction: "0",
    manualGross: "",
    materials: [],
    labor: [],
    subcontracts: [],
    equipment: [],
    surcharges: [],
    ...overrides,
  };
}

describe("quote calculation engine", () => {
  it("starts a new quote as a clean draft", () => {
    const draft = createEmptyQuoteDraft();

    expect(draft).toMatchObject({
      id: null,
      quoteNumber: null,
      clientId: null,
      projectLocation: "",
      description: "",
      area: "",
      areaUnit: "m²",
      hourlyRate: "",
      desiredMargin: "",
      commercialDiscount: "",
      skonto: "",
      fixedDeduction: "",
      manualGross: "",
    });
    expect(draft.quoteDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(rateToDecimalInput(draft.desiredMargin)).toBe("");
    expect(draft.materials).toEqual([]);
    expect(draft.labor).toEqual([]);
    expect(draft.subcontracts).toEqual([]);
    expect(draft.equipment).toEqual([]);
    expect(draft.surcharges).toEqual([]);
    expect(quoteDraftSchema.safeParse(draft).success).toBe(true);

    const result = calculateQuote(draft);
    expect(result.totalCost).toBe("0");
    expect(result.recommendedGross).toBe("0");
    expect(result.netValue).toBe("0");
    expect(result.profit).toBe("0");
    expect(result.warnings).toEqual([]);
  });

  it("calculates a material per m²", () => {
    const result = calculateQuote(
      baseDraft({ materials: [material(0, "0.50", "3.90")] }),
    );

    expect(result.materials.lines[0]).toEqual({
      areaFactor: "600",
      costTotal: "1170",
    });
    expect(result.materials.total).toBe("1170");
  });

  it("calculates a free material without a catalog id or unit", () => {
    const freeMaterial = material(0, "10", "20", "per_m2");
    freeMaterial.materialId = null;
    freeMaterial.materialNameSnapshot = "Pedra";
    freeMaterial.unit = "";
    freeMaterial.areaFactor = "10";
    freeMaterial.areaFactorOverridden = true;

    const result = calculateQuote(baseDraft({ materials: [freeMaterial] }));

    expect(result.materials.lines[0]).toEqual({
      areaFactor: "10",
      costTotal: "2000",
    });
  });

  it("calculates a fixed material with factor 1", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "10", "3", "fixed")],
      }),
    );

    expect(result.materials.lines[0]).toEqual({
      areaFactor: "1",
      costTotal: "30",
    });
  });

  it("calculates a free fixed material without a unit", () => {
    const freeMaterial = material(0, "10", "20", "fixed");
    freeMaterial.materialNameSnapshot = "Pedra fixa";
    freeMaterial.unit = "";

    const result = calculateQuote(baseDraft({ materials: [freeMaterial] }));

    expect(result.materials.lines[0]).toEqual({
      areaFactor: "1",
      costTotal: "200",
    });
  });

  it("honors a manual material area-factor override", () => {
    const line = material(0, "0.50", "3.90");
    line.areaFactor = "100";
    line.areaFactorOverridden = true;
    const result = calculateQuote(baseDraft({ materials: [line] }));

    expect(result.materials.lines[0]).toEqual({
      areaFactor: "100",
      costTotal: "195",
    });
  });

  it("calculates labor from people, work and travel hours", () => {
    const result = calculateQuote(
      baseDraft({
        labor: [
          {
            id: "labor-1",
            position: 0,
            label: "Dia de trabalho",
            people: "2",
            workHoursPerPerson: "4",
            travelHoursPerPerson: "1",
            totalHours: "0",
            hourlyRate: "0",
            costTotal: "0",
            note: "",
          },
        ],
      }),
    );

    expect(result.labor.lines[0]).toEqual({
      totalHours: "10",
      hourlyRate: "52",
      costTotal: "520",
    });
    expect(result.labor.totalHours).toBe("10");
  });

  it("calculates subcontract and equipment line totals", () => {
    const result = calculateQuote(
      baseDraft({
        subcontracts: [
          {
            id: "sub-1",
            position: 0,
            description: "Granalhagem",
            quantity: "600",
            unit: "m²",
            unitPrice: "2.20",
            totalAmount: "0",
            note: "",
          },
        ],
        equipment: [
          {
            id: "equipment-1",
            position: 0,
            description: "Carrinha/bomba",
            quantity: "4",
            unit: "h",
            unitPrice: "140",
            totalAmount: "0",
            note: "",
          },
        ],
      }),
    );

    expect(result.subcontracts.lineTotals).toEqual(["1320"]);
    expect(result.equipment.lineTotals).toEqual(["560"]);
  });

  it("calculates every surcharge base", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "1", "100", "fixed")],
        labor: [
          {
            id: "labor-1",
            position: 0,
            label: "Trabalho",
            people: "1",
            workHoursPerPerson: "1",
            travelHoursPerPerson: "0",
            totalHours: "0",
            hourlyRate: "0",
            costTotal: "0",
            note: "",
          },
        ],
        subcontracts: [
          {
            id: "sub-1",
            position: 0,
            description: "Sub",
            quantity: "1",
            unit: "un.",
            unitPrice: "50",
            totalAmount: "0",
            note: "",
          },
        ],
        equipment: [
          {
            id: "equipment-1",
            position: 0,
            description: "Equipamento",
            quantity: "1",
            unit: "un.",
            unitPrice: "25",
            totalAmount: "0",
            note: "",
          },
        ],
        surcharges: [
          { id: "s1", position: 0, name: "Sub", baseType: "subcontracts", rate: "0.1", baseAmount: "0", amount: "0" },
          { id: "s2", position: 1, name: "Mat", baseType: "materials", rate: "0.1", baseAmount: "0", amount: "0" },
          { id: "s3", position: 2, name: "Lab", baseType: "labor", rate: "0.1", baseAmount: "0", amount: "0" },
          { id: "s4", position: 3, name: "Eq", baseType: "equipment", rate: "0.1", baseAmount: "0", amount: "0" },
          { id: "s5", position: 4, name: "Lab+Eq", baseType: "labor_plus_equipment", rate: "0.1", baseAmount: "0", amount: "0" },
          { id: "s6", position: 5, name: "Direct", baseType: "direct_costs", rate: "0.1", baseAmount: "0", amount: "0" },
        ],
      }),
    );

    expect(result.surcharges.lines.map((line) => line.baseAmount)).toEqual([
      "50",
      "100",
      "52",
      "25",
      "77",
      "227",
    ]);
  });

  it("applies cumulative surcharges in list order", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "1", "100", "fixed")],
        surcharges: [
          {
            id: "s1",
            position: 0,
            name: "Primeiro",
            baseType: "direct_costs",
            rate: "0.1",
            baseAmount: "0",
            amount: "0",
          },
          {
            id: "s2",
            position: 1,
            name: "Segundo",
            baseType: "direct_costs_plus_previous",
            rate: "0.2",
            baseAmount: "0",
            amount: "0",
          },
        ],
      }),
    );

    expect(result.surcharges.lines).toEqual([
      { baseAmount: "100", amount: "10" },
      { baseAmount: "110", amount: "22" },
    ]);
    expect(result.surcharges.total).toBe("32");
  });

  it("reconstructs the Excel recommended-price formula", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "1", "100", "fixed")],
        desiredMargin: "0.1",
        commercialDiscount: "0.02",
        skonto: "0.02",
      }),
    );

    expect(new Decimal(result.recommendedGross).toFixed(8)).toBe("115.69253552");
  });

  it("uses the manual gross override when present", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "1", "100", "fixed")],
        manualGross: "150",
      }),
    );

    expect(result.grossUsed).toBe("150");
    expect(result.warnings.some((warning) => warning.code === "MANUAL_GROSS_OVERRIDE")).toBe(true);
  });

  it("calculates net value, profit and real margin", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "1", "100", "fixed")],
        manualGross: "150",
        commercialDiscount: "0.02",
        skonto: "0.02",
      }),
    );

    expect(result.netValue).toBe("144.06");
    expect(result.profit).toBe("44.06");
    expect(new Decimal(result.realMargin).toFixed(12)).toBe("0.305844786894");
  });

  it("returns zero indicators for zero area and zero hours", () => {
    const result = calculateQuote(
      baseDraft({
        area: "0",
        materials: [material(0, "1", "5")],
        manualGross: "10",
      }),
    );

    expect(result.netPerM2).toBe("0");
    expect(result.netPerHour).toBe("0");
    expect(result.fixedDeductionPerM2).toBe("0");
  });

  it("keeps the fixed deduction out of the Excel recommended price", () => {
    const result = calculateQuote(
      baseDraft({
        materials: [material(0, "1", "100", "fixed")],
        fixedDeduction: "10",
      }),
    );

    expect(result.recommendedGross).toBe("116.5863643106567724949076241932748228343");
    expect(result.warnings.some((warning) => warning.code === "FIXED_DEDUCTION_NOT_IN_RECOMMENDED_PRICE")).toBe(true);
  });

  it("matches the complete Excel golden scenario", () => {
    const result = calculateQuote(
      baseDraft({
        manualGross: "22485",
        materials: [
          material(0, "0.50", "3.90"),
          material(1, "0", "3.90"),
          material(2, "2.50", "0.35"),
          material(3, "1.60", "3.90"),
          material(4, "5.00", "0.35"),
          material(5, "0.90", "4.00"),
          material(6, "0", "0", "fixed"),
          material(7, "0", "0", "fixed"),
        ],
        labor: [
          { id: "labor-1", position: 0, label: "Dia 1", people: "1", workHoursPerPerson: "9", travelHoursPerPerson: "1", totalHours: "0", hourlyRate: "0", costTotal: "0", note: "" },
          { id: "labor-2", position: 1, label: "Dia 2", people: "1", workHoursPerPerson: "10", travelHoursPerPerson: "2", totalHours: "0", hourlyRate: "0", costTotal: "0", note: "" },
          { id: "labor-3", position: 2, label: "Dia 3", people: "1", workHoursPerPerson: "24", travelHoursPerPerson: "3", totalHours: "0", hourlyRate: "0", costTotal: "0", note: "" },
          { id: "labor-4", position: 3, label: "Dia 4", people: "1", workHoursPerPerson: "30", travelHoursPerPerson: "3", totalHours: "0", hourlyRate: "0", costTotal: "0", note: "" },
        ],
        subcontracts: [
          { id: "sub-1", position: 0, description: "Granalhagem", quantity: "600", unit: "m²", unitPrice: "2.20", totalAmount: "0", note: "" },
          { id: "sub-2", position: 1, description: "Contentor", quantity: "1", unit: "un.", unitPrice: "900", totalAmount: "0", note: "" },
        ],
        equipment: [
          { id: "equipment-1", position: 0, description: "Carrinha/bomba", quantity: "4", unit: "h", unitPrice: "140", totalAmount: "0", note: "" },
        ],
        surcharges: [
          { id: "s1", position: 0, name: "Subempreitada", baseType: "subcontracts", rate: "0.08", baseAmount: "0", amount: "0" },
          { id: "s2", position: 1, name: "Direção/condução da obra", baseType: "labor", rate: "0.27", baseAmount: "0", amount: "0" },
          { id: "s3", position: 2, name: "Oficina/estaleiro", baseType: "direct_costs", rate: "0.03", baseAmount: "0", amount: "0" },
          { id: "s4", position: 3, name: "Administração", baseType: "direct_costs_plus_previous", rate: "0.12", baseAmount: "0", amount: "0" },
        ],
      }),
    );

    expect(result.materials.lines.map((line) => line.costTotal)).toEqual([
      "1170",
      "0",
      "525",
      "3744",
      "1050",
      "2160",
      "0",
      "0",
    ]);
    expect(result.materials.total).toBe("8649");
    expect(result.labor.totalHours).toBe("82");
    expect(result.labor.total).toBe("4264");
    expect(result.subcontracts.total).toBe("2220");
    expect(result.equipment.total).toBe("560");
    expect(result.directCosts).toBe("15693");
    expect(result.surcharges.lines.map((line) => line.amount)).toEqual([
      "177.6",
      "1151.28",
      "470.79",
      "2099.1204",
    ]);
    expect(result.surcharges.total).toBe("3898.7904");
    expect(result.totalCost).toBe("19591.7904");
    expect(new Decimal(result.recommendedGross).toFixed(6)).toBe("22841.356131");
    expect(result.grossUsed).toBe("22485");
    expect(result.netValue).toBe("21594.594");
    expect(result.profit).toBe("2002.8036");
    expect(new Decimal(result.realMargin).toFixed(8)).toBe("0.09274560");
    expect(result.netPerM2).toBe("35.99099");
    expect(new Decimal(result.netPerHour).toFixed(10)).toBe("263.3487073171");
  });
});
