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

function formatSwissPhone(value: string | null): string | null {
  if (!value) return null;

  const compact = value.replace(/[\s()./-]/g, "");
  const digits = compact.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }

  let international = digits;
  if (international.startsWith("0041")) international = international.slice(2);
  if (international.startsWith("410") && international.length === 12) {
    international = `41${international.slice(3)}`;
  }
  if (international.startsWith("41") && international.length === 11) {
    const national = international.slice(2);
    return `+41 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 7)} ${national.slice(7)}`;
  }

  return value;
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
  const materialName = cleanText(name);
  const materialVariant = cleanText(variant);
  if (!materialName) return materialVariant;
  if (!materialVariant) return materialName;

  const normalizedName = materialName.toLocaleLowerCase("pt-PT");
  const normalizedVariant = materialVariant.toLocaleLowerCase("pt-PT");
  const variantAlreadyVisible =
    normalizedName === normalizedVariant ||
    normalizedName.endsWith(` ${normalizedVariant}`) ||
    normalizedName.endsWith(` · ${normalizedVariant}`) ||
    normalizedName.endsWith(` / ${normalizedVariant}`);

  return variantAlreadyVisible
    ? materialName
    : `${materialName} · ${materialVariant}`;
}

export function buildCustomerQuotePdfModel(
  source: QuoteWithLines,
): CustomerQuotePdfModel {
  const { quote } = source;
  const clientEmail = cleanText(quote.client_email_snapshot);
  const clientPhone = formatSwissPhone(cleanText(quote.client_phone_snapshot));
  const clientFields: CustomerPdfField[] = [
    ...splitAddressSnapshot(quote.client_address_snapshot),
    ...(clientEmail ? [{ label: "Email", value: clientEmail }] : []),
    ...(clientPhone ? [{ label: "Telefone", value: clientPhone }] : []),
  ];

  const area = formatArea(quote.area, quote.area_unit);
  const description = cleanText(quote.description);
  const projectLocation = cleanText(quote.project_location);
  const projectFields: CustomerPdfField[] = [
    ...(description ? [{ label: "Descrição", value: description }] : []),
    ...(projectLocation
      ? [{ label: "Local da obra", value: projectLocation }]
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
