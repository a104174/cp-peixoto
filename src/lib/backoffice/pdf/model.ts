import Decimal from "decimal.js";

import { formatMoney, formatNumber, formatPercent } from "../../../domain/quotes/format";
import type {
  QuoteMaterialRow,
  QuoteRow,
  QuoteLaborRow,
  QuoteSubcontractRow,
  QuoteSurchargeRow,
} from "../../supabase/database.types";
import { asText } from "./shared";

type PdfRuntimeValue<T> = T extends string | null | undefined
  ? T | number | null | undefined
  : T;

type PdfRuntimeRow<T> = {
  [Key in keyof T]: PdfRuntimeValue<T[Key]>;
};

export type PdfRuntimeQuoteSource = {
  quote: PdfRuntimeRow<QuoteRow>;
  materials: PdfRuntimeRow<QuoteMaterialRow>[];
  labor: PdfRuntimeRow<QuoteLaborRow>[];
  subcontracts: PdfRuntimeRow<QuoteSubcontractRow>[];
  equipment: PdfRuntimeRow<QuoteSubcontractRow>[];
  surcharges: PdfRuntimeRow<QuoteSurchargeRow>[];
};

export type PdfRuntimeClientSource = {
  quote: PdfRuntimeRow<
    Pick<
      QuoteRow,
      | "quote_number"
      | "quote_date"
      | "client_name_snapshot"
      | "description"
      | "project_location"
      | "net_value"
      | "client_pdf_work_description"
    >
  >;
};

export type ClientQuotePdfModel = {
  quoteNumber: string;
  quoteDate: string;
  clientName: string;
  objectDescription: string | null;
  projectLocation: string | null;
  workDescription: string[];
  pauschalpreis: string;
};

function cleanText(value: unknown): string | null {
  const normalized = asText(value).replace(/\s+/g, " ").trim();
  return normalized || null;
}

function formatDate(value: unknown): string {
  const text = asText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : text;
}

export function formatSwissAmount(value: string | number | null | undefined): string {
  const decimal = decimalValue(value);
  const fixed = decimal.toFixed(2);
  const [integer, fraction] = fixed.split(".");
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}.${fraction}`;
}

export function buildClientQuotePdfModel(
  source: PdfRuntimeClientSource,
  workDescription: unknown,
): ClientQuotePdfModel {
  const { quote } = source;

  return {
    quoteNumber: asText(quote.quote_number),
    quoteDate: formatDate(quote.quote_date),
    clientName: cleanText(quote.client_name_snapshot) ?? "",
    objectDescription: cleanText(quote.description),
    projectLocation: cleanText(quote.project_location),
    workDescription: asText(workDescription)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    pauschalpreis: `CHF ${formatSwissAmount(quote.net_value)}`,
  };
}

function safePart(value: unknown, fallback: string): string {
  const safe = asText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return safe || fallback;
}

export function clientQuotePdfFilename(
  quoteNumber: unknown,
  clientName: unknown,
): string {
  const number = safePart(asText(quoteNumber).replace(/^CP-/i, ""), "Offerte");
  const client = safePart(clientName, "Kunde");
  return `CP_Peixoto_Offerte_${number}_${client}.pdf`;
}

export type InternalPdfField = {
  label: string;
  value: string;
};

export type InternalPdfColumn = {
  label: string;
  width: number;
};

export type InternalPdfTable = {
  title: string;
  columns: InternalPdfColumn[];
  rows: string[][];
  totalLabel?: string;
  totalValue: string;
};

export type InternalQuotePdfModel = {
  quoteNumber: string;
  quoteDate: string;
  identification: InternalPdfField[];
  conditions: InternalPdfField[];
  tables: InternalPdfTable[];
  financialSummary: InternalPdfField[];
};

function valueOrDash(value: unknown): string {
  const text = asText(value);
  return text.trim() === "" ? "—" : text;
}

function numericValue(value: unknown): string | number | null | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value === null || value === undefined) return value;
  return undefined;
}

function formatAmount(value: unknown): string {
  const numeric = numericValue(value);
  if (typeof numeric === "string" && numeric.trim() === "") return "—";
  return formatMoney(numeric);
}

function formatQuantity(value: unknown): string {
  const numeric = numericValue(value);
  if (numeric === null || numeric === undefined || asText(numeric).trim() === "") {
    return "—";
  }
  try {
    return formatNumber(numeric, 2).replace(/,00$/, "");
  } catch {
    return asText(numeric);
  }
}

function formatRate(value: unknown): string {
  const numeric = numericValue(value);
  if (numeric === null || numeric === undefined || asText(numeric).trim() === "") {
    return "—";
  }
  try {
    return formatPercent(numeric);
  } catch {
    return asText(numeric);
  }
}

function formatArea(value: unknown, unit: unknown): string {
  if (asText(value).trim() === "") return "—";
  const unitText = asText(unit).trim();
  return [formatQuantity(value), unitText].filter(Boolean).join(" ");
}

function splitAddress(value: unknown): {
  address: string;
  postalLocality: string;
} {
  const text = asText(value).trim();
  if (!text) return { address: "—", postalLocality: "—" };
  const separator = text.lastIndexOf(", ");
  if (separator < 0) return { address: text, postalLocality: "—" };
  return {
    address: text.slice(0, separator).trim() || "—",
    postalLocality: text.slice(separator + 2).trim() || "—",
  };
}

function calculationTypeLabel(type: unknown): string {
  return asText(type) === "per_m2" ? "Por m²" : "Quantidade fixa";
}

function decimalValue(value: unknown): Decimal {
  const input = typeof value === "number"
    ? value
    : asText(value).trim().replace(",", ".");
  if (input === "") return new Decimal(0);
  try {
    const decimal = new Decimal(input);
    return decimal.isFinite() ? decimal : new Decimal(0);
  } catch {
    return new Decimal(0);
  }
}

function hasValue(value: unknown): boolean {
  return asText(value).trim() !== "";
}

const surchargeBaseLabels: Record<string, string> = {
  subcontracts: "Subempreitadas",
  materials: "Materiais",
  labor: "Mão de obra",
  equipment: "Viatura / equipamento",
  labor_plus_equipment: "Mão de obra + equipamento",
  direct_costs: "Custos diretos",
  direct_costs_plus_previous: "Custos diretos + acréscimos anteriores",
};

export function buildInternalQuotePdfModel(
  source: PdfRuntimeQuoteSource,
): InternalQuotePdfModel {
  const { quote } = source;
  const address = splitAddress(quote.client_address_snapshot);
  const area = decimalValue(quote.area);
  const fixedDeduction = decimalValue(quote.fixed_deduction);
  const totalHours = decimalValue(quote.total_hours);

  const identification: InternalPdfField[] = [
    { label: "Número do orçamento", value: valueOrDash(quote.quote_number) },
    { label: "Data", value: formatDate(quote.quote_date) },
    { label: "Cliente", value: valueOrDash(quote.client_name_snapshot) },
    { label: "Email", value: valueOrDash(quote.client_email_snapshot) },
    { label: "Telefone", value: valueOrDash(quote.client_phone_snapshot) },
    { label: "Morada", value: address.address },
    { label: "Código postal / localidade", value: address.postalLocality },
    { label: "Local da obra", value: valueOrDash(quote.project_location) },
    { label: "Descrição", value: valueOrDash(quote.description) },
    { label: "Área", value: formatArea(quote.area, quote.area_unit) },
    { label: "Unidade", value: valueOrDash(quote.area_unit) },
  ];

  const conditions: InternalPdfField[] = [
    { label: "Preço / hora", value: hasValue(quote.hourly_rate) ? formatAmount(quote.hourly_rate) : "—" },
    { label: "Margem desejada", value: formatRate(quote.desired_margin) },
    { label: "Desconto comercial", value: formatRate(quote.commercial_discount) },
    { label: "Dedução fixa", value: hasValue(quote.fixed_deduction) ? formatAmount(quote.fixed_deduction) : "—" },
    ...(hasValue(quote.manual_gross)
      ? [{ label: "Preço manual", value: formatAmount(quote.manual_gross) }]
      : []),
  ];

  const tables: InternalPdfTable[] = [
    {
      title: "Materiais",
      columns: [
        { label: "Material", width: 80 },
        { label: "Etapa", width: 57 },
        { label: "Tipo", width: 39 },
        { label: "Consumo / qtd.", width: 57 },
        { label: "Unidade", width: 40 },
        { label: "Preço unitário", width: 58 },
        { label: "Área / fator", width: 49 },
        { label: "Notas", width: 98 },
        { label: "Custo", width: 60 },
      ],
      rows: source.materials.map((line) => [
        [line.material_name_snapshot, line.variant_snapshot, line.package_snapshot]
          .map(cleanText)
          .filter((value): value is string => value !== null)
          .join(" · "),
        valueOrDash(line.stage),
        calculationTypeLabel(line.calculation_type),
        formatQuantity(line.consumption_or_quantity),
        valueOrDash(line.unit),
        formatAmount(line.unit_price),
        formatQuantity(line.area_factor),
        valueOrDash(line.notes),
        formatAmount(line.cost_total),
      ]),
      totalLabel: "Total de materiais",
      totalValue: formatAmount(quote.materials_total),
    },
    {
      title: "Mão de obra",
      columns: [
        { label: "Descrição", width: 83 },
        { label: "Pessoas", width: 43 },
        { label: "Horas trabalho / pessoa", width: 63 },
        { label: "Horas deslocação / pessoa", width: 63 },
        { label: "Nota", width: 145 },
        { label: "Horas totais", width: 59 },
        { label: "Custo", width: 85 },
      ],
      rows: source.labor.map((line) => [
        valueOrDash(line.label),
        formatQuantity(line.people),
        formatQuantity(line.work_hours_per_person),
        formatQuantity(line.travel_hours_per_person),
        valueOrDash(line.note),
        formatQuantity(line.total_hours),
        formatAmount(line.cost_total),
      ]),
      totalLabel: `Total mão de obra · ${formatQuantity(quote.total_hours)} h`,
      totalValue: formatAmount(quote.labor_total),
    },
    {
      title: "Subempreitadas",
      columns: [
        { label: "Descrição", width: 145 },
        { label: "Quantidade", width: 68 },
        { label: "Unidade", width: 53 },
        { label: "Preço unitário", width: 78 },
        { label: "Nota", width: 119 },
        { label: "Total", width: 78 },
      ],
      rows: source.subcontracts.map((line) => [
        valueOrDash(line.description),
        formatQuantity(line.quantity),
        valueOrDash(line.unit),
        formatAmount(line.unit_price),
        valueOrDash(line.note),
        formatAmount(line.total_amount),
      ]),
      totalLabel: "Total subempreitadas",
      totalValue: formatAmount(quote.subcontracts_total),
    },
    {
      title: "Viatura / equipamento",
      columns: [
        { label: "Descrição", width: 145 },
        { label: "Quantidade", width: 68 },
        { label: "Unidade", width: 53 },
        { label: "Preço unitário", width: 78 },
        { label: "Nota", width: 119 },
        { label: "Total", width: 78 },
      ],
      rows: source.equipment.map((line) => [
        valueOrDash(line.description),
        formatQuantity(line.quantity),
        valueOrDash(line.unit),
        formatAmount(line.unit_price),
        valueOrDash(line.note),
        formatAmount(line.total_amount),
      ]),
      totalLabel: "Total viatura / equipamento",
      totalValue: formatAmount(quote.equipment_total),
    },
    {
      title: "Acréscimos · por ordem de aplicação",
      columns: [
        { label: "#", width: 24 },
        { label: "Nome", width: 115 },
        { label: "Base", width: 143 },
        { label: "Taxa", width: 60 },
        { label: "Base calculada", width: 112 },
        { label: "Valor", width: 87 },
      ],
      rows: source.surcharges.map((line, index) => [
        String(index + 1),
        valueOrDash(line.name),
        surchargeBaseLabels[asText(line.base_type)] ?? valueOrDash(line.base_type),
        formatRate(line.rate),
        formatAmount(line.base_amount),
        formatAmount(line.amount),
      ]),
      totalLabel: "Total de acréscimos",
      totalValue: formatAmount(quote.surcharges_total),
    },
  ];

  const financialSummary: InternalPdfField[] = [
    { label: "Materiais", value: formatAmount(quote.materials_total) },
    { label: "Mão de obra", value: formatAmount(quote.labor_total) },
    { label: "Subempreitadas", value: formatAmount(quote.subcontracts_total) },
    { label: "Equipamento", value: formatAmount(quote.equipment_total) },
    { label: "Custos diretos", value: formatAmount(quote.direct_costs_total) },
    { label: "Acréscimos", value: formatAmount(quote.surcharges_total) },
    { label: "Custo total", value: formatAmount(quote.total_cost) },
    { label: "Preço recomendado", value: formatAmount(quote.recommended_gross) },
    ...(hasValue(quote.manual_gross)
      ? [{ label: "Preço manual", value: formatAmount(quote.manual_gross) }]
      : []),
    { label: "Preço utilizado", value: formatAmount(quote.gross_used) },
    { label: "Valor líquido", value: formatAmount(quote.net_value) },
    { label: "Lucro", value: formatAmount(quote.profit) },
    { label: "Margem real", value: formatRate(quote.real_margin) },
    { label: "Horas totais", value: `${formatQuantity(quote.total_hours)} h` },
    {
      label: "Valor líquido / m²",
      value: area.isZero() ? "—" : formatAmount(decimalValue(quote.net_value).div(area).toString()),
    },
    ...(fixedDeduction.gt(0) && !area.isZero()
      ? [{
          label: "Dedução / m²",
          value: formatAmount(fixedDeduction.div(area).toString()),
        }]
      : []),
    {
      label: "Valor líquido / hora",
      value: totalHours.isZero()
        ? "—"
        : formatAmount(decimalValue(quote.net_value).div(totalHours).toString()),
    },
  ];

  return {
    quoteNumber: asText(quote.quote_number),
    quoteDate: formatDate(quote.quote_date),
    identification,
    conditions,
    tables,
    financialSummary,
  };
}

export function internalQuotePdfFilename(quoteNumber: unknown): string {
  const safeNumber = safePart(quoteNumber, "Orcamento");
  return `CP-Peixoto_Intern_${safeNumber}.pdf`;
}
