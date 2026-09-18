import { z } from "zod";
import { parseLocaleDecimal } from "./validation";

const text = (max: number) =>
  z.string().trim().max(max).optional().nullable();

const decimalText = z.preprocess(
  (value) =>
    value === null || value === undefined
      ? ""
      : typeof value === "number"
        ? String(value)
        : value,
  z
    .string()
    .trim()
    .max(40)
    .regex(/^-?(?:\d+(?:[.,]\d*)?|[.,]\d+)?$/, "Introduza um valor válido."),
);

const optionalDecimalText = decimalText.nullable().optional();
const optionalNonNegativeDecimal = optionalDecimalText.refine(
  (value) => !value || (parseLocaleDecimal(value)?.gte(0) ?? false),
  "O valor não pode ser negativo.",
);
const optionalPercentage = optionalNonNegativeDecimal.refine(
  (value) => !value || (parseLocaleDecimal(value)?.lt(100) ?? false),
  "A percentagem deve estar entre 0% e 100%.",
);

export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Introduza o nome do cliente.").max(160),
  email: z
    .string()
    .trim()
    .email("Introduza um email válido.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  phone: text(60),
  address: text(240),
  postalCode: text(32),
  locality: text(120),
  notes: text(2_000),
}).strict();

export type ClientInput = z.infer<typeof clientInputSchema>;

export const materialInputSchema = z.object({
  brand: z.string().trim().min(1, "Introduza a marca.").max(120),
  name: z.string().trim().min(1, "Introduza o nome do material.").max(160),
  variant: text(80),
  category: text(80),
  packageLabel: text(80),
  packageQuantity: optionalNonNegativeDecimal,
  packageUnit: text(32),
  calculationType: z.enum(["per_m2", "fixed"]),
  consumption: optionalNonNegativeDecimal,
  consumptionUnit: text(32),
  unit: z.string().trim().min(1, "Introduza a unidade de cálculo.").max(32),
  baseUnitPrice: optionalNonNegativeDecimal,
  discountedUnitPrice: optionalNonNegativeDecimal,
  basePackagePrice: optionalNonNegativeDecimal,
  discountedPackagePrice: optionalNonNegativeDecimal,
  discountRate: optionalPercentage,
  notes: text(2_000),
}).strict();

export type MaterialInput = z.infer<typeof materialInputSchema>;

const materialRowSchema = z.object({
  id: z.string().min(1),
  materialId: z.string().uuid().nullable(),
  position: z.number().int().min(0),
  stage: z.string().trim().max(120),
  materialNameSnapshot: z.string().trim().max(200),
  variantSnapshot: z.string().trim().max(120),
  packageSnapshot: z.string().trim().max(120),
  calculationType: z.enum(["per_m2", "fixed"]),
  consumptionOrQuantity: decimalText,
  unit: z.preprocess(
    (value) => value === null || value === undefined ? "" : value,
    z.string().trim().max(32),
  ),
  unitPrice: decimalText,
  areaFactor: decimalText,
  areaFactorOverridden: z.boolean().optional().default(false),
  costTotal: decimalText,
  notes: z.string().trim().max(2_000),
}).strict();

const laborRowSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0),
  label: z.string().trim().max(160),
  people: decimalText,
  workHoursPerPerson: decimalText,
  travelHoursPerPerson: decimalText,
  totalHours: decimalText,
  hourlyRate: decimalText,
  costTotal: decimalText,
  note: z.string().trim().max(2_000),
}).strict();

const lineRowSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0),
  description: z.string().trim().max(200),
  quantity: decimalText,
  unit: z.string().trim().max(32),
  unitPrice: decimalText,
  totalAmount: decimalText,
  note: z.string().trim().max(2_000),
}).strict();

const surchargeRowSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0),
  name: z.string().trim().max(160),
  baseType: z.enum([
    "subcontracts",
    "materials",
    "labor",
    "equipment",
    "labor_plus_equipment",
    "direct_costs",
    "direct_costs_plus_previous",
  ]),
  rate: decimalText,
  baseAmount: decimalText,
  amount: decimalText,
}).strict();

export const quoteDraftSchema = z.object({
  id: z.string().uuid().nullable(),
  quoteNumber: z.string().trim().max(64).nullable(),
  clientId: z.string().uuid().nullable(),
  projectLocation: z.string().trim().max(240),
  quoteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().trim().max(2_000),
  area: decimalText,
  areaUnit: z.string().trim().min(1).max(16),
  hourlyRate: decimalText,
  desiredMargin: decimalText,
  commercialDiscount: decimalText,
  skonto: decimalText,
  fixedDeduction: decimalText,
  manualGross: decimalText,
  materials: z.array(materialRowSchema).max(100),
  labor: z.array(laborRowSchema).max(100),
  subcontracts: z.array(lineRowSchema).max(100),
  equipment: z.array(lineRowSchema).max(100),
  surcharges: z.array(surchargeRowSchema).max(20),
}).strict();

export type QuoteDraftInput = z.infer<typeof quoteDraftSchema>;
