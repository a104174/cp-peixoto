import {
  PDFDocument,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import type {
  InternalPdfColumn,
  InternalPdfField,
  InternalPdfTable,
  InternalQuotePdfModel,
} from "./model";
import {
  A4_HEIGHT,
  A4_WIDTH,
  embedPdfAssets,
  safeFontText,
  wrapPdfText,
  type PdfFonts,
} from "./shared";

const MARGIN_X = 26;
const CONTENT_WIDTH = A4_WIDTH - MARGIN_X * 2;
const CONTENT_BOTTOM = 40;
const FOOTER_Y = 21;
const colors = {
  accent: rgb(0.68, 0.49, 0.23),
  accentSoft: rgb(0.95, 0.92, 0.85),
  background: rgb(0.995, 0.992, 0.98),
  border: rgb(0.83, 0.82, 0.78),
  charcoal: rgb(0.12, 0.14, 0.13),
  muted: rgb(0.38, 0.4, 0.38),
  row: rgb(0.975, 0.972, 0.955),
  white: rgb(1, 1, 1),
};

type LayoutProfile = {
  bodySize: number;
  bodyLeading: number;
  sectionGap: number;
};

function fontSafe(value: string, font: PDFFont): string {
  return safeFontText(value.replace(/\r?\n/g, " "), font);
}

class InternalQuotePdfComposer {
  private page!: PDFPage;
  private y = 0;
  private readonly pages: PDFPage[] = [];
  private readonly availableWidths = [
    (CONTENT_WIDTH - 11) / 2,
    (CONTENT_WIDTH - 11) / 2,
  ];

  constructor(
    private readonly document: PDFDocument,
    private readonly fonts: PdfFonts,
    private readonly logo: PDFImage | null,
    private readonly model: InternalQuotePdfModel,
    private readonly profile: LayoutProfile,
  ) {}

  compose(): void {
    this.addPage(true);
    this.drawFields("IDENTIFICAÇÃO", this.model.identification);
    this.drawFields("CONDIÇÕES / DADOS GERAIS", this.model.conditions);
    for (const table of this.model.tables) this.drawTable(table);
    this.drawFinancialSummary();
    this.drawFooters();
  }

  private addPage(first: boolean): void {
    this.page = this.document.addPage([A4_WIDTH, A4_HEIGHT]);
    this.pages.push(this.page);
    this.page.drawRectangle({
      x: 0,
      y: 0,
      width: A4_WIDTH,
      height: A4_HEIGHT,
      color: colors.background,
    });

    if (first) {
      this.drawFirstHeader();
      this.y = 766;
      return;
    }

    this.drawContinuationHeader();
    this.y = 790;
  }

  private drawFirstHeader(): void {
    if (this.logo) {
      this.page.drawImage(this.logo, {
        x: MARGIN_X,
        y: 784,
        width: 34,
        height: 34,
      });
    }
    this.text("CP PEIXOTO", MARGIN_X + 43, 808, 12, this.fonts.bold, colors.charcoal);
    this.text(
      "USO INTERNO · ESPELHO DO ORÇAMENTO",
      MARGIN_X + 43,
      792,
      7.8,
      this.fonts.regular,
      colors.muted,
    );
    this.rightText(
      this.model.quoteNumber,
      A4_WIDTH - MARGIN_X,
      808,
      11,
      this.fonts.bold,
      colors.charcoal,
    );
    this.rightText(
      this.model.quoteDate,
      A4_WIDTH - MARGIN_X,
      792,
      8.2,
      this.fonts.regular,
      colors.muted,
    );
    this.page.drawLine({
      start: { x: MARGIN_X, y: 779 },
      end: { x: A4_WIDTH - MARGIN_X, y: 779 },
      thickness: 0.75,
      color: colors.border,
    });
    this.page.drawLine({
      start: { x: MARGIN_X, y: 779 },
      end: { x: MARGIN_X + 48, y: 779 },
      thickness: 2,
      color: colors.accent,
    });
  }

  private drawContinuationHeader(): void {
    this.text("CP PEIXOTO · ORÇAMENTO INTERNO", MARGIN_X, 811, 8.5, this.fonts.bold, colors.charcoal);
    this.rightText(
      `${this.model.quoteNumber} · ${this.model.quoteDate}`,
      A4_WIDTH - MARGIN_X,
      811,
      8,
      this.fonts.regular,
      colors.muted,
    );
    this.page.drawLine({
      start: { x: MARGIN_X, y: 799 },
      end: { x: A4_WIDTH - MARGIN_X, y: 799 },
      thickness: 0.6,
      color: colors.border,
    });
  }

  private sectionTitle(title: string, continued = false): void {
    const value = continued ? `${title} · continuação` : title;
    const size = Math.max(8, this.profile.bodySize - 0.2);
    this.text(
      value.toLocaleUpperCase("pt-PT"),
      MARGIN_X,
      this.y - size,
      size,
      this.fonts.bold,
      colors.accent,
    );
    this.page.drawLine({
      start: { x: MARGIN_X, y: this.y - size - 2.5 },
      end: { x: A4_WIDTH - MARGIN_X, y: this.y - size - 2.5 },
      thickness: 0.45,
      color: colors.border,
    });
    this.y -= size + 5.5;
  }

  private beginSection(title: string, minimumHeight = 14): void {
    if (this.y - (this.profile.bodySize + 8 + minimumHeight) < CONTENT_BOTTOM) {
      this.addPage(false);
      this.sectionTitle(title, true);
      return;
    }
    this.sectionTitle(title);
  }

  private drawFields(title: string, fields: InternalPdfField[]): void {
    this.beginSection(title, this.profile.bodyLeading + 5);
    for (let index = 0; index < fields.length; index += 2) {
      const row = fields.slice(index, index + 2);
      const prepared = row.map((field, columnIndex) => ({
        field,
        x: MARGIN_X + (columnIndex === 1 ? this.availableWidths[0] + 11 : 0),
        width: this.availableWidths[columnIndex],
        lines: wrapPdfText(
          fontSafe(field.value, this.fonts.regular),
          this.fonts.regular,
          this.profile.bodySize,
          this.availableWidths[columnIndex],
        ),
      }));
      const maxLines = Math.max(...prepared.map((item) => item.lines.length), 1);
      const rowHeight = 6.5 + maxLines * this.profile.bodyLeading + 1.3;
      if (this.y - rowHeight < CONTENT_BOTTOM) {
        this.addPage(false);
        this.sectionTitle(title, true);
      }

      prepared.forEach((item) => {
        const labelSize = Math.max(7.4, this.profile.bodySize - 1.2);
        this.text(
          item.field.label,
          item.x,
          this.y - 7.5,
          labelSize,
          this.fonts.bold,
          colors.muted,
        );
        item.lines.forEach((line, lineIndex) => {
          this.text(
            line,
            item.x,
            this.y - 15 - lineIndex * this.profile.bodyLeading,
            this.profile.bodySize,
            this.fonts.regular,
            colors.charcoal,
          );
        });
      });
      this.y -= rowHeight;
    }
    this.y -= this.profile.sectionGap;
  }

  private drawTable(table: InternalPdfTable): void {
    const headerHeight = this.tableHeaderHeight(table.columns);
    this.beginSection(table.title, headerHeight + this.profile.bodyLeading + 4);
    this.drawTableHeader(table);

    if (table.rows.length === 0) {
      const emptyHeight = this.profile.bodyLeading + 2.5;
      if (this.y - emptyHeight < CONTENT_BOTTOM) {
        this.addPage(false);
        this.sectionTitle(table.title, true);
        this.drawTableHeader(table);
      }
      this.page.drawRectangle({
        x: MARGIN_X,
        y: this.y - emptyHeight,
        width: CONTENT_WIDTH,
        height: emptyHeight,
        color: colors.white,
        borderColor: colors.border,
        borderWidth: 0.35,
      });
      this.text(
        "Sem linhas",
        MARGIN_X + 3,
        this.y - this.profile.bodySize - 1,
        this.profile.bodySize,
        this.fonts.regular,
        colors.muted,
      );
      this.y -= emptyHeight;
    }

    const rows = table.rows;

    rows.forEach((row, rowIndex) => {
      const wrapped = table.columns.map((column, columnIndex) =>
        wrapPdfText(
          fontSafe(row[columnIndex] ?? "", this.fonts.regular),
          this.fonts.regular,
          this.profile.bodySize,
          Math.max(8, column.width - 6),
        ),
      );
      const lineCount = Math.max(...wrapped.map((cell) => cell.length), 1);
      const rowHeight = lineCount * this.profile.bodyLeading + 2.5;
      const maxWholeRowHeight = A4_HEIGHT - 130;

      if (rowHeight <= maxWholeRowHeight) {
        if (this.y - rowHeight < CONTENT_BOTTOM) {
          this.addPage(false);
          this.sectionTitle(table.title, true);
          this.drawTableHeader(table);
        }
        this.drawTableRow(table.columns, wrapped, 0, lineCount, rowHeight, rowIndex % 2 === 1);
        return;
      }

      let offset = 0;
      while (offset < lineCount) {
        const possibleLines = Math.floor(
          (this.y - CONTENT_BOTTOM - 5) / this.profile.bodyLeading,
        );
        if (possibleLines < 1) {
          this.addPage(false);
          this.sectionTitle(table.title, true);
          this.drawTableHeader(table);
          continue;
        }
        const chunkLines = Math.min(possibleLines, lineCount - offset);
        const chunkHeight = chunkLines * this.profile.bodyLeading + 2.5;
        this.drawTableRow(table.columns, wrapped, offset, chunkLines, chunkHeight, rowIndex % 2 === 1);
        offset += chunkLines;
        if (offset < lineCount) {
          this.addPage(false);
          this.sectionTitle(table.title, true);
          this.drawTableHeader(table);
        }
      }
    });

    const totalHeight = this.profile.bodyLeading + 2.5;
    if (this.y - totalHeight < CONTENT_BOTTOM) {
      this.addPage(false);
      this.sectionTitle(table.title, true);
      this.drawTableHeader(table);
    }
    this.drawTableTotal(table);
    this.y -= this.profile.sectionGap;
  }

  private tableHeaderHeight(columns: InternalPdfColumn[]): number {
    const fontSize = Math.max(7.1, this.profile.bodySize - 0.9);
    const leading = fontSize + 0.2;
    const maxLines = Math.max(
      ...columns.map((column) =>
        wrapPdfText(column.label, this.fonts.bold, fontSize, column.width - 5).length,
      ),
      1,
    );
    return maxLines * leading + 3.5;
  }

  private drawTableHeader(table: InternalPdfTable): void {
    const height = this.tableHeaderHeight(table.columns);
    const top = this.y;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: top - height,
      width: CONTENT_WIDTH,
      height,
      color: colors.accentSoft,
      borderColor: colors.border,
      borderWidth: 0.4,
    });
    const fontSize = Math.max(7.1, this.profile.bodySize - 0.9);
    const leading = fontSize + 0.2;
    let x = MARGIN_X;
    table.columns.forEach((column) => {
      const lines = wrapPdfText(column.label, this.fonts.bold, fontSize, column.width - 5);
      lines.forEach((line, index) => {
        this.text(
          line,
          x + 2.5,
          top - fontSize - 1.5 - index * leading,
          fontSize,
          this.fonts.bold,
          colors.charcoal,
        );
      });
      x += column.width;
    });
    this.y -= height;
  }

  private drawTableRow(
    columns: InternalPdfColumn[],
    wrapped: string[][],
    offset: number,
    lineCount: number,
    height: number,
    alternate: boolean,
  ): void {
    const top = this.y;
    const totalWidth = columns.reduce((sum, column) => sum + column.width, 0);
    this.page.drawRectangle({
      x: MARGIN_X,
      y: top - height,
      width: totalWidth,
      height,
      color: alternate ? colors.row : colors.white,
      borderColor: colors.border,
      borderWidth: 0.35,
    });
    let x = MARGIN_X;
    columns.forEach((column, columnIndex) => {
      if (columnIndex > 0) {
        this.page.drawLine({
          start: { x, y: top },
          end: { x, y: top - height },
          thickness: 0.25,
          color: colors.border,
        });
      }
      const lines = wrapped[columnIndex].slice(offset, offset + lineCount);
      lines.forEach((line, index) => {
        this.text(
          line,
          x + 2.5,
          top - this.profile.bodySize - 1 - index * this.profile.bodyLeading,
          this.profile.bodySize,
          this.fonts.regular,
          colors.charcoal,
        );
      });
      x += column.width;
    });
    this.y -= height;
  }

  private drawTableTotal(table: InternalPdfTable): void {
    const height = this.profile.bodyLeading + 2.5;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.y - height,
      width: CONTENT_WIDTH,
      height,
      color: colors.row,
      borderColor: colors.border,
      borderWidth: 0.4,
    });
    this.text(
      table.totalLabel ?? "Total",
      MARGIN_X + 4,
      this.y - this.profile.bodySize - 1,
      this.profile.bodySize,
      this.fonts.bold,
      colors.charcoal,
    );
    this.rightText(
      table.totalValue,
      A4_WIDTH - MARGIN_X - 4,
      this.y - this.profile.bodySize - 1,
      this.profile.bodySize,
      this.fonts.bold,
      colors.charcoal,
    );
    this.y -= height;
  }

  private drawFinancialSummary(): void {
    const columns = 4;
    const gap = 7;
    const cellWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
    const summaryRows: InternalPdfField[][] = [];
    for (let index = 0; index < this.model.financialSummary.length; index += columns) {
      summaryRows.push(this.model.financialSummary.slice(index, index + columns));
    }
    const size = Math.max(7.6, this.profile.bodySize - 0.1);
    const leading = size + 0.45;

    this.beginSection("RESUMO FINANCEIRO", summaryRows.length * (leading * 2 + 3));
    summaryRows.forEach((row) => {
      const prepared = row.map((field, columnIndex) => {
        const x = MARGIN_X + columnIndex * (cellWidth + gap);
        return {
          field,
          x,
          labelLines: wrapPdfText(field.label, this.fonts.bold, Math.max(7.1, size - 0.7), cellWidth),
          valueLines: wrapPdfText(field.value, this.fonts.regular, size, cellWidth),
        };
      });
      const maxLines = Math.max(
        ...prepared.map((item) => item.labelLines.length + item.valueLines.length),
        2,
      );
      const height = maxLines * leading + 1.5;
      if (this.y - height < CONTENT_BOTTOM) {
        this.addPage(false);
        this.sectionTitle("RESUMO FINANCEIRO", true);
      }
      prepared.forEach((item) => {
        item.labelLines.forEach((line) => {
          this.text(
            line,
            item.x,
            this.y - Math.max(7.1, size - 0.7),
            Math.max(7.1, size - 0.7),
            this.fonts.bold,
            colors.muted,
          );
        });
        item.valueLines.forEach((line, index) => {
          this.text(
            line,
            item.x,
            this.y - item.labelLines.length * leading - size - index * leading,
            size,
            this.fonts.regular,
            colors.charcoal,
          );
        });
      });
      this.page.drawLine({
        start: { x: MARGIN_X, y: this.y - height + 1 },
        end: { x: A4_WIDTH - MARGIN_X, y: this.y - height + 1 },
        thickness: 0.25,
        color: colors.border,
      });
      this.y -= height;
    });
  }

  private drawFooters(): void {
    this.pages.forEach((page, index) => {
      page.drawLine({
        start: { x: MARGIN_X, y: 34 },
        end: { x: A4_WIDTH - MARGIN_X, y: 34 },
        thickness: 0.5,
        color: colors.border,
      });
      this.textOnPage(
        page,
        `CP Peixoto · Interno · ${this.model.quoteNumber}`,
        MARGIN_X,
        FOOTER_Y,
        7,
        this.fonts.regular,
        colors.muted,
      );
      this.rightTextOnPage(
        page,
        `Página ${index + 1} de ${this.pages.length}`,
        A4_WIDTH - MARGIN_X,
        FOOTER_Y,
        7,
        this.fonts.regular,
        colors.muted,
      );
    });
  }

  private text(
    value: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    this.textOnPage(this.page, value, x, y, size, font, color);
  }

  private textOnPage(
    page: PDFPage,
    value: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    page.drawText(fontSafe(value, font), { x, y, size, font, color });
  }

  private rightText(
    value: string,
    right: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    this.rightTextOnPage(this.page, value, right, y, size, font, color);
  }

  private rightTextOnPage(
    page: PDFPage,
    value: string,
    right: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    const safe = fontSafe(value, font);
    const width = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: right - width, y, size, font, color });
  }
}

async function composeAtSize(
  model: InternalQuotePdfModel,
  logoBytes: Uint8Array | undefined,
  bodySize: number,
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const { fonts, logo } = await embedPdfAssets(document, logoBytes);
  document.setTitle(`Orçamento interno ${model.quoteNumber}`);
  document.setAuthor("CP Peixoto");
  document.setCreator("Backoffice CP Peixoto");
  document.setProducer("CP Peixoto");
  document.setSubject("Documento interno do orçamento");

  new InternalQuotePdfComposer(
    document,
    fonts,
    logo,
    model,
    { bodySize, bodyLeading: bodySize + 0.45, sectionGap: 1.5 },
  ).compose();
  return document.save({ useObjectStreams: true });
}

export async function renderInternalQuotePdf(
  model: InternalQuotePdfModel,
  logoBytes?: Uint8Array,
): Promise<Uint8Array> {
  let lastAttempt: Uint8Array | null = null;
  for (const bodySize of [9.2, 8.8, 8.4]) {
    const bytes = await composeAtSize(model, logoBytes, bodySize);
    lastAttempt = bytes;
    if ((await PDFDocument.load(bytes)).getPageCount() === 1) return bytes;
  }
  return lastAttempt ?? composeAtSize(model, logoBytes, 8.4);
}
