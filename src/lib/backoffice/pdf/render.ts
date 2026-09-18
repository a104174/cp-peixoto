import {
  PageSizes,
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import type {
  CustomerPdfField,
  CustomerPdfScopeSection,
  CustomerQuotePdfModel,
} from "./model";

const PAGE_WIDTH = PageSizes.A4[0];
const PAGE_HEIGHT = PageSizes.A4[1];
const MARGIN_X = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_BOTTOM = 68;

const colors = {
  accent: rgb(0.68, 0.49, 0.23),
  accentSoft: rgb(0.94, 0.9, 0.81),
  background: rgb(0.985, 0.978, 0.957),
  border: rgb(0.84, 0.82, 0.77),
  charcoal: rgb(0.12, 0.14, 0.13),
  muted: rgb(0.38, 0.4, 0.38),
  subtle: rgb(0.55, 0.56, 0.53),
  white: rgb(1, 1, 1),
};

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
};

function fontSafeText(value: string, font: PDFFont): string {
  let safe = "";
  for (const character of value) {
    try {
      font.encodeText(character);
      safe += character;
    } catch {
      safe += "?";
    }
  }
  return safe;
}

function splitLongWord(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const character of value) {
    const candidate = `${current}${character}`;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function wrapText(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const safe = fontSafeText(value.replace(/\s+/g, " ").trim(), font);
  if (!safe) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of safe.split(" ")) {
    const wordChunks =
      font.widthOfTextAtSize(word, size) > maxWidth
        ? splitLongWord(word, font, size, maxWidth)
        : [word];

    for (const chunk of wordChunks) {
      const candidate = current ? `${current} ${chunk}` : chunk;
      if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(current);
        current = chunk;
      } else {
        current = candidate;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

class QuotePdfComposer {
  private page!: PDFPage;
  private y = 0;

  constructor(
    private readonly document: PDFDocument,
    private readonly fonts: Fonts,
    private readonly model: CustomerQuotePdfModel,
    private readonly logo: PDFImage | null,
  ) {}

  compose(): void {
    this.addPage(true);
    this.drawClient();
    this.drawProject();
    this.drawScope();
    this.drawCommercialSummary();
    this.drawFooters();
  }

  private addPage(firstPage: boolean): void {
    this.page = this.document.addPage(PageSizes.A4);
    this.page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: colors.background,
    });

    if (firstPage) {
      this.drawFirstPageHeader();
      this.y = 700;
      return;
    }

    this.drawContinuationHeader();
    this.y = 755;
  }

  private drawFirstPageHeader(): void {
    if (this.logo) {
      this.page.drawImage(this.logo, {
        x: MARGIN_X,
        y: 745,
        width: 58,
        height: 58,
      });
    }

    const brandX = this.logo ? 120 : MARGIN_X;
    this.drawText("CP PEIXOTO", brandX, 789, 18, this.fonts.bold, colors.charcoal);
    this.drawText(
      "Bodenbeschichtungen & Abdichtungen",
      brandX,
      769,
      9.5,
      this.fonts.regular,
      colors.muted,
    );

    this.drawRightAlignedText(
      "ORÇAMENTO",
      PAGE_WIDTH - MARGIN_X,
      791,
      8,
      this.fonts.bold,
      colors.accent,
    );
    this.drawRightAlignedText(
      this.model.quoteNumber,
      PAGE_WIDTH - MARGIN_X,
      770,
      14,
      this.fonts.bold,
      colors.charcoal,
    );
    this.drawRightAlignedText(
      this.model.quoteDate,
      PAGE_WIDTH - MARGIN_X,
      751,
      9,
      this.fonts.regular,
      colors.muted,
    );

    this.page.drawLine({
      start: { x: MARGIN_X, y: 724 },
      end: { x: MARGIN_X + 82, y: 724 },
      thickness: 2,
      color: colors.accent,
    });
    this.page.drawLine({
      start: { x: MARGIN_X + 82, y: 724 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 724 },
      thickness: 0.7,
      color: colors.border,
    });
  }

  private drawContinuationHeader(): void {
    this.drawText("CP PEIXOTO", MARGIN_X, 798, 11, this.fonts.bold, colors.charcoal);
    this.drawRightAlignedText(
      this.model.quoteNumber,
      PAGE_WIDTH - MARGIN_X,
      798,
      9,
      this.fonts.bold,
      colors.muted,
    );
    this.page.drawLine({
      start: { x: MARGIN_X, y: 780 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 780 },
      thickness: 0.7,
      color: colors.border,
    });
  }

  private ensureSpace(requiredHeight: number): boolean {
    if (this.y - requiredHeight >= CONTENT_BOTTOM) return false;
    this.addPage(false);
    return true;
  }

  private drawSectionTitle(
    title: string,
    minimumContentHeight = 20,
    prominent = false,
  ): void {
    this.ensureSpace(26 + minimumContentHeight);
    this.drawText(
      title,
      MARGIN_X,
      this.y,
      prominent ? 9.2 : 8.5,
      this.fonts.bold,
      colors.accent,
    );
    this.page.drawLine({
      start: { x: MARGIN_X, y: this.y - 8 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: this.y - 8 },
      thickness: prominent ? 0.75 : 0.55,
      color: colors.border,
    });
    this.y -= prominent ? 29 : 25;
  }

  private drawClient(): void {
    const fields: CustomerPdfField[] = [
      ...(this.model.clientName
        ? [{ label: "Nome", value: this.model.clientName }]
        : []),
      ...this.model.clientFields,
    ];
    if (fields.length === 0) return;

    this.drawSectionTitle("CLIENTE", 45);
    this.drawFields(fields);
    this.y -= 8;
  }

  private drawProject(): void {
    if (this.model.projectFields.length === 0) return;
    this.drawSectionTitle("OBRA", 45);
    this.drawFields(this.model.projectFields);
    this.y -= 8;
  }

  private drawFields(fields: CustomerPdfField[]): void {
    const columnGap = 26;
    const columnWidth = (CONTENT_WIDTH - columnGap) / 2;

    for (let index = 0; index < fields.length; index += 2) {
      const row = fields.slice(index, index + 2);
      const prepared = row.map((field) => ({
        field,
        lines: wrapText(field.value, this.fonts.regular, 10.5, columnWidth),
      }));
      const maxLines = Math.max(...prepared.map((item) => item.lines.length), 1);
      const rowHeight = 13 + maxLines * 13 + 7;
      this.ensureSpace(rowHeight);

      prepared.forEach((item, columnIndex) => {
        const x = MARGIN_X + columnIndex * (columnWidth + columnGap);
        this.drawText(
          item.field.label.toLocaleUpperCase("pt-PT"),
          x,
          this.y,
          7,
          this.fonts.bold,
          colors.subtle,
        );
        item.lines.forEach((line, lineIndex) => {
          this.drawText(
            line,
            x,
            this.y - 13 - lineIndex * 13,
            10.5,
            this.fonts.regular,
            colors.charcoal,
          );
        });
      });

      this.y -= rowHeight;
    }
  }

  private drawScope(): void {
    if (this.model.scope.length === 0) return;
    this.drawSectionTitle("ESCOPO DOS TRABALHOS", 42, true);

    this.model.scope.forEach((section) => this.drawScopeSection(section));
    this.y -= 8;
  }

  private drawScopeSection(section: CustomerPdfScopeSection): void {
    const headingHeight = 24;
    const firstItem = section.items[0] ?? "";
    const firstLines = wrapText(
      firstItem,
      this.fonts.regular,
      10.2,
      CONTENT_WIDTH - 24,
    );
    this.ensureSpace(headingHeight + Math.max(firstLines.length, 1) * 14 + 8);
    this.drawText(section.title, MARGIN_X, this.y, 10.5, this.fonts.bold, colors.charcoal);
    this.y -= headingHeight;

    section.items.forEach((item) => {
      const lines = wrapText(item, this.fonts.regular, 10.2, CONTENT_WIDTH - 24);
      const itemHeight = Math.max(lines.length, 1) * 14.5 + 7;
      const movedToNewPage = this.ensureSpace(itemHeight);

      if (movedToNewPage) {
        this.drawText(
          `${section.title} · continuação`,
          MARGIN_X,
          this.y,
          9,
          this.fonts.bold,
          colors.charcoal,
        );
        this.y -= 22;
      }

      this.page.drawRectangle({
        x: MARGIN_X + 1,
        y: this.y - 3,
        width: 3.2,
        height: 3.2,
        color: colors.accent,
      });
      lines.forEach((line, lineIndex) => {
        this.drawText(
          line,
          MARGIN_X + 13,
          this.y - lineIndex * 14.5,
          10.2,
          this.fonts.regular,
          colors.muted,
        );
      });
      this.y -= itemHeight;
    });

    this.y -= 5;
  }

  private drawCommercialSummary(): void {
    const lineHeight = 24;
    const panelPadding = 16;
    const totalHeight = 54;
    const panelHeight =
      panelPadding * 2 + this.model.commercialLines.length * lineHeight + totalHeight;

    this.ensureSpace(27 + panelHeight);
    this.drawSectionTitle("RESUMO DA PROPOSTA", panelHeight, true);

    const panelTop = this.y;
    const panelBottom = panelTop - panelHeight;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: panelBottom,
      width: CONTENT_WIDTH,
      height: panelHeight,
      color: colors.white,
      borderColor: colors.border,
      borderWidth: 0.6,
    });

    let rowY = panelTop - panelPadding - 4;
    this.model.commercialLines.forEach((line, index) => {
      this.drawText(line.label, MARGIN_X + 16, rowY, 10, this.fonts.regular, colors.muted);
      this.drawRightAlignedText(
        line.value,
        PAGE_WIDTH - MARGIN_X - 16,
        rowY,
        10.5,
        index === 0 ? this.fonts.bold : this.fonts.regular,
        colors.charcoal,
      );
      rowY -= lineHeight;
    });

    this.page.drawRectangle({
      x: MARGIN_X,
      y: panelBottom,
      width: CONTENT_WIDTH,
      height: totalHeight,
      color: colors.charcoal,
    });
    this.page.drawRectangle({
      x: MARGIN_X,
      y: panelBottom + totalHeight - 3,
      width: CONTENT_WIDTH,
      height: 3,
      color: colors.accent,
    });
    this.drawText(
      "TOTAL LÍQUIDO",
      MARGIN_X + 16,
      panelBottom + 20,
      10.5,
      this.fonts.bold,
      colors.white,
    );
    this.drawRightAlignedText(
      this.model.netTotal,
      PAGE_WIDTH - MARGIN_X - 16,
      panelBottom + 18,
      18,
      this.fonts.bold,
      colors.white,
    );

    this.y = panelBottom - 12;
  }

  private drawFooters(): void {
    const pages = this.document.getPages();
    pages.forEach((page, index) => {
      page.drawLine({
        start: { x: MARGIN_X, y: 50 },
        end: { x: PAGE_WIDTH - MARGIN_X, y: 50 },
        thickness: 0.6,
        color: colors.border,
      });
      const contact = "CP Peixoto | cp-peixoto.ch | info@cp-peixoto.ch | +41 77 218 85 37";
      this.drawTextOnPage(
        page,
        contact,
        MARGIN_X,
        29,
        7.5,
        this.fonts.regular,
        colors.muted,
      );
      const pageLabel = `Orçamento ${this.model.quoteNumber} | Página ${index + 1} de ${pages.length}`;
      this.drawRightAlignedTextOnPage(
        page,
        pageLabel,
        PAGE_WIDTH - MARGIN_X,
        29,
        7.5,
        this.fonts.regular,
        colors.muted,
      );
    });
  }

  private drawText(
    value: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    this.drawTextOnPage(this.page, value, x, y, size, font, color);
  }

  private drawTextOnPage(
    page: PDFPage,
    value: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    page.drawText(fontSafeText(value, font), { x, y, size, font, color });
  }

  private drawRightAlignedText(
    value: string,
    right: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    this.drawRightAlignedTextOnPage(this.page, value, right, y, size, font, color);
  }

  private drawRightAlignedTextOnPage(
    page: PDFPage,
    value: string,
    right: number,
    y: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
  ): void {
    const safe = fontSafeText(value, font);
    const width = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: right - width, y, size, font, color });
  }
}

export async function renderCustomerQuotePdf(
  model: CustomerQuotePdfModel,
  logoBytes?: Uint8Array,
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const [regular, bold, logo] = await Promise.all([
    document.embedFont(StandardFonts.Helvetica),
    document.embedFont(StandardFonts.HelveticaBold),
    logoBytes ? document.embedPng(logoBytes) : Promise.resolve(null),
  ]);

  document.setTitle(`Orçamento ${model.quoteNumber}`);
  document.setAuthor("CP Peixoto");
  document.setCreator("Backoffice CP Peixoto");
  document.setProducer("CP Peixoto");
  document.setSubject("Proposta comercial");

  new QuotePdfComposer(document, { regular, bold }, model, logo).compose();
  return document.save({ useObjectStreams: true });
}
