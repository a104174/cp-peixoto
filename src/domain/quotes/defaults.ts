import type {
  QuoteDraft,
  QuoteLaborDraft,
  QuoteLineDraft,
  QuoteMaterialDraft,
  QuoteSurchargeDraft,
} from "./types";

function newId(): string {
  return globalThis.crypto.randomUUID();
}

export function createDefaultSurcharges(): QuoteSurchargeDraft[] {
  return [
    {
      id: newId(),
      position: 0,
      name: "Subempreitada",
      baseType: "subcontracts",
      rate: "0.08",
      baseAmount: "0",
      amount: "0",
    },
    {
      id: newId(),
      position: 1,
      name: "Direção/condução da obra",
      baseType: "labor",
      rate: "0.27",
      baseAmount: "0",
      amount: "0",
    },
    {
      id: newId(),
      position: 2,
      name: "Oficina/estaleiro",
      baseType: "direct_costs",
      rate: "0.03",
      baseAmount: "0",
      amount: "0",
    },
    {
      id: newId(),
      position: 3,
      name: "Administração",
      baseType: "direct_costs_plus_previous",
      rate: "0.12",
      baseAmount: "0",
      amount: "0",
    },
  ];
}

export function createEmptyMaterialDraft(position = 0): QuoteMaterialDraft {
  return {
    id: newId(),
    materialId: null,
    position,
    stage: "",
    materialNameSnapshot: "",
    variantSnapshot: "",
    packageSnapshot: "",
    calculationType: "per_m2",
    consumptionOrQuantity: "0",
    unit: "kg",
    unitPrice: "0",
    areaFactor: "0",
    areaFactorOverridden: false,
    costTotal: "0",
    notes: "",
  };
}

export function createEmptyLaborDraft(position = 0): QuoteLaborDraft {
  return {
    id: newId(),
    position,
    label: "",
    people: "0",
    workHoursPerPerson: "0",
    travelHoursPerPerson: "0",
    totalHours: "0",
    hourlyRate: "52",
    costTotal: "0",
    note: "",
  };
}

export function createEmptyLineDraft(position = 0): QuoteLineDraft {
  return {
    id: newId(),
    position,
    description: "",
    quantity: "0",
    unit: "un.",
    unitPrice: "0",
    totalAmount: "0",
    note: "",
  };
}

export function createEmptyQuoteDraft(): QuoteDraft {
  return {
    id: null,
    quoteNumber: null,
    clientId: null,
    projectLocation: "",
    quoteDate: new Date().toISOString().slice(0, 10),
    description: "Revestimento de pavimento",
    area: "",
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
    surcharges: createDefaultSurcharges(),
  };
}

export { newId };

