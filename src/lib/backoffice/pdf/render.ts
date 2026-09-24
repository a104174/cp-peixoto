import {
  PDFDocument,
  rgb,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import type { ClientQuotePdfModel } from "./model";
import {
  A4_HEIGHT,
  A4_WIDTH,
  embedPdfAssets,
  safeFontText,
  wrapPdfText,
  type PdfFonts,
} from "./shared";

const MARGIN_X = 52;
const CONTENT_WIDTH = A4_WIDTH - MARGIN_X * 2;
const CONTENT_BOTTOM = 76;
const colors = {
  accent: rgb(0.68, 0.49, 0.23),
  border: rgb(0.84, 0.82, 0.77),
  charcoal: rgb(0.12, 0.14, 0.13),
  muted: rgb(0.38, 0.4, 0.38),
  subtle: rgb(0.55, 0.56, 0.53),
  white: rgb(1, 1, 1),
};

class ClientQuotePdfComposer {
  private page!: PDFPage;
  private y = 0;
  private readonly pages: PDFPage[] = [];

  constructor(
    private readonly document: PDFDocument,
    private readonly fonts: PdfFonts,
    private readonly model: ClientQuotePdfModel,
    private readonly logo: PDFImage | null,
  ) {}

  compose(): void {
    this.addPage(true);
    this.drawCustomerAndObject();
    this.drawWorkDescription();
    this.drawPriceAndNote();
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
      color: colors.white,
    });

    if (first) {
      this.drawFirstHeader();
      this.y = 700;
      return;
    }

    this.drawContinuationHeader();
    this.y = 752;
  }

  private drawFirstHeader(): void {
    if (this.logo) {
      this.page.drawImage(this.logo, {
        x: MARGIN_X,
        y: 770,
        width: 44,
        height: 44,
      });
    }

    this.drawText("CP PEIXOTO", MARGIN_X + 53, 795, 17, this.fonts.bold, colors.charcoal);
    this.drawText(
      "Bodenbeschichtungen",
      MARGIN_X + 54,
      777,
      8.5,
      this.fonts.regular,
      colors.muted,
    );

    this.drawRightAligned("OFFERTE", A4_WIDTH - MARGIN_X, 801, 11, this.fonts.bold, colors.accent);
    this.drawRightAligned(
      `Nr. ${this.model.quoteNumber}`,
      A4_WIDTH - MARGIN_X,
      781,
      9.5,
      this.fonts.regular,
      colors.charcoal,
    );
    this.drawRightAligned(
      `Datum ${this.model.quoteDate}`,
      A4_WIDTH - MARGIN_X,
      766,
      9.5,
      this.fonts.regular,
      colors.charcoal,
    );
    this.drawRightAligned(
      "Gültigkeit 30 Tage",
      A4_WIDTH - MARGIN_X,
      751,
      9.5,
      this.fonts.regular,
      colors.muted,
    );

    this.page.drawLine({
      start: { x: MARGIN_X, y: 732 },
      end: { x: A4_WIDTH - MARGIN_X, y: 732 },
      thickness: 0.75,
      color: colors.border,
    });
    this.page.drawLine({
      start: { x: MARGIN_X, y: 732 },
      end: { x: MARGIN_X + 58, y: 732 },
      thickness: 2.2,
      color: colors.accent,
    });
  }

  private drawContinuationHeader(): void {
    this.drawText("CP PEIXOTO", MARGIN_X, 802, 10, this.fonts.bold, colors.charcoal);
    this.drawRightAligned(
      `OFFERTE · ${this.model.quoteNumber}`,
      A4_WIDTH - MARGIN_X,
      802,
      8.5,
      this.fonts.bold,
      colors.muted,
    );
    this.page.drawLine({
      start: { x: MARGIN_X, y: 786 },
      end: { x: A4_WIDTH - MARGIN_X, y: 786 },
      thickness: 0.65,
      color: colors.border,
    });
  }

  private ensureSpace(height: number): boolean {
    if (this.y - height >= CONTENT_BOTTOM) return false;
    this.addPage(false);
    return true;
  }

  private drawCustomerAndObject(): void {
    const gap = 30;
    const columnWidth = (CONTENT_WIDTH - gap) / 2;
    this.drawText("KUNDE", MARGIN_X, this.y, 8, this.fonts.bold, colors.accent);
    this.drawText(
      this.model.clientName || "—",
      MARGIN_X,
      this.y - 23,
      13,
      this.fonts.regular,
      colors.charcoal,
    );

    const rightX = MARGIN_X + columnWidth + gap;
    this.drawText("OBJEKT", rightX, this.y, 8, this.fonts.bold, colors.accent);
    const object = this.model.objectDescription ?? "—";
    const objectLines = wrapPdfText(object, this.fonts.regular, 12, columnWidth);
    objectLines.forEach((line, index) => {
      this.drawText(line, rightX, this.y - 23 - index * 15, 12, this.fonts.regular, colors.charcoal);
    });
    let objectHeight = objectLines.length * 15;
    if (this.model.projectLocation) {
      const locationLines = wrapPdfText(
        `Ort: ${this.model.projectLocation}`,
        this.fonts.regular,
        8.5,
        columnWidth,
      );
      locationLines.forEach((line, index) => {
        this.drawText(
          line,
          rightX,
          this.y - 27 - objectHeight - index * 11,
          8.5,
          this.fonts.regular,
          colors.muted,
        );
      });
      objectHeight += locationLines.length * 11;
    }
    this.y -= Math.max(68, objectHeight + 36);
  }

  private drawWorkDescription(): void {
    this.ensureSpace(46);
    this.drawText("ARBEITSBESCHREIBUNG", MARGIN_X, this.y, 8.5, this.fonts.bold, colors.accent);
    this.y -= 27;

    for (const item of this.model.workDescription) {
      const lines = wrapPdfText(item, this.fonts.regular, 10.5, CONTENT_WIDTH - 23);
      let lineIndex = 0;
      while (lineIndex < lines.length) {
        this.ensureSpace(18);
        const line = lines[lineIndex];
        if (lineIndex === 0) {
          this.page.drawCircle({
            x: MARGIN_X + 3,
            y: this.y + 3,
            size: 2.2,
            color: colors.accent,
          });
        }
        this.drawText(
          line,
          MARGIN_X + 17,
          this.y,
          10.5,
          this.fonts.regular,
          colors.charcoal,
        );
        this.y -= 17;
        lineIndex += 1;
      }
      this.y -= 5;
    }
  }

  private drawPriceAndNote(): void {
    this.ensureSpace(124);
    this.y -= 26;
    this.page.drawLine({
      start: { x: MARGIN_X, y: this.y },
      end: { x: A4_WIDTH - MARGIN_X, y: this.y },
      thickness: 0.8,
      color: colors.border,
    });
    this.y -= 24;
    this.drawText("PAUSCHALPREIS", MARGIN_X, this.y, 9, this.fonts.bold, colors.charcoal);
    this.drawRightAligned(
      this.model.pauschalpreis,
      A4_WIDTH - MARGIN_X,
      this.y - 2,
      17,
      this.fonts.bold,
      colors.charcoal,
    );

    this.y -= 39;
    this.drawText(
      "Ausführung nach Vereinbarung.",
      MARGIN_X,
      this.y,
      9.5,
      this.fonts.regular,
      colors.muted,
    );
    this.drawText(
      "Zusätzliche Arbeiten nur nach Rücksprache.",
      MARGIN_X,
      this.y - 15,
      9.5,
      this.fonts.regular,
      colors.muted,
    );
    this.y -= 22;
  }

  private drawFooters(): void {
    this.pages.forEach((page) => {
      page.drawLine({
        start: { x: MARGIN_X, y: 57 },
        end: { x: A4_WIDTH - MARGIN_X, y: 57 },
        thickness: 0.6,
        color: colors.border,
      });
      this.drawTextOnPage(
        page,
        "CP PEIXOTO - Bodenbeschichtungen",
        MARGIN_X,
        37,
        8,
        this.fonts.bold,
        colors.charcoal,
      );
      this.drawRightAlignedOnPage(
        page,
        "+41 77 218 85 37 | www.cp-peixoto.ch",
        A4_WIDTH - MARGIN_X,
        37,
        8,
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
    font: PdfFonts["regular"],
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
    font: PdfFonts["regular"],
    color: ReturnType<typeof rgb>,
  ): void {
    page.drawText(safeFontText(value, font), { x, y, size, font, color });
  }

  private drawRightAligned(
    value: string,
    right: number,
    y: number,
    size: number,
    font: PdfFonts["regular"],
    color: ReturnType<typeof rgb>,
  ): void {
    this.drawRightAlignedOnPage(this.page, value, right, y, size, font, color);
  }

  private drawRightAlignedOnPage(
    page: PDFPage,
    value: string,
    right: number,
    y: number,
    size: number,
    font: PdfFonts["regular"],
    color: ReturnType<typeof rgb>,
  ): void {
    const safe = safeFontText(value, font);
    const width = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: right - width, y, size, font, color });
  }
}

export async function renderCustomerQuotePdf(
  model: ClientQuotePdfModel,
  logoBytes?: Uint8Array,
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const { fonts, logo } = await embedPdfAssets(document, logoBytes);

  document.setTitle(`Offerte ${model.quoteNumber}`);
  document.setAuthor("CP Peixoto");
  document.setCreator("Backoffice CP Peixoto");
  document.setProducer("CP Peixoto");
  document.setSubject("Offerte Bodenbeschichtungen");

  new ClientQuotePdfComposer(document, fonts, model, logo).compose();
  return document.save({ useObjectStreams: true });
}
