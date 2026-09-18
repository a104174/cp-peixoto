import Decimal from "decimal.js";

import {
  formatMoney,
  formatNumber,
  formatPercent,
} from "../../../domain/quotes/format";
import type { QuoteWithLines } from "../data";

export type CustomerPdfField = {
  label: string;
  value: string;
};

export type CustomerPdfScopeSection = {
  title: string;
  items: string[];
};

export type CustomerPdfCommercialLine = {
  label: string;
  value: string;
};

export type CustomerQuotePdfModel = {
  quoteNumber: string;
  quoteDate: string;
  clientName: string | null;
  clientFields: CustomerPdfField[];
  projectFields: CustomerPdfField[];
  scope: CustomerPdfScopeSection[];
  commercialLines: CustomerPdfCommercialLine[];
  netTotal: string;
};

function cleanText(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized || null;
}

function positiveDecimal(value: string | number | null | undefined): boolean {
  try {
    return new Decimal(value ?? 0).gt(0);
  } catch {
    return false;
  }
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function formatArea(
  value: string | number | null | undefined,
  unit: string,
): string | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  try {
    const formatted = formatNumber(value, 2).replace(/,00$/, "");
    return `${formatted} ${unit}`.trim();
  } catch {
    return null;
  }
}

function splitAddressSnapshot(value: string | null): CustomerPdfField[] {
  const address = cleanText(value);
  if (!address) return [];

  const separator = address.lastIndexOf(", ");
  if (separator === -1) {
    return [{ label: "Morada", value: address }];
  }

  const street = cleanText(address.slice(0, separator));
  const postalLocality = cleanText(address.slice(separator + 2));
  return [
    ...(street ? [{ label: "Morada", value: street }] : []),
    ...(postalLocality
      ? [{ label: "Código postal / localidade", value: postalLocality }]
      : []),
  ];
}

function uniqueItems(values: Array<string | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const key = value.toLocaleLowerCase("pt-PT");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function materialLabel(
  name: string,
  variant: string | null,
): string | null {
  const parts = [cleanText(name), cleanText(variant)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function buildCustomerQuotePdfModel(
  source: QuoteWithLines,
): CustomerQuotePdfModel {
  const { quote } = source;
  const clientFields: CustomerPdfField[] = [
    ...splitAddressSnapshot(quote.client_address_snapshot),
    ...(cleanText(quote.client_email_snapshot)
      ? [{ label: "Email", value: cleanText(quote.client_email_snapshot)! }]
      : []),
    ...(cleanText(quote.client_phone_snapshot)
      ? [{ label: "Telefone", value: cleanText(quote.client_phone_snapshot)! }]
      : []),
  ];

  const area = formatArea(quote.area, quote.area_unit);
  const projectFields: CustomerPdfField[] = [
    ...(cleanText(quote.description)
      ? [{ label: "Descrição", value: cleanText(quote.description)! }]
      : []),
    ...(cleanText(quote.project_location)
      ? [{ label: "Local da obra", value: cleanText(quote.project_location)! }]
      : []),
    ...(area ? [{ label: "Área", value: area }] : []),
  ];

  const materials = uniqueItems(
    source.materials.map((line) =>
      materialLabel(line.material_name_snapshot, line.variant_snapshot),
    ),
  );
  const subcontracts = uniqueItems(
    source.subcontracts.map((line) => cleanText(line.description)),
  );
  const equipment = uniqueItems(
    source.equipment.map((line) => cleanText(line.description)),
  );

  const scope: CustomerPdfScopeSection[] = [
    ...(materials.length > 0 ? [{ title: "Materiais", items: materials }] : []),
    ...(source.labor.length > 0
      ? [{ title: "Mão de obra", items: ["Execução dos trabalhos previstos"] }]
      : []),
    ...(subcontracts.length > 0
      ? [{ title: "Subempreitadas", items: subcontracts }]
      : []),
    ...(equipment.length > 0
      ? [{ title: "Viatura / equipamento", items: equipment }]
      : []),
  ];

  const commercialLines: CustomerPdfCommercialLine[] = [
    { label: "Preço base", value: formatMoney(quote.gross_used) },
    ...(positiveDecimal(quote.commercial_discount)
      ? [
          {
            label: "Desconto comercial",
            value: `-${formatPercent(quote.commercial_discount)}`,
          },
        ]
      : []),
    ...(positiveDecimal(quote.skonto)
      ? [{ label: "Skonto", value: `-${formatPercent(quote.skonto)}` }]
      : []),
    ...(positiveDecimal(quote.fixed_deduction)
      ? [
          {
            label: "Dedução fixa",
            value: `-${formatMoney(quote.fixed_deduction)}`,
          },
        ]
      : []),
  ];

  return {
    quoteNumber: quote.quote_number,
    quoteDate: formatDate(quote.quote_date),
    clientName: cleanText(quote.client_name_snapshot),
    clientFields,
    projectFields,
    scope,
    commercialLines,
    netTotal: formatMoney(quote.net_value),
  };
}

export function quotePdfFilename(
  quoteNumber: string,
  clientName: string | null,
): string {
  const safePart = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72);

  const quote = safePart(quoteNumber) || "Orcamento";
  const client = clientName ? safePart(clientName) : "Sem-cliente";
  return `CP-Peixoto_${quote}_${client || "Sem-cliente"}.pdf`;
}
