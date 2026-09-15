import Decimal from "decimal.js";
import type { ZodError } from "zod";

import type { QuoteDraft } from "../../domain/quotes/types";

export type FieldErrors = Record<string, string>;

export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "SAVE_FAILED"
  | "NOT_FOUND";

export type ActionResult =
  | { success: true; id?: string; message?: string }
  | {
      success: false;
      code: ActionErrorCode;
      message: string;
      fieldErrors?: FieldErrors;
    };

export function parseLocaleDecimal(value: string): Decimal | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || !/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  try {
    const decimal = new Decimal(normalized);
    return decimal.isFinite() ? decimal : null;
  } catch {
    return null;
  }
}

export function normalizeLocaleDecimal(value: string): string | null {
  return parseLocaleDecimal(value)?.toString() ?? null;
}

export function zodFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (field && !fieldErrors[field]) {
      if (issue.code === "too_big") {
        fieldErrors[field] = "O conteúdo deste campo é demasiado longo.";
      } else if (issue.code === "invalid_type" || /^Invalid/i.test(issue.message)) {
        fieldErrors[field] = "Introduza um valor válido.";
      } else if (/^(Too |Expected )/i.test(issue.message)) {
        fieldErrors[field] = "Verifique este campo.";
      } else {
        fieldErrors[field] = issue.message;
      }
    }
  }
  return fieldErrors;
}

function validateDecimal(
  errors: FieldErrors,
  field: string,
  value: string,
  options: { required?: boolean; percentage?: boolean } = {},
) {
  if (!value.trim()) {
    if (options.required) errors[field] = "Este campo é obrigatório.";
    return;
  }

  const decimal = parseLocaleDecimal(value);
  if (!decimal) {
    errors[field] = "Introduza um valor válido.";
    return;
  }
  if (decimal.lt(0)) {
    errors[field] = "O valor não pode ser negativo.";
    return;
  }
  if (options.percentage && decimal.gte(1)) {
    errors[field] = "A percentagem deve estar entre 0% e 100%.";
  }
}

export function validateQuoteDraft(draft: QuoteDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.quoteDate.trim()) errors.quoteDate = "Este campo é obrigatório.";
  if (!draft.areaUnit.trim()) errors.areaUnit = "Este campo é obrigatório.";
  if (
    !draft.clientId &&
    !draft.description.trim() &&
    !draft.projectLocation.trim()
  ) {
    errors.description =
      "Identifique o orçamento com um cliente, uma descrição ou o local da obra.";
  }

  validateDecimal(errors, "area", draft.area);
  validateDecimal(errors, "hourlyRate", draft.hourlyRate);
  if (draft.labor.length > 0 && !draft.hourlyRate.trim()) {
    errors.hourlyRate = "Indique o preço/hora para calcular a mão de obra.";
  }
  validateDecimal(errors, "desiredMargin", draft.desiredMargin, { percentage: true });
  validateDecimal(errors, "commercialDiscount", draft.commercialDiscount, { percentage: true });
  validateDecimal(errors, "skonto", draft.skonto, { percentage: true });
  validateDecimal(errors, "fixedDeduction", draft.fixedDeduction);
  validateDecimal(errors, "manualGross", draft.manualGross);

  draft.materials.forEach((line, index) => {
    const prefix = `materials.${index}`;
    if (!line.materialNameSnapshot.trim()) {
      errors[`${prefix}.materialNameSnapshot`] = "Selecione um material.";
    }
    if (!line.unit.trim()) errors[`${prefix}.unit`] = "Indique a unidade.";
    validateDecimal(errors, `${prefix}.consumptionOrQuantity`, line.consumptionOrQuantity, { required: true });
    validateDecimal(errors, `${prefix}.unitPrice`, line.unitPrice, { required: true });
    validateDecimal(errors, `${prefix}.areaFactor`, line.areaFactor, { required: true });
  });

  draft.labor.forEach((line, index) => {
    const prefix = `labor.${index}`;
    if (!line.label.trim()) errors[`${prefix}.label`] = "Indique uma descrição.";
    validateDecimal(errors, `${prefix}.people`, line.people, { required: true });
    validateDecimal(errors, `${prefix}.workHoursPerPerson`, line.workHoursPerPerson, { required: true });
    validateDecimal(errors, `${prefix}.travelHoursPerPerson`, line.travelHoursPerPerson);
  });

  for (const [group, lines] of [
    ["subcontracts", draft.subcontracts],
    ["equipment", draft.equipment],
  ] as const) {
    lines.forEach((line, index) => {
      const prefix = `${group}.${index}`;
      if (!line.description.trim()) errors[`${prefix}.description`] = "Indique uma descrição.";
      validateDecimal(errors, `${prefix}.quantity`, line.quantity, { required: true });
      validateDecimal(errors, `${prefix}.unitPrice`, line.unitPrice, { required: true });
    });
  }

  draft.surcharges.forEach((line, index) => {
    const prefix = `surcharges.${index}`;
    if (!line.name.trim()) errors[`${prefix}.name`] = "Indique o nome do acréscimo.";
    validateDecimal(errors, `${prefix}.rate`, line.rate, {
      required: true,
      percentage: true,
    });
  });

  return errors;
}
