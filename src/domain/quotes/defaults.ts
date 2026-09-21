import type {
  QuoteDraft,
  QuoteLaborDraft,
  QuoteLineDraft,
  QuoteMaterialDraft,
} from "./types";

function newId(): string {
  return globalThis.crypto.randomUUID();
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
    consumptionOrQuantity: "",
    unit: "",
    unitPrice: "",
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
    people: "",
    workHoursPerPerson: "",
    travelHoursPerPerson: "",
    totalHours: "0",
    hourlyRate: "",
    costTotal: "0",
    note: "",
  };
}

export function createEmptyLineDraft(position = 0): QuoteLineDraft {
  return {
    id: newId(),
    position,
    description: "",
    quantity: "",
    unit: "un.",
    unitPrice: "",
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
    description: "",
    area: "",
    areaUnit: "m²",
    hourlyRate: "",
    desiredMargin: "",
    commercialDiscount: "",
    fixedDeduction: "",
    manualGross: "",
    materials: [],
    labor: [],
    subcontracts: [],
    equipment: [],
    surcharges: [],
  };
}

export { newId };
