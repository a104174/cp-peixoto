"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

import { calculateQuote } from "@/domain/quotes/calculations";
import { sameMaterialCatalogIdentity } from "@/domain/quotes/material-catalog";
import { clientInputSchema, materialInputSchema, quoteDraftSchema } from "./schemas";
import { getAuthenticatedSupabase } from "@/lib/supabase/server";
import { withPerf, type PerfTimer } from "@/lib/backoffice/perf";
import type { Json } from "@/lib/supabase/database.types";
import type { QuoteDraft } from "@/domain/quotes/types";
import {
  normalizeLocaleDecimal,
  validateQuoteDraft,
  zodFieldErrors,
  type ActionResult,
} from "./validation";

export type { ActionResult } from "./validation";

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function normalizeDecimal(value: string | null | undefined, fallback = "0"): string {
  const text = String(value ?? "").trim();
  if (!text) {
    return fallback;
  }
  return normalizeLocaleDecimal(text) ?? fallback;
}

function normalizePercentToRate(value: string | null | undefined): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  try {
    return new Decimal(text.replace(",", ".")).div(100).toString();
  } catch {
    return null;
  }
}

function authRequired(): ActionResult {
  return {
    success: false,
    code: "AUTH_REQUIRED",
    message: "A sua sessão expirou. Inicie sessão novamente.",
  };
}

function logDatabaseError(operation: string, error: { code?: string; message: string }) {
  console.error(`[backoffice] ${operation}`, {
    code: error.code,
    message: error.message,
  });
}

function materialIdsFromDraft(draft: QuoteDraft): string[] {
  return [
    ...new Set(
      draft.materials
        .map((line) => line.materialId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
}

async function verifyMaterialReferences(
  authenticated: Awaited<ReturnType<typeof getAuthenticatedSupabase>>,
  draft: QuoteDraft,
  perf: PerfTimer,
): Promise<ActionResult | null> {
  const ids = materialIdsFromDraft(draft);
  if (ids.length === 0) return null;
  if (!authenticated) {
    return authRequired();
  }

  const { data, error } = await authenticated.client
    .from("materials")
    .select("id")
    .in("id", ids);
  perf.mark("material-reference-query", { rows: data?.length ?? 0, ok: !error });

  if (error) {
    logDatabaseError("validate material references", error);
    return { success: false, code: "SAVE_FAILED", message: "Não foi possível validar os materiais. Tente novamente." };
  }

  if ((data ?? []).length !== ids.length) {
    return { success: false, code: "NOT_FOUND", message: "Um dos materiais selecionados já não existe." };
  }

  return null;
}

export async function createClientAction(formData: FormData): Promise<ActionResult> {
  return withPerf("client.create", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const parsed = clientInputSchema.safeParse({
      name: stringValue(formData, "name"),
      email: stringValue(formData, "email"),
      phone: stringValue(formData, "phone"),
      address: stringValue(formData, "address"),
      postalCode: stringValue(formData, "postalCode"),
      locality: stringValue(formData, "locality"),
      notes: stringValue(formData, "notes"),
    });
    if (!parsed.success) return { success: false, code: "VALIDATION_ERROR", message: "Verifique os campos assinalados.", fieldErrors: zodFieldErrors(parsed.error) };

    const data = {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      postal_code: parsed.data.postalCode || null,
      locality: parsed.data.locality || null,
      notes: parsed.data.notes || null,
    };

    const { data: created, error } = await authenticated.client
      .from("clients")
      .insert(data)
      .select("id")
      .single();
    perf.mark("query", { rows: created ? 1 : 0, ok: !error });
    if (error) {
      logDatabaseError("create client", error);
      return { success: false, code: "SAVE_FAILED", message: "Não foi possível guardar o cliente." };
    }

    revalidatePath("/backoffice");
    revalidatePath("/backoffice/clientes");
    revalidatePath("/backoffice/orcamentos/novo");
    return { success: true, id: created.id, message: "Cliente criado com sucesso." };
  });
}

export async function updateClientAction(formData: FormData): Promise<ActionResult> {
  return withPerf("client.update", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const id = stringValue(formData, "id");
    const parsedId = z.string().uuid().safeParse(id);
    const parsed = clientInputSchema.safeParse({
      name: stringValue(formData, "name"),
      email: stringValue(formData, "email"),
      phone: stringValue(formData, "phone"),
      address: stringValue(formData, "address"),
      postalCode: stringValue(formData, "postalCode"),
      locality: stringValue(formData, "locality"),
      notes: stringValue(formData, "notes"),
    });
    if (!parsedId.success || !parsed.success) {
      return { success: false, code: "VALIDATION_ERROR", message: "Verifique os campos assinalados.", fieldErrors: parsed.success ? { id: "Cliente inválido." } : zodFieldErrors(parsed.error) };
    }

    const { error } = await authenticated.client
      .from("clients")
      .update({
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        postal_code: parsed.data.postalCode || null,
        locality: parsed.data.locality || null,
        notes: parsed.data.notes || null,
      })
      .eq("id", id);
    perf.mark("query", { ok: !error });

    if (error) {
      logDatabaseError("update client", error);
      return { success: false, code: "SAVE_FAILED", message: "Não foi possível guardar o cliente." };
    }

    revalidatePath("/backoffice");
    revalidatePath("/backoffice/clientes");
    revalidatePath("/backoffice/orcamentos/novo");
    revalidatePath("/backoffice/orcamentos", "page");
    return { success: true, id, message: "Cliente atualizado." };
  });
}

async function toggleActive(
  table: "clients" | "materials",
  id: string,
): Promise<ActionResult> {
  return withPerf(`${table === "clients" ? "client" : "material"}.toggle`, async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) return { success: false, code: "NOT_FOUND", message: "Registo não encontrado." };

    const { data, error } = await authenticated.client
      .from(table)
      .select("is_active")
      .eq("id", id)
      .maybeSingle();
    perf.mark("state-query", { rows: data ? 1 : 0, ok: !error });

    if (error) {
      logDatabaseError("load record state", error);
      return { success: false, code: "SAVE_FAILED", message: "Não foi possível alterar o estado." };
    }
    if (!data) return { success: false, code: "NOT_FOUND", message: "Registo não encontrado." };

    const { error: updateError } = await authenticated.client
      .from(table)
      .update({ is_active: !data.is_active })
      .eq("id", id);
    perf.mark("update", { ok: !updateError });

    if (updateError) {
      logDatabaseError("toggle record state", updateError);
      return { success: false, code: "SAVE_FAILED", message: "Não foi possível alterar o estado." };
    }

    revalidatePath("/backoffice");
    revalidatePath(`/backoffice/${table === "clients" ? "clientes" : "materiais"}`);
    revalidatePath("/backoffice/orcamentos/novo");
    return { success: true };
  });
}

export async function toggleClientActiveAction(id: string): Promise<ActionResult> {
  return toggleActive("clients", id);
}

export async function toggleMaterialActiveAction(id: string): Promise<ActionResult> {
  return toggleActive("materials", id);
}

function readMaterialInput(formData: FormData) {
  return {
    brand: stringValue(formData, "brand"),
    name: stringValue(formData, "name"),
    variant: stringValue(formData, "variant"),
    category: stringValue(formData, "category"),
    packageLabel: stringValue(formData, "packageLabel"),
    packageQuantity: stringValue(formData, "packageQuantity"),
    packageUnit: stringValue(formData, "packageUnit"),
    calculationType: stringValue(formData, "calculationType"),
    consumption: stringValue(formData, "consumption"),
    consumptionUnit: stringValue(formData, "consumptionUnit"),
    unit: stringValue(formData, "unit"),
    baseUnitPrice: stringValue(formData, "baseUnitPrice"),
    discountedUnitPrice: stringValue(formData, "discountedUnitPrice"),
    basePackagePrice: stringValue(formData, "basePackagePrice"),
    discountedPackagePrice: stringValue(formData, "discountedPackagePrice"),
    discountRate: stringValue(formData, "discountRate"),
    notes: stringValue(formData, "notes"),
  };
}

function toMaterialRow(input: z.infer<typeof materialInputSchema>) {
  return {
    brand: input.brand,
    name: input.name,
    variant: input.variant || null,
    category: input.category || null,
    package_label: input.packageLabel || null,
    package_quantity: input.packageQuantity ? normalizeDecimal(input.packageQuantity) : null,
    package_unit: input.packageUnit || null,
    calculation_type: input.calculationType,
    consumption: input.consumption ? normalizeDecimal(input.consumption) : null,
    consumption_unit: input.consumptionUnit || null,
    unit: input.unit,
    base_unit_price: input.baseUnitPrice ? normalizeDecimal(input.baseUnitPrice) : null,
    discounted_unit_price: input.discountedUnitPrice ? normalizeDecimal(input.discountedUnitPrice) : null,
    base_package_price: input.basePackagePrice ? normalizeDecimal(input.basePackagePrice) : null,
    discounted_package_price: input.discountedPackagePrice ? normalizeDecimal(input.discountedPackagePrice) : null,
    discount_rate: normalizePercentToRate(input.discountRate),
    notes: input.notes || null,
  };
}

export async function createMaterialAction(formData: FormData): Promise<ActionResult> {
  return withPerf("material.create", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const parsed = materialInputSchema.safeParse(readMaterialInput(formData));
    if (!parsed.success) return { success: false, code: "VALIDATION_ERROR", message: "Verifique os campos assinalados.", fieldErrors: zodFieldErrors(parsed.error) };

    const { data: created, error } = await authenticated.client
      .from("materials")
      .insert(toMaterialRow(parsed.data))
      .select("id")
      .single();
    perf.mark("query", { rows: created ? 1 : 0, ok: !error });
    if (error) {
      logDatabaseError("create material", error);
      return { success: false, code: "SAVE_FAILED", message: "Não foi possível guardar o material." };
    }

    revalidatePath("/backoffice");
    revalidatePath("/backoffice/materiais");
    revalidatePath("/backoffice/orcamentos/novo");
    return { success: true, id: created.id, message: "Material criado com sucesso." };
  });
}

export async function createMaterialFromQuoteAction(formData: FormData): Promise<ActionResult> {
  return withPerf("material.create-from-quote", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const parsed = materialInputSchema.safeParse(readMaterialInput(formData));
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Verifique os campos assinalados.",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const { data: candidates, error: lookupError } = await authenticated.client
      .from("materials")
      .select("id,brand,name,variant,package_label,package_quantity,package_unit,calculation_type,unit");
    perf.mark("duplicate-check", { rows: candidates?.length ?? 0, ok: !lookupError });

    if (lookupError) {
      logDatabaseError("check existing material", lookupError);
      return {
        success: false,
        code: "SAVE_FAILED",
        message: "Não foi possível verificar o catálogo.",
      };
    }

    const equivalent = (candidates ?? []).find(
      (candidate) =>
        sameMaterialCatalogIdentity(
          {
            brand: candidate.brand,
            name: candidate.name,
            variant: candidate.variant,
            packageLabel: candidate.package_label,
            packageQuantity: candidate.package_quantity,
            packageUnit: candidate.package_unit,
            calculationType: candidate.calculation_type,
            unit: candidate.unit,
          },
          {
            brand: parsed.data.brand,
            name: parsed.data.name,
            variant: parsed.data.variant,
            packageLabel: parsed.data.packageLabel,
            packageQuantity: parsed.data.packageQuantity,
            packageUnit: parsed.data.packageUnit,
            calculationType: parsed.data.calculationType,
            unit: parsed.data.unit,
          },
        ),
    );

    if (equivalent) {
      revalidatePath("/backoffice");
      revalidatePath("/backoffice/materiais");
      revalidatePath("/backoffice/orcamentos/novo");
      return {
        success: true,
        id: equivalent.id,
        message: "Este material já existe no catálogo e foi associado.",
      };
    }

    const { data: created, error } = await authenticated.client
      .from("materials")
      .insert(toMaterialRow(parsed.data))
      .select("id")
      .single();
    perf.mark("query", { rows: created ? 1 : 0, ok: !error });
    if (error) {
      logDatabaseError("create material from quote", error);
      return {
        success: false,
        code: "SAVE_FAILED",
        message: "Não foi possível guardar o material no catálogo.",
      };
    }

    revalidatePath("/backoffice");
    revalidatePath("/backoffice/materiais");
    revalidatePath("/backoffice/orcamentos/novo");
    return {
      success: true,
      id: created.id,
      message: "Material adicionado ao catálogo.",
    };
  });
}

export async function updateMaterialAction(formData: FormData): Promise<ActionResult> {
  return withPerf("material.update", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const id = stringValue(formData, "id");
    const parsedId = z.string().uuid().safeParse(id);
    const parsed = materialInputSchema.safeParse(readMaterialInput(formData));
    if (!parsedId.success || !parsed.success) return { success: false, code: "VALIDATION_ERROR", message: "Verifique os campos assinalados.", fieldErrors: parsed.success ? { id: "Material inválido." } : zodFieldErrors(parsed.error) };

    const { error } = await authenticated.client
      .from("materials")
      .update(toMaterialRow(parsed.data))
      .eq("id", id);
    perf.mark("query", { ok: !error });

    if (error) {
      logDatabaseError("update material", error);
      return { success: false, code: "SAVE_FAILED", message: "Não foi possível guardar o material." };
    }

    revalidatePath("/backoffice");
    revalidatePath("/backoffice/materiais");
    revalidatePath("/backoffice/orcamentos/novo");
    revalidatePath("/backoffice/orcamentos", "layout");
    return { success: true, id, message: "Material atualizado." };
  });
}

function numericJson(value: string): string {
  return normalizeDecimal(value);
}

function nullableNumericJson(value: string | null | undefined): string | null {
  const text = String(value ?? "").trim();
  return text ? normalizeDecimal(text) : null;
}

function quotePersistPayload(draft: QuoteDraft, result: ReturnType<typeof calculateQuote>): Json {
  return {
    id: draft.id,
    client_id: draft.clientId,
    project_location: draft.projectLocation,
    quote_date: draft.quoteDate,
    description: draft.description,
    area: nullableNumericJson(draft.area),
    area_unit: draft.areaUnit,
    hourly_rate: nullableNumericJson(draft.hourlyRate),
    desired_margin: nullableNumericJson(draft.desiredMargin),
    commercial_discount: nullableNumericJson(draft.commercialDiscount),
    skonto: nullableNumericJson(draft.skonto),
    fixed_deduction: nullableNumericJson(draft.fixedDeduction),
    materials_total: result.materials.total,
    labor_total: result.labor.total,
    subcontracts_total: result.subcontracts.total,
    equipment_total: result.equipment.total,
    direct_costs_total: result.directCosts,
    surcharges_total: result.surcharges.total,
    total_cost: result.totalCost,
    recommended_gross: result.recommendedGross,
    manual_gross: draft.manualGross.trim() ? numericJson(draft.manualGross) : null,
    gross_used: result.grossUsed,
    net_value: result.netValue,
    profit: result.profit,
    real_margin: result.realMargin,
    total_hours: result.totalHours,
    materials: draft.materials.map((line, index) => ({
      material_id: line.materialId,
      position: index,
      stage: line.stage,
      material_name_snapshot: line.materialNameSnapshot,
      variant_snapshot: line.variantSnapshot,
      package_snapshot: line.packageSnapshot,
      calculation_type: line.calculationType,
      consumption_or_quantity: numericJson(line.consumptionOrQuantity),
      unit: line.unit.trim() ? line.unit.trim() : null,
      unit_price: numericJson(line.unitPrice),
      area_factor: result.materials.lines[index]?.areaFactor ?? numericJson(line.areaFactor),
      cost_total: result.materials.lines[index]?.costTotal ?? "0",
      notes: line.notes,
    })),
    labor: draft.labor.map((line, index) => ({
      position: index,
      label: line.label,
      people: numericJson(line.people),
      work_hours_per_person: numericJson(line.workHoursPerPerson),
      travel_hours_per_person: numericJson(line.travelHoursPerPerson),
      total_hours: result.labor.lines[index]?.totalHours ?? "0",
      hourly_rate: nullableNumericJson(draft.hourlyRate),
      cost_total: result.labor.lines[index]?.costTotal ?? "0",
      note: line.note,
    })),
    subcontracts: draft.subcontracts.map((line, index) => ({
      position: index,
      description: line.description,
      quantity: numericJson(line.quantity),
      unit: line.unit,
      unit_price: numericJson(line.unitPrice),
      total_amount: result.subcontracts.lineTotals[index] ?? "0",
      note: line.note,
    })),
    equipment: draft.equipment.map((line, index) => ({
      position: index,
      description: line.description,
      quantity: numericJson(line.quantity),
      unit: line.unit,
      unit_price: numericJson(line.unitPrice),
      total_amount: result.equipment.lineTotals[index] ?? "0",
      note: line.note,
    })),
    surcharges: draft.surcharges.map((line, index) => ({
      position: index,
      name: line.name,
      base_type: line.baseType,
      rate: numericJson(line.rate),
      base_amount: result.surcharges.lines[index]?.baseAmount ?? "0",
      amount: result.surcharges.lines[index]?.amount ?? "0",
    })),
  };
}

export type SaveQuoteResult = ActionResult & {
  quoteId?: string;
  quoteNumber?: string;
};

export async function saveQuoteAction(input: unknown): Promise<SaveQuoteResult> {
  return withPerf("quote.save", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) return authRequired();

    const parsed = quoteDraftSchema.safeParse(input);
    if (!parsed.success) return { success: false, code: "VALIDATION_ERROR", message: "Verifique os campos assinalados e tente novamente.", fieldErrors: zodFieldErrors(parsed.error) };

    const draft = parsed.data as QuoteDraft;
    const fieldErrors = validateQuoteDraft(draft);
    perf.mark("validation", { ok: Object.keys(fieldErrors).length === 0 });
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, code: "VALIDATION_ERROR", message: "Verifique os campos assinalados e tente novamente.", fieldErrors };
    }

    const referenceError = await verifyMaterialReferences(authenticated, draft, perf);
    if (referenceError) return referenceError;

    const result = calculateQuote(draft);
    const { data, error } = await authenticated.client.rpc("save_quote", {
      payload: quotePersistPayload(draft, result),
    });
    perf.mark("rpc", { rows: data ? 1 : 0, ok: !error && Boolean(data) });

    if (error || !data) {
      if (error) logDatabaseError("save quote", error);
      return {
        success: false,
        code: "SAVE_FAILED",
        message: "Não foi possível guardar o orçamento. Tente novamente.",
      };
    }

    revalidatePath("/backoffice");
    revalidatePath("/backoffice/orcamentos");
    revalidatePath(`/backoffice/orcamentos/${data.id}`);
    return { success: true, quoteId: data.id, quoteNumber: data.quote_number, message: draft.id ? "Alterações guardadas." : `Orçamento ${data.quote_number} criado com sucesso.` };
  });
}
