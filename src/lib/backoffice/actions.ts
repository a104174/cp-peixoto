"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

import { calculateQuote } from "@/domain/quotes/calculations";
import { clientInputSchema, materialInputSchema, quoteDraftSchema } from "./schemas";
import { getAuthenticatedSupabase } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import type { QuoteDraft } from "@/domain/quotes/types";

export type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function normalizeDecimal(value: string | null | undefined, fallback = "0"): string {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!text) {
    return fallback;
  }

  try {
    return new Decimal(text).toString();
  } catch {
    return fallback;
  }
}

function normalizeNullableDecimal(value: string | null | undefined): string | null {
  const text = String(value ?? "").trim();
  return text ? normalizeDecimal(text) : null;
}

function normalizePercentToRate(value: string | null | undefined): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  try {
    return new Decimal(text.replace(",", ".")).div(100).toString();
  } catch {
    return text;
  }
}

function validateNonNegative(value: string, label: string): string | null {
  try {
    if (new Decimal(value.replace(",", ".")).lt(0)) {
      return `${label} não pode ser negativo.`;
    }
  } catch {
    return `${label} inválido.`;
  }
  return null;
}

function validateQuoteNumbers(draft: QuoteDraft): string | null {
  const fields: [string, string][] = [
    ["Área", draft.area],
    ["Preço/hora", draft.hourlyRate],
    ["Margem desejada", draft.desiredMargin],
    ["Desconto comercial", draft.commercialDiscount],
    ["Skonto", draft.skonto],
    ["Dedução fixa", draft.fixedDeduction],
  ];

  for (const [label, value] of fields) {
    const error = validateNonNegative(value, label);
    if (error) return error;
  }

  for (const [label, value] of [
    ["margem desejada", draft.desiredMargin],
    ["desconto comercial", draft.commercialDiscount],
    ["Skonto", draft.skonto],
  ] as const) {
    try {
      if (new Decimal(value.replace(",", ".")).gte(1)) {
        return `${label} deve ser inferior a 100%.`;
      }
    } catch {
      return `${label} inválido.`;
    }
  }

  for (const [index, line] of draft.materials.entries()) {
    for (const [label, value] of [
      ["consumo/quantidade", line.consumptionOrQuantity],
      ["preço unitário", line.unitPrice],
      ["fator de área", line.areaFactor],
    ] as const) {
      const error = validateNonNegative(value, `Material ${index + 1}: ${label}`);
      if (error) return error;
    }
  }

  for (const [index, line] of draft.labor.entries()) {
    for (const [label, value] of [
      ["pessoas", line.people],
      ["horas de trabalho", line.workHoursPerPerson],
      ["horas de deslocação", line.travelHoursPerPerson],
    ] as const) {
      const error = validateNonNegative(value, `Mão de obra ${index + 1}: ${label}`);
      if (error) return error;
    }
  }

  for (const group of [
    ["Subempreitada", draft.subcontracts],
    ["Equipamento", draft.equipment],
  ] as const) {
    for (const [index, line] of group[1].entries()) {
      for (const [label, value] of [
        ["quantidade", line.quantity],
        ["preço unitário", line.unitPrice],
      ] as const) {
        const error = validateNonNegative(value, `${group[0]} ${index + 1}: ${label}`);
        if (error) return error;
      }
    }
  }

  for (const [index, line] of draft.surcharges.entries()) {
    const error = validateNonNegative(line.rate, `Acréscimo ${index + 1}: taxa`);
    if (error) return error;
    try {
      if (new Decimal(line.rate.replace(",", ".")).gte(1)) {
        return `Acréscimo ${index + 1}: a taxa deve ser inferior a 100%.`;
      }
    } catch {
      return `Acréscimo ${index + 1}: taxa inválida.`;
    }
  }

  return null;
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
): Promise<ActionResult | null> {
  const ids = materialIdsFromDraft(draft);
  if (ids.length === 0) return null;
  if (!authenticated) {
    return { success: false, error: "Sessão inválida." };
  }

  const { data, error } = await authenticated.client
    .from("materials")
    .select("id")
    .in("id", ids);

  if (error) {
    return { success: false, error: `Não foi possível validar os materiais: ${error.message}` };
  }

  if ((data ?? []).length !== ids.length) {
    return { success: false, error: "Um dos materiais selecionados já não existe." };
  }

  return null;
}

export async function createClientAction(formData: FormData): Promise<ActionResult> {
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) return { success: false, error: "Sessão inválida ou Supabase não configurado." };

  const parsed = clientInputSchema.safeParse({
    name: stringValue(formData, "name"),
    email: stringValue(formData, "email"),
    phone: stringValue(formData, "phone"),
    address: stringValue(formData, "address"),
    postalCode: stringValue(formData, "postalCode"),
    locality: stringValue(formData, "locality"),
    notes: stringValue(formData, "notes"),
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

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
  if (error) return { success: false, error: `Não foi possível criar o cliente: ${error.message}` };

  revalidatePath("/backoffice");
  revalidatePath("/backoffice/clientes");
  revalidatePath("/backoffice/orcamentos/novo");
  return { success: true, id: created.id };
}

export async function updateClientAction(formData: FormData): Promise<ActionResult> {
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) return { success: false, error: "Sessão inválida ou Supabase não configurado." };

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
    return { success: false, error: "Dados de cliente inválidos." };
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

  if (error) return { success: false, error: `Não foi possível atualizar o cliente: ${error.message}` };

  revalidatePath("/backoffice");
  revalidatePath("/backoffice/clientes");
  revalidatePath("/backoffice/orcamentos/novo");
  revalidatePath("/backoffice/orcamentos", "page");
  return { success: true, id };
}

async function toggleActive(
  table: "clients" | "materials",
  id: string,
): Promise<ActionResult> {
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) return { success: false, error: "Sessão inválida ou Supabase não configurado." };

  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return { success: false, error: "Identificador inválido." };

  const { data, error } = await authenticated.client
    .from(table)
    .select("is_active")
    .eq("id", id)
    .maybeSingle();

  if (error) return { success: false, error: `Não foi possível carregar o registo: ${error.message}` };
  if (!data) return { success: false, error: "Registo não encontrado." };

  const { error: updateError } = await authenticated.client
    .from(table)
    .update({ is_active: !data.is_active })
    .eq("id", id);

  if (updateError) return { success: false, error: `Não foi possível alterar o estado: ${updateError.message}` };

  revalidatePath("/backoffice");
  revalidatePath(`/backoffice/${table === "clients" ? "clientes" : "materiais"}`);
  revalidatePath("/backoffice/orcamentos/novo");
  return { success: true };
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
    packageQuantity: normalizeNullableDecimal(stringValue(formData, "packageQuantity")),
    packageUnit: stringValue(formData, "packageUnit"),
    calculationType: stringValue(formData, "calculationType"),
    consumption: normalizeNullableDecimal(stringValue(formData, "consumption")),
    consumptionUnit: stringValue(formData, "consumptionUnit"),
    unit: stringValue(formData, "unit"),
    baseUnitPrice: normalizeNullableDecimal(stringValue(formData, "baseUnitPrice")),
    discountedUnitPrice: normalizeNullableDecimal(stringValue(formData, "discountedUnitPrice")),
    basePackagePrice: normalizeNullableDecimal(stringValue(formData, "basePackagePrice")),
    discountedPackagePrice: normalizeNullableDecimal(stringValue(formData, "discountedPackagePrice")),
    discountRate: normalizePercentToRate(stringValue(formData, "discountRate")),
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
    discount_rate: input.discountRate ? normalizeDecimal(input.discountRate) : null,
    notes: input.notes || null,
  };
}

export async function createMaterialAction(formData: FormData): Promise<ActionResult> {
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) return { success: false, error: "Sessão inválida ou Supabase não configurado." };

  const parsed = materialInputSchema.safeParse(readMaterialInput(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { data: created, error } = await authenticated.client
    .from("materials")
    .insert(toMaterialRow(parsed.data))
    .select("id")
    .single();
  if (error) return { success: false, error: `Não foi possível criar o material: ${error.message}` };

  revalidatePath("/backoffice");
  revalidatePath("/backoffice/materiais");
  revalidatePath("/backoffice/orcamentos/novo");
  return { success: true, id: created.id };
}

export async function updateMaterialAction(formData: FormData): Promise<ActionResult> {
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) return { success: false, error: "Sessão inválida ou Supabase não configurado." };

  const id = stringValue(formData, "id");
  const parsedId = z.string().uuid().safeParse(id);
  const parsed = materialInputSchema.safeParse(readMaterialInput(formData));
  if (!parsedId.success || !parsed.success) return { success: false, error: "Dados de material inválidos." };

  const { error } = await authenticated.client
    .from("materials")
    .update(toMaterialRow(parsed.data))
    .eq("id", id);

  if (error) return { success: false, error: `Não foi possível atualizar o material: ${error.message}` };

  revalidatePath("/backoffice");
  revalidatePath("/backoffice/materiais");
  revalidatePath("/backoffice/orcamentos/novo");
  revalidatePath("/backoffice/orcamentos", "layout");
  return { success: true, id };
}

function numericJson(value: string): string {
  return normalizeDecimal(value);
}

function quotePersistPayload(draft: QuoteDraft, result: ReturnType<typeof calculateQuote>): Json {
  return {
    id: draft.id,
    client_id: draft.clientId,
    project_location: draft.projectLocation,
    quote_date: draft.quoteDate,
    description: draft.description,
    area: draft.area,
    area_unit: draft.areaUnit,
    hourly_rate: numericJson(draft.hourlyRate),
    desired_margin: numericJson(draft.desiredMargin),
    commercial_discount: numericJson(draft.commercialDiscount),
    skonto: numericJson(draft.skonto),
    fixed_deduction: numericJson(draft.fixedDeduction),
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
      unit: line.unit,
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
      hourly_rate: numericJson(draft.hourlyRate),
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
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) return { success: false, error: "Sessão inválida ou Supabase não configurado." };

  const parsed = quoteDraftSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados do orçamento inválidos." };

  const draft = parsed.data as QuoteDraft;
  const numberError = validateQuoteNumbers(draft);
  if (numberError) return { success: false, error: numberError };

  const referenceError = await verifyMaterialReferences(authenticated, draft);
  if (referenceError) return referenceError;

  const result = calculateQuote(draft);
  const { data, error } = await authenticated.client.rpc("save_quote", {
    payload: quotePersistPayload(draft, result),
  });

  if (error || !data) {
    return {
      success: false,
      error: `Não foi possível guardar o orçamento: ${error?.message ?? "resposta vazia"}`,
    };
  }

  revalidatePath("/backoffice");
  revalidatePath("/backoffice/orcamentos");
  revalidatePath(`/backoffice/orcamentos/${data.id}`);
  return { success: true, quoteId: data.id, quoteNumber: data.quote_number };
}
