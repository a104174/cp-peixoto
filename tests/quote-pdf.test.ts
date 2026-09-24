import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import type { QuoteWithLines } from "../src/lib/backoffice/data";
import {
  buildClientQuotePdfModel,
  buildInternalQuotePdfModel,
  clientQuotePdfFilename,
  formatSwissAmount,
  internalQuotePdfFilename,
} from "../src/lib/backoffice/pdf/model";
import { renderInternalQuotePdf } from "../src/lib/backoffice/pdf/internal-render";
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
      client_phone_snapshot: "0788752437",
      client_address_snapshot: "Bahnhofstrasse 10, 8001 Zürich",
      project_location: "Zürich",
      quote_date: "2026-09-18",
      description: "Revestimento de pavimento industrial",
      area: "120",
      area_unit: "m²",
      hourly_rate: "52",
      desired_margin: "0.1069",
      commercial_discount: "0.02",
      fixed_deduction: "150",
      client_pdf_work_description: null,
      materials_total: "8649",
      labor_total: "4264",
      subcontracts_total: "2220",
      equipment_total: "560",
      direct_costs_total: "15693",
      surcharges_total: "3898.7904",
      total_cost: "19591.7904",
      recommended_gross: "22384.529008109794136",
      manual_gross: "22485",
      gross_used: "22485",
      net_value: "21885.3",
      profit: "2293.5096",
      real_margin: "0.1048",
      total_hours: "82",
      created_at: timestamp,
      updated_at: timestamp,
    },
    materials: Array.from({ length: materialCount }, (_, index) => ({
      id: `material-${index}`,
      quote_id: "00000000-0000-0000-0000-000000000101",
      material_id: null,
      position: index,
      stage: `Etapa ${index + 1}`,
      material_name_snapshot: `Wecryl produto profissional ${index + 1}`,
      variant_snapshot: index % 3 === 0 ? "PG1" : null,
      package_snapshot: "10 kg",
      calculation_type: "per_m2" as const,
      consumption_or_quantity: "0.5",
      unit: "kg",
      unit_price: "22.22",
      area_factor: "120",
      cost_total: "1333.2",
      notes: index === 0 ? "Nota técnica interna completa" : null,
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

async function expectA4(bytes: Uint8Array): Promise<PDFDocument> {
  expect(bytes.subarray(0, 4).toString()).toBe("37,80,68,70");
  const document = await PDFDocument.load(bytes);
  expect(document.getPages().every((page) => {
    const { width, height } = page.getSize();
    return Math.abs(width - 595.28) < 0.1 && Math.abs(height - 841.89) < 0.1;
  })).toBe(true);
  return document;
}

describe("PDF interno e PDF cliente do orçamento", () => {
  it("inclui no PDF interno todos os snapshots, campos e totais guardados", () => {
    const source = quoteFixture(3);
    source.surcharges.unshift({
      ...source.surcharges[0],
      id: "surcharge-before",
      position: 0,
      name: "Primeiro acréscimo",
      base_type: "materials",
      base_amount: "8649",
      amount: "100",
    });
    source.surcharges[1].position = 1;

    const model = buildInternalQuotePdfModel(source);
    expect(model.identification).toContainEqual({ label: "Cliente", value: "José Müller & Filhos" });
    expect(model.identification).toContainEqual({ label: "Código postal / localidade", value: "8001 Zürich" });
    expect(model.conditions).toContainEqual({ label: "Preço / hora", value: "CHF 52,00" });
    expect(model.tables[0].rows[0]).toContain("Nota técnica interna completa");
    expect(model.tables[0].rows[0]).toContain("Etapa 1");
    expect(model.tables[0].rows[0][0]).toContain("10 kg");
    expect(model.tables[1].rows[0]).toContain("Nota privada de mão de obra");
    expect(model.tables[2].rows[0]).toContain("Custo reservado");
    expect(model.tables[3].rows[0]).toContain("Nota privada de equipamento");
    expect(model.tables[4].rows.map((row) => row[1])).toEqual([
      "Primeiro acréscimo",
      "Administração interna",
    ]);
    expect(model.financialSummary).toContainEqual({
      label: "Dedução / m²",
      value: "CHF 1,25",
    });
    expect(model.financialSummary).toContainEqual({
      label: "Valor líquido / m²",
      value: "CHF 182,38",
    });
    expect(model.financialSummary).toContainEqual({
      label: "Valor líquido / hora",
      value: "CHF 266,89",
    });
    expect(model.conditions.some((field) => field.label.toLocaleLowerCase().includes("skonto"))).toBe(false);
  });

  it("mantém o PDF cliente limitado aos campos comerciais autorizados", () => {
    const source = quoteFixture();
    source.quote.client_pdf_work_description = "Texto guardado previamente";
    const model = buildClientQuotePdfModel(
      { quote: source.quote },
      "Preparação do suporte.\n\nAplicação do revestimento.",
    );
    const serialized = JSON.stringify(model);

    expect(model).toMatchObject({
      quoteNumber: "CP-2026-0001",
      quoteDate: "18.09.2026",
      clientName: "José Müller & Filhos",
      objectDescription: "Revestimento de pavimento industrial",
      workDescription: ["Preparação do suporte.", "Aplicação do revestimento."],
      pauschalpreis: "CHF 21'885.30",
    });
    for (const privateValue of [
      "material_name_snapshot",
      "Nota técnica interna",
      "Funcionário João da Silva",
      "Nota privada",
      "recommended_gross",
      "profit",
      "real_margin",
      "hourly_rate",
      "unit_price",
      "materials_total",
      "22.485",
    ]) {
      expect(serialized).not.toContain(privateValue);
    }
  });

  it("usa formatação CHF suíça e nomes de ficheiro seguros", () => {
    expect(formatSwissAmount("2452")).toBe("2'452.00");
    expect(formatSwissAmount("-2452.5")).toBe("-2'452.50");
    expect(internalQuotePdfFilename("CP-2026-0001")).toBe(
      "CP-Peixoto_Intern_CP-2026-0001.pdf",
    );
    expect(clientQuotePdfFilename("CP-2026-0001", "José Müller & Filhos")).toBe(
      "CP_Peixoto_Offerte_2026-0001_Jose-Muller-Filhos.pdf",
    );
  });

  it("gera PDFs reais A4: pequeno e normal compactos; grande e notas longas em várias páginas", async () => {
    const logo = await logoBytes();
    const smallSource = quoteFixture(0);
    smallSource.labor = [];
    smallSource.subcontracts = [];
    smallSource.equipment = [];
    smallSource.surcharges = [];

    const normalSource = quoteFixture(3);
    normalSource.quote.description =
      "Preparação do suporte e aplicação de revestimento contínuo de elevada resistência para a área de produção.";

    const largeSource = quoteFixture(72);
    largeSource.labor = Array.from({ length: 18 }, (_, index) => ({
      ...quoteFixture(0).labor[0],
      id: `labor-${index}`,
      position: index,
      label: `Equipa de aplicação e preparação ${index + 1}`,
      note: `Nota de produção e deslocação da equipa ${index + 1}`,
    }));

    const longNotesSource = quoteFixture(1);
    longNotesSource.materials[0].notes =
      "Nota interna longa sobre sequência de preparação, condições do suporte, tempos de cura e verificação da superfície. ".repeat(52);

    const internalScenarios = [
      ["interno-pequeno.pdf", smallSource, 1],
      ["interno-normal.pdf", normalSource, 1],
      ["interno-grande.pdf", largeSource, 2],
      ["interno-notas-longas.pdf", longNotesSource, 2],
    ] as const;

    const pageCounts: Record<string, number> = {};
    for (const [filename, source, minimumPages] of internalScenarios) {
      const bytes = await renderInternalQuotePdf(buildInternalQuotePdfModel(source), logo);
      const document = await expectA4(bytes);
      pageCounts[filename] = document.getPageCount();
      await writeQaFixture(filename, bytes);
      expect(document.getPageCount()).toBeGreaterThanOrEqual(minimumPages);
      if (minimumPages === 1) expect(document.getPageCount()).toBe(1);
    }

    const customerSource = quoteFixture();
    const clientModel = buildClientQuotePdfModel(
      { quote: customerSource.quote },
      [
        "Vorbereitung des Untergrundes.",
        "Diamantschleifen der Betonflächen.",
        "Gründliches Absaugen und Reinigen der Flächen.",
        "Auftragen der ersten Grundierungsschicht.",
      ].join("\n"),
    );
    const clientBytes = await renderCustomerQuotePdf(clientModel, logo);
    const clientDocument = await expectA4(clientBytes);
    pageCounts["client-offerte.pdf"] = clientDocument.getPageCount();
    await writeQaFixture("client-offerte.pdf", clientBytes);

    expect(pageCounts["client-offerte.pdf"]).toBe(1);
    expect(pageCounts["interno-grande.pdf"]).toBeGreaterThan(1);
    expect(pageCounts["interno-notas-longas.pdf"]).toBeGreaterThan(1);
  });
});
