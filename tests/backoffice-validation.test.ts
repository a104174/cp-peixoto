import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createEmptyLaborDraft, createEmptyQuoteDraft } from "../src/domain/quotes/defaults";
import { decimalInputToRate, rateToDecimalInput } from "../src/domain/quotes/format";
import {
  normalizeLocaleDecimal,
  parseLocaleDecimal,
  validateQuoteDraft,
  zodFieldErrors,
} from "../src/lib/backoffice/validation";

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
