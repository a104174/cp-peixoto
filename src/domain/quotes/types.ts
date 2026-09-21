export type DecimalString = string;

export type QuoteCalculationType = "per_m2" | "fixed";

export type SurchargeBaseType =
  | "subcontracts"
  | "materials"
  | "labor"
  | "equipment"
  | "labor_plus_equipment"
  | "direct_costs"
  | "direct_costs_plus_previous";

export interface QuoteMaterialDraft {
  id: string;
  materialId: string | null;
  position: number;
  stage: string;
  materialNameSnapshot: string;
  variantSnapshot: string;
  packageSnapshot: string;
  calculationType: QuoteCalculationType;
  consumptionOrQuantity: DecimalString;
  unit: string;
  unitPrice: DecimalString;
  areaFactor: DecimalString;
  areaFactorOverridden?: boolean;
  costTotal: DecimalString;
  notes: string;
}

export interface QuoteLaborDraft {
  id: string;
  position: number;
  label: string;
  people: DecimalString;
  workHoursPerPerson: DecimalString;
  travelHoursPerPerson: DecimalString;
  totalHours: DecimalString;
  hourlyRate: DecimalString;
  costTotal: DecimalString;
  note: string;
}

export interface QuoteLineDraft {
  id: string;
  position: number;
  description: string;
  quantity: DecimalString;
  unit: string;
  unitPrice: DecimalString;
  totalAmount: DecimalString;
  note: string;
}

export interface QuoteSurchargeDraft {
  id: string;
  position: number;
  name: string;
  baseType: SurchargeBaseType;
  rate: DecimalString;
  baseAmount: DecimalString;
  amount: DecimalString;
}

export interface QuoteDraft {
  id: string | null;
  quoteNumber: string | null;
  clientId: string | null;
  projectLocation: string;
  quoteDate: string;
  description: string;
  area: DecimalString;
  areaUnit: string;
  hourlyRate: DecimalString;
  desiredMargin: DecimalString;
  commercialDiscount: DecimalString;
  fixedDeduction: DecimalString;
  manualGross: DecimalString;
  materials: QuoteMaterialDraft[];
  labor: QuoteLaborDraft[];
  subcontracts: QuoteLineDraft[];
  equipment: QuoteLineDraft[];
  surcharges: QuoteSurchargeDraft[];
}

export interface CalculationWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  field?: string;
}

export interface MaterialCalculationResult {
  areaFactor: DecimalString;
  costTotal: DecimalString;
}

export interface LaborCalculationResult {
  totalHours: DecimalString;
  hourlyRate: DecimalString;
  costTotal: DecimalString;
}

export interface QuoteCalculationResult {
  materials: {
    lines: MaterialCalculationResult[];
    total: DecimalString;
  };
  labor: {
    lines: LaborCalculationResult[];
    totalHours: DecimalString;
    total: DecimalString;
  };
  subcontracts: {
    lineTotals: DecimalString[];
    total: DecimalString;
  };
  equipment: {
    lineTotals: DecimalString[];
    total: DecimalString;
  };
  directCosts: DecimalString;
  surcharges: {
    lines: {
      baseAmount: DecimalString;
      amount: DecimalString;
    }[];
    total: DecimalString;
  };
  totalCost: DecimalString;
  recommendedGross: DecimalString;
  grossUsed: DecimalString;
  netValue: DecimalString;
  profit: DecimalString;
  realMargin: DecimalString;
  totalHours: DecimalString;
  netPerM2: DecimalString;
  fixedDeductionPerM2: DecimalString;
  netPerHour: DecimalString;
  warnings: CalculationWarning[];
}
