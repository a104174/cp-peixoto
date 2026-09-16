import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createEmptyLaborDraft,
  createEmptyMaterialDraft,
  createEmptyQuoteDraft,
} from "../src/domain/quotes/defaults";
import { decimalInputToRate, rateToDecimalInput } from "../src/domain/quotes/format";
import {
  normalizeLocaleDecimal,
  parseLocaleDecimal,
  validateQuoteDraft,
  zodFieldErrors,
} from "../src/lib/backoffice/validation";
import { quoteDraftSchema } from "../src/lib/backoffice/schemas";

describe("validação de inputs do backoffice", () => {
  it("aceita vírgula e ponto decimal", () => {
    expect(normalizeLocaleDecimal("10,69")).toBe("10.69");
    expect(normalizeLocaleDecimal("10.69")).toBe("10.69");
  });

  it("distingue campos vazios de zero", () => {
    expect(parseLocaleDecimal("")).toBeNull();
    expect(normalizeLocaleDecimal("0")).toBe("0");
  });

  it("preserva texto inválido num input percentual para mostrar o erro", () => {
    const internal = decimalInputToRate("abc");
    expect(rateToDecimalInput(internal)).toBe("abc");
  });

  it("converte percentagens introduzidas pelo utilizador em taxas", () => {
    expect(decimalInputToRate("10,69")).toBe("0.1069");
    expect(rateToDecimalInput("0.1069")).toBe("10.69");
  });

  it.each([
    ["0.18", "18"],
    [0.18, "18"],
    ["10.69", "1069"],
    [10.69, "1069"],
    [0, "0"],
    ["0", "0"],
    [null, ""],
    [undefined, ""],
    ["", ""],
  ])("formata com segurança a taxa %s", (value, expected) => {
    expect(() => rateToDecimalInput(value)).not.toThrow();
    expect(rateToDecimalInput(value)).toBe(expected);
  });

  it("permite secções opcionais vazias num orçamento identificado", () => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Reparação de cobertura";
    expect(validateQuoteDraft(draft)).toEqual({});
  });

  it("rejeita um orçamento totalmente sem identificação", () => {
    const errors = validateQuoteDraft(createEmptyQuoteDraft());
    expect(errors.description).toContain("Identifique o orçamento");
  });

  it("associa erros numéricos ao respetivo campo", () => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Teste";
    draft.area = "abc";
    draft.desiredMargin = "1";
    draft.manualGross = "-1";
    const errors = validateQuoteDraft(draft);
    expect(errors.area).toBe("Introduza um valor válido.");
    expect(errors.desiredMargin).toBe("A percentagem deve estar entre 0% e 100%.");
    expect(errors.manualGross).toBe("O valor não pode ser negativo.");
  });

  it.each([
    ["52", {}],
    [52, {}],
    ["10.69", {}],
    [10.69, {}],
    ["10,69", {}],
    ["0", {}],
    [0, {}],
    [null, {}],
    [undefined, {}],
    ["", {}],
    [-1, { area: "O valor não pode ser negativo." }],
    ["-1", { area: "O valor não pode ser negativo." }],
    ["abc", { area: "Introduza um valor válido." }],
  ])("valida valores runtime %s sem lançar exception", (area, expectedAreaErrors) => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Teste";
    Object.assign(draft, { area });
    expect(() => validateQuoteDraft(draft)).not.toThrow();
    expect(validateQuoteDraft(draft)).toMatchObject(expectedAreaErrors);
  });

  it.each([
    [0.1069, {}],
    ["0.1069", {}],
    [0.9999, {}],
    [0, {}],
    ["0", {}],
    [10.69, { desiredMargin: "A percentagem deve estar entre 0% e 100%." }],
    ["10.69", { desiredMargin: "A percentagem deve estar entre 0% e 100%." }],
    ["10,69", { desiredMargin: "A percentagem deve estar entre 0% e 100%." }],
    [99.99, { desiredMargin: "A percentagem deve estar entre 0% e 100%." }],
    [100, { desiredMargin: "A percentagem deve estar entre 0% e 100%." }],
    [120, { desiredMargin: "A percentagem deve estar entre 0% e 100%." }],
  ])("valida percentagem runtime %s", (margin, expectedErrors) => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Teste";
    Object.assign(draft, { desiredMargin: margin });
    expect(() => validateQuoteDraft(draft)).not.toThrow();
    expect(validateQuoteDraft(draft)).toMatchObject(expectedErrors);
  });

  it("valida um draft com valores numéricos vindos do runtime do Supabase", () => {
    const draft = createEmptyQuoteDraft();
    const material = createEmptyMaterialDraft();
    Object.assign(material, {
      id: "material-1",
      materialId: "00000000-0000-0000-0000-000000000000",
      position: 0,
      stage: "",
      materialNameSnapshot: "Wecryl 171",
      variantSnapshot: "",
      packageSnapshot: "10 kg",
      calculationType: "per_m2",
      consumptionOrQuantity: 0.5,
      unit: "kg",
      unitPrice: 22.22,
      areaFactor: 600,
      areaFactorOverridden: false,
      costTotal: 0,
      notes: "",
    });
    Object.assign(draft, {
      clientId: "00000000-0000-0000-0000-000000000000",
      area: 600,
      hourlyRate: 52,
      desiredMargin: 0.1069,
      commercialDiscount: 0.02,
      skonto: 0.02,
      fixedDeduction: 0,
      materials: [material],
    });

    expect(() => validateQuoteDraft(draft)).not.toThrow();
    expect(validateQuoteDraft(draft)).toEqual({});
    expect(quoteDraftSchema.safeParse(draft).success).toBe(true);
  });

  it("exige preço/hora apenas quando existe mão de obra", () => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Teste";
    const labor = createEmptyLaborDraft();
    labor.label = "Aplicação";
    labor.people = "2";
    labor.workHoursPerPerson = "8";
    draft.labor = [labor];
    expect(validateQuoteDraft(draft).hourlyRate).toContain("preço/hora");
  });

  it("não expõe mensagens técnicas do Zod", () => {
    const parsed = z.object({ name: z.string().max(2) }).safeParse({ name: "longo" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(zodFieldErrors(parsed.error).name).toBe("O conteúdo deste campo é demasiado longo.");
    }
  });
});
