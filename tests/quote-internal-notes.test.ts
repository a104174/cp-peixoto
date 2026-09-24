import { describe, expect, it } from "vitest";

import { calculateQuote } from "../src/domain/quotes/calculations";
import { createEmptyQuoteDraft } from "../src/domain/quotes/defaults";
import {
  quoteDraftHasUnsavedChanges,
  serializeQuoteDraft,
} from "../src/domain/quotes/snapshot";
import type { QuoteWithLines } from "../src/lib/backoffice/data";
import { mapQuoteToDraft } from "../src/lib/backoffice/quote-draft-mapper";
import { quotePersistPayload } from "../src/lib/backoffice/quote-payload";
import { quoteDraftSchema } from "../src/lib/backoffice/schemas";
import type { Json } from "../src/lib/supabase/database.types";
import { validateQuoteDraft } from "../src/lib/backoffice/validation";

const internalNote = "Obra concluída; aguardar confirmação do pagamento.";

function savedQuoteFixture(internalNotes: string | null): QuoteWithLines {
  const timestamp = "2026-09-24T10:00:00.000Z";
  return {
    quote: {
      id: "00000000-0000-0000-0000-000000000101",
      quote_number: "CP-2026-0001",
      client_id: null,
      client_name_snapshot: "Cliente Exemplo",
      client_email_snapshot: null,
      client_phone_snapshot: null,
      client_address_snapshot: null,
      project_location: null,
      quote_date: "2026-09-24",
      description: "Revestimento de pavimento",
      internal_notes: internalNotes,
      area: null,
      area_unit: "m²",
      hourly_rate: null,
      desired_margin: null,
      commercial_discount: null,
      fixed_deduction: null,
      client_pdf_work_description: null,
      materials_total: "0",
      labor_total: "0",
      subcontracts_total: "0",
      equipment_total: "0",
      direct_costs_total: "0",
      surcharges_total: "0",
      total_cost: "0",
      recommended_gross: "0",
      manual_gross: null,
      gross_used: "0",
      net_value: "0",
      profit: "0",
      real_margin: "0",
      total_hours: "0",
      deleted_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    materials: [],
    labor: [],
    subcontracts: [],
    equipment: [],
    surcharges: [],
  };
}

function jsonStringField(value: Json, key: string): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const field = value[key];
  return typeof field === "string" ? field : null;
}

describe("notas internas do orçamento", () => {
  it("começa vazia e passa pelo schema sem se tornar obrigatória", () => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Orçamento de teste";

    expect(draft.internalNotes).toBe("");
    expect(quoteDraftSchema.safeParse(draft).success).toBe(true);
    expect(validateQuoteDraft(draft)).toEqual({});

    const draftWithoutNotes = Object.fromEntries(
      Object.entries(draft).filter(([field]) => field !== "internalNotes"),
    );
    const parsedWithoutNotes = quoteDraftSchema.parse(draftWithoutNotes);
    expect(parsedWithoutNotes.internalNotes).toBe("");
  });

  it("inclui a nota no save_quote e reabre-a no draft", () => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Obra de teste";
    draft.internalNotes = internalNote;

    const payload = quotePersistPayload(draft, calculateQuote(draft));
    expect(payload).toHaveProperty("internal_notes", internalNote);

    const reloaded = mapQuoteToDraft(
      savedQuoteFixture(jsonStringField(payload, "internal_notes")),
    );
    expect(reloaded.internalNotes).toBe(internalNote);

    const editedNote = `${internalNote} Cliente contactado novamente.`;
    reloaded.internalNotes = editedNote;
    const updatedPayload = quotePersistPayload(reloaded, calculateQuote(reloaded));
    expect(updatedPayload).toHaveProperty("internal_notes", editedNote);
  });

  it("guarda uma nota vazia como null e reabre-a como texto vazio", () => {
    const draft = createEmptyQuoteDraft();
    draft.description = "Obra sem nota";
    draft.internalNotes = "   ";

    const payload = quotePersistPayload(draft, calculateQuote(draft));
    expect(payload).toHaveProperty("internal_notes", null);
    expect(mapQuoteToDraft(savedQuoteFixture(null)).internalNotes).toBe("");
  });

  it("inclui alterações e limpeza das notas no dirty-state", () => {
    const draft = createEmptyQuoteDraft();
    const initialSnapshot = serializeQuoteDraft(draft);
    expect(quoteDraftHasUnsavedChanges(draft, initialSnapshot)).toBe(false);

    draft.internalNotes = internalNote;
    expect(quoteDraftHasUnsavedChanges(draft, initialSnapshot)).toBe(true);

    const savedSnapshot = serializeQuoteDraft(draft);
    expect(quoteDraftHasUnsavedChanges(draft, savedSnapshot)).toBe(false);

    draft.internalNotes = "";
    expect(quoteDraftHasUnsavedChanges(draft, savedSnapshot)).toBe(true);
  });
});
