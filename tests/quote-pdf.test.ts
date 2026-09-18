import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import type { QuoteWithLines } from "../src/lib/backoffice/data";
import {
  buildCustomerQuotePdfModel,
  quotePdfFilename,
} from "../src/lib/backoffice/pdf/model";
import { renderCustomerQuotePdf } from "../src/lib/backoffice/pdf/render";

function quoteFixture(materialCount = 2): QuoteWithLines {
  const timestamp = "2026-09-18T10:00:00.000Z";
  return {
    quote: {
      id: "00000000-0000-0000-0000-000000000101",
      quote_number: "CP-2026-0001",
      client_id: "00000000-0000-0000-0000-000000000201",
      client_name_snapshot: "José Müller & Filhos",
      client_email_snapshot: "jose@example.ch",
      client_phone_snapshot: "+41 79 111 22 33",
      client_address_snapshot: "Bahnhofstrasse 10, 8001 Zürich",
      project_location: "Zürich",
      quote_date: "2026-09-18",
      description: "Revestimento de pavimento industrial",
      area: "120",
      area_unit: "m²",
      hourly_rate: "52",
      desired_margin: "0.1069",
      commercial_discount: "0.02",
      skonto: "0.02",
      fixed_deduction: "150",
      materials_total: "8649",
      labor_total: "4264",
      subcontracts_total: "2220",
      equipment_total: "560",
      direct_costs_total: "15693",
      surcharges_total: "3898.7904",
      total_cost: "19591.7904",
      recommended_gross: "22841.3561307",
      manual_gross: "22485",
      gross_used: "22485",
      net_value: "21444.594",
      profit: "1852.8036",
      real_margin: "0.0864",
      total_hours: "82",
      created_at: timestamp,
      updated_at: timestamp,
    },
    materials: Array.from({ length: materialCount }, (_, index) => ({
      id: `material-${index}`,
      quote_id: "00000000-0000-0000-0000-000000000101",
      material_id: null,
      position: index,
      stage: "Aplicação interna",
      material_name_snapshot: `Wecryl produto profissional ${index + 1}`,
      variant_snapshot: index % 3 === 0 ? "PG1" : null,
      package_snapshot: "10 kg",
      calculation_type: "per_m2" as const,
      consumption_or_quantity: "0.5",
      unit: "kg",
      unit_price: "22.22",
      area_factor: "120",
      cost_total: "1333.2",
      notes: "Nota técnica interna que não pode aparecer",
      created_at: timestamp,
      updated_at: timestamp,
    })),
    labor: [
      {
        id: "labor-1",
        quote_id: "00000000-0000-0000-0000-000000000101",
        position: 0,
        label: "Funcionário João da Silva",
        people: "2",
        work_hours_per_person: "36",
        travel_hours_per_person: "5",
        total_hours: "82",
        hourly_rate: "52",
        cost_total: "4264",
        note: "Nota privada de mão de obra",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    subcontracts: [
      {
        id: "subcontract-1",
        quote_id: "00000000-0000-0000-0000-000000000101",
        position: 0,
        description: "Preparação mecânica",
        quantity: "1",
        unit: "un.",
        unit_price: "2220",
        total_amount: "2220",
        note: "Custo reservado",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    equipment: [
      {
        id: "equipment-1",
        quote_id: "00000000-0000-0000-0000-000000000101",
        position: 0,
        description: "Viatura / bomba",
        quantity: "1",
        unit: "un.",
        unit_price: "560",
        total_amount: "560",
        note: "Nota privada de equipamento",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    surcharges: [
      {
        id: "surcharge-1",
        quote_id: "00000000-0000-0000-0000-000000000101",
        position: 0,
        name: "Administração interna",
        base_type: "direct_costs",
        rate: "0.12",
        base_amount: "15693",
        amount: "1883.16",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
  };
}

async function logoBytes(): Promise<Uint8Array> {
  return new Uint8Array(
    await readFile(
      new URL("../public/brand/cp-peixoto-logo.png", import.meta.url),
    ),
  );
}

async function writeQaFixture(name: string, bytes: Uint8Array): Promise<void> {
  const outputDirectory = process.env.PDF_QA_OUTPUT;
  if (!outputDirectory) return;
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, name), bytes);
}

describe("PDF comercial do orçamento", () => {
  it("projeta apenas informação destinada ao cliente", () => {
    const model = buildCustomerQuotePdfModel(quoteFixture());
    const serialized = JSON.stringify(model);

    expect(model).toMatchObject({
      quoteNumber: "CP-2026-0001",
      quoteDate: "18.09.2026",
      clientName: "José Müller & Filhos",
      netTotal: "CHF 21.444,59",
    });
    expect(model.scope).toEqual([
      {
        title: "Materiais",
        items: [
          "Wecryl produto profissional 1 · PG1",
          "Wecryl produto profissional 2",
        ],
      },
      { title: "Mão de obra", items: ["Execução dos trabalhos previstos"] },
      { title: "Subempreitadas", items: ["Preparação mecânica"] },
      { title: "Viatura / equipamento", items: ["Viatura / bomba"] },
    ]);
    expect(model.commercialLines).toEqual([
      { label: "Preço base", value: "CHF 22.485,00" },
      { label: "Desconto comercial", value: "-2,00%" },
      { label: "Skonto", value: "-2,00%" },
      { label: "Dedução fixa", value: "-CHF 150,00" },
    ]);

    for (const privateValue of [
      "Funcionário João da Silva",
      "Nota técnica interna",
      "Nota privada",
      "Administração interna",
      "recommended_gross",
      "profit",
      "real_margin",
      "hourly_rate",
      "unit_price",
    ]) {
      expect(serialized).not.toContain(privateValue);
    }
  });

  it("omite linhas comerciais e secções vazias", () => {
    const source = quoteFixture(0);
    source.quote.commercial_discount = "0";
    source.quote.skonto = null;
    source.quote.fixed_deduction = "0";
    source.labor = [];
    source.subcontracts = [];
    source.equipment = [];

    const model = buildCustomerQuotePdfModel(source);
    expect(model.scope).toEqual([]);
    expect(model.commercialLines).toEqual([
      { label: "Preço base", value: "CHF 22.485,00" },
    ]);
  });

  it("cria um filename seguro e previsível", () => {
    expect(quotePdfFilename("CP-2026-0001", "José Müller & Filhos")).toBe(
      "CP-Peixoto_CP-2026-0001_Jose-Muller-Filhos.pdf",
    );
    expect(quotePdfFilename("CP-2026-0002", null)).toBe(
      "CP-Peixoto_CP-2026-0002_Sem-cliente.pdf",
    );
  });

  it("gera PDFs A4 válidos para os cenários de QA", async () => {
    const logo = await logoBytes();
    const smallSource = quoteFixture(0);
    smallSource.labor = [];
    smallSource.subcontracts = [];
    smallSource.equipment = [];
    smallSource.surcharges = [];
    const completeSource = quoteFixture(8);
    const longSource = quoteFixture(72);

    const scenarios = [
      ["orcamento-pequeno.pdf", smallSource, 1],
      ["orcamento-varias-seccoes.pdf", completeSource, 1],
      ["orcamento-multipagina.pdf", longSource, 2],
    ] as const;

    for (const [filename, source, minimumPages] of scenarios) {
      const bytes = await renderCustomerQuotePdf(
        buildCustomerQuotePdfModel(source),
        logo,
      );
      const document = await PDFDocument.load(bytes);
      expect(bytes.subarray(0, 4).toString()).toBe("37,80,68,70");
      expect(document.getPages().every((page) => {
        const { width, height } = page.getSize();
        return Math.abs(width - 595.28) < 0.1 && Math.abs(height - 841.89) < 0.1;
      })).toBe(true);
      expect(document.getPageCount()).toBeGreaterThanOrEqual(minimumPages);
      await writeQaFixture(filename, bytes);
    }
  });
});
