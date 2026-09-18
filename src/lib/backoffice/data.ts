import "server-only";

import type {
  ClientRow,
  MaterialRow,
  QuoteEquipmentRow,
  QuoteLaborRow,
  QuoteMaterialRow,
  QuoteRow,
  QuoteSubcontractRow,
  QuoteSurchargeRow,
} from "@/lib/supabase/database.types";
import { getAuthenticatedSupabase } from "@/lib/supabase/server";
import { withPerf } from "@/lib/backoffice/perf";

import Decimal from "decimal.js";
import type {
  QuoteDraft,
  QuoteLineDraft,
  QuoteMaterialDraft,
} from "@/domain/quotes/types";

export type ClientSummary = Pick<
  ClientRow,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "address"
  | "postal_code"
  | "locality"
  | "notes"
  | "is_active"
>;

export type MaterialSummary = Pick<
  MaterialRow,
  | "id"
  | "brand"
  | "name"
  | "variant"
  | "category"
  | "package_label"
  | "package_quantity"
  | "package_unit"
  | "calculation_type"
  | "consumption"
  | "consumption_unit"
  | "unit"
  | "base_unit_price"
  | "discounted_unit_price"
  | "base_package_price"
  | "discounted_package_price"
  | "discount_rate"
  | "notes"
  | "is_active"
>;

export type QuoteListItem = Pick<
  QuoteRow,
  | "id"
  | "quote_number"
  | "client_id"
  | "client_name_snapshot"
  | "project_location"
  | "quote_date"
  | "area"
  | "area_unit"
  | "net_value"
  | "updated_at"
>;

export type DashboardStats = {
  quotes: number;
  clients: number;
  materials: number;
};

const quoteColumns =
  "id,quote_number,client_id,client_name_snapshot,client_email_snapshot,client_phone_snapshot,client_address_snapshot,project_location,quote_date,description,area,area_unit,hourly_rate,desired_margin,commercial_discount,skonto,fixed_deduction,materials_total,labor_total,subcontracts_total,equipment_total,direct_costs_total,surcharges_total,total_cost,recommended_gross,manual_gross,gross_used,net_value,profit,real_margin,total_hours,created_at,updated_at";
const quoteMaterialColumns =
  "id,quote_id,material_id,position,stage,material_name_snapshot,variant_snapshot,package_snapshot,calculation_type,consumption_or_quantity,unit,unit_price,area_factor,cost_total,notes,created_at,updated_at";
const quoteLaborColumns =
  "id,quote_id,position,label,people,work_hours_per_person,travel_hours_per_person,total_hours,hourly_rate,cost_total,note,created_at,updated_at";
const quoteLineColumns =
  "id,quote_id,position,description,quantity,unit,unit_price,total_amount,note,created_at,updated_at";
const quoteSurchargeColumns =
  "id,quote_id,position,name,base_type,rate,base_amount,amount,created_at,updated_at";

function asText(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function sameDecimal(left: string | null | undefined, right: string | null | undefined): boolean {
  try {
    return new Decimal(String(left ?? "0")).eq(String(right ?? "0"));
  } catch {
    return false;
  }
}

function loadFailed(operation: string, error: { code?: string; message: string }): never {
  console.error(`[backoffice] ${operation}`, { code: error.code, message: error.message });
  throw new Error("Não foi possível carregar os dados do backoffice.");
}

export async function listClients(
  includeInactive = false,
): Promise<ClientSummary[]> {
  return withPerf("clients.load", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) {
      return [];
    }

    let query = authenticated.client
      .from("clients")
      .select(
        "id,name,email,phone,address,postal_code,locality,notes,is_active",
      )
      .order("name", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    perf.mark("query", { rows: data?.length ?? 0, ok: !error });
    if (error) {
      loadFailed("load clients", error);
    }

    return data ?? [];
  });
}

export async function listMaterials(
  includeInactive = false,
): Promise<MaterialSummary[]> {
  return withPerf("materials.load", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) {
      return [];
    }

    let query = authenticated.client
      .from("materials")
      .select(
        "id,brand,name,variant,category,package_label,package_quantity,package_unit,calculation_type,consumption,consumption_unit,unit,base_unit_price,discounted_unit_price,base_package_price,discounted_package_price,discount_rate,notes,is_active",
      )
      .order("name", { ascending: true })
      .order("variant", { ascending: true })
      .order("package_label", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    perf.mark("query", { rows: data?.length ?? 0, ok: !error });
    if (error) {
      loadFailed("load materials", error);
    }

    return data ?? [];
  });
}

export async function listQuotes(): Promise<QuoteListItem[]> {
  return withPerf("quotes.load", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) {
      return [];
    }

    const { data, error } = await authenticated.client
      .from("quotes")
      .select(
        "id,quote_number,client_id,client_name_snapshot,project_location,quote_date,area,area_unit,net_value,updated_at",
      )
      .order("created_at", { ascending: false });

    perf.mark("query", { rows: data?.length ?? 0, ok: !error });
    if (error) {
      loadFailed("load quotes", error);
    }

    return data ?? [];
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return withPerf("dashboard.load", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) {
      return { quotes: 0, clients: 0, materials: 0 };
    }

    const [quotes, clients, materials] = await Promise.all([
      authenticated.client.from("quotes").select("id", { count: "exact", head: true }),
      authenticated.client
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      authenticated.client
        .from("materials")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    const failed = [quotes, clients, materials].find((result) => result.error);
    perf.mark("queries", { calls: 3, ok: !failed });
    if (failed?.error) {
      loadFailed("load dashboard", failed.error);
    }

    return {
      quotes: quotes.count ?? 0,
      clients: clients.count ?? 0,
      materials: materials.count ?? 0,
    };
  });
}

export type QuoteWithLines = {
  quote: QuoteRow;
  materials: QuoteMaterialRow[];
  labor: QuoteLaborRow[];
  subcontracts: QuoteSubcontractRow[];
  equipment: QuoteEquipmentRow[];
  surcharges: QuoteSurchargeRow[];
};

export async function getQuoteById(id: string): Promise<QuoteWithLines | null> {
  return withPerf("quote.load", async (perf) => {
    const authenticated = await getAuthenticatedSupabase();
    perf.mark("auth", { authenticated: Boolean(authenticated) });
    if (!authenticated) {
      return null;
    }

    const [quoteResult, materialsResult, laborResult, subcontractResult, equipmentResult, surchargeResult] =
      await Promise.all([
        authenticated.client.from("quotes").select(quoteColumns).eq("id", id).maybeSingle(),
        authenticated.client
          .from("quote_materials")
          .select(quoteMaterialColumns)
          .eq("quote_id", id)
          .order("position", { ascending: true }),
        authenticated.client
          .from("quote_labor")
          .select(quoteLaborColumns)
          .eq("quote_id", id)
          .order("position", { ascending: true }),
        authenticated.client
          .from("quote_subcontracts")
          .select(quoteLineColumns)
          .eq("quote_id", id)
          .order("position", { ascending: true }),
        authenticated.client
          .from("quote_equipment")
          .select(quoteLineColumns)
          .eq("quote_id", id)
          .order("position", { ascending: true }),
        authenticated.client
          .from("quote_surcharges")
          .select(quoteSurchargeColumns)
          .eq("quote_id", id)
          .order("position", { ascending: true }),
      ]);

    const failed = [
      quoteResult,
      materialsResult,
      laborResult,
      subcontractResult,
      equipmentResult,
      surchargeResult,
    ].find((result) => result.error);
    perf.mark("queries", { calls: 6, ok: !failed });
    if (failed?.error) {
      loadFailed("load quote", failed.error);
    }

    if (!quoteResult.data) {
      return null;
    }

    return {
      quote: quoteResult.data,
      materials: materialsResult.data ?? [],
      labor: laborResult.data ?? [],
      subcontracts: subcontractResult.data ?? [],
      equipment: equipmentResult.data ?? [],
      surcharges: surchargeResult.data ?? [],
    };
  });
}

export function mapQuoteToDraft(value: QuoteWithLines): QuoteDraft {
  const { quote } = value;
  const materials: QuoteMaterialDraft[] = value.materials.map((line) => ({
    id: line.id,
    materialId: line.material_id,
    position: line.position,
    stage: line.stage ?? "",
    materialNameSnapshot: line.material_name_snapshot,
    variantSnapshot: line.variant_snapshot ?? "",
    packageSnapshot: line.package_snapshot ?? "",
    calculationType: line.calculation_type,
    consumptionOrQuantity: asText(line.consumption_or_quantity),
    unit: line.unit,
    unitPrice: asText(line.unit_price),
    areaFactor: asText(line.area_factor),
    areaFactorOverridden:
      line.calculation_type === "per_m2" &&
      !sameDecimal(line.area_factor, quote.area),
    costTotal: asText(line.cost_total),
    notes: line.notes ?? "",
  }));

  const lines = (rows: QuoteSubcontractRow[]): QuoteLineDraft[] =>
    rows.map((line) => ({
      id: line.id,
      position: line.position,
      description: line.description,
      quantity: asText(line.quantity),
      unit: line.unit,
      unitPrice: asText(line.unit_price),
      totalAmount: asText(line.total_amount),
      note: line.note ?? "",
    }));

  return {
    id: quote.id,
    quoteNumber: quote.quote_number,
    clientId: quote.client_id,
    projectLocation: quote.project_location ?? "",
    quoteDate: quote.quote_date,
    description: quote.description ?? "",
    area: asText(quote.area),
    areaUnit: quote.area_unit,
    hourlyRate: asText(quote.hourly_rate),
    desiredMargin: asText(quote.desired_margin),
    commercialDiscount: asText(quote.commercial_discount),
    skonto: asText(quote.skonto),
    fixedDeduction: asText(quote.fixed_deduction),
    manualGross: asText(quote.manual_gross),
    materials,
    labor: value.labor.map((line) => ({
      id: line.id,
      position: line.position,
      label: line.label,
      people: asText(line.people),
      workHoursPerPerson: asText(line.work_hours_per_person),
      travelHoursPerPerson: asText(line.travel_hours_per_person),
      totalHours: asText(line.total_hours),
      hourlyRate: asText(line.hourly_rate),
      costTotal: asText(line.cost_total),
      note: line.note ?? "",
    })),
    subcontracts: lines(value.subcontracts),
    equipment: lines(value.equipment),
    surcharges: value.surcharges.map((line) => ({
      id: line.id,
      position: line.position,
      name: line.name,
      baseType: line.base_type,
      rate: asText(line.rate),
      baseAmount: asText(line.base_amount),
      amount: asText(line.amount),
    })),
  };
}
