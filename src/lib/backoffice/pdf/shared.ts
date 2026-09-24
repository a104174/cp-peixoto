import {
  PageSizes,
  StandardFonts,
  type PDFFont,
  type PDFDocument,
  type PDFImage,
} from "pdf-lib";

export const A4_WIDTH = PageSizes.A4[0];
export const A4_HEIGHT = PageSizes.A4[1];

export type PdfFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

export function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
}

export async function embedPdfAssets(
  document: PDFDocument,
  logoBytes?: Uint8Array,
): Promise<{ fonts: PdfFonts; logo: PDFImage | null }> {
  const [regular, bold, logo] = await Promise.all([
    document.embedFont(StandardFonts.Helvetica),
    document.embedFont(StandardFonts.HelveticaBold),
    logoBytes ? document.embedPng(logoBytes) : Promise.resolve(null),
  ]);
  return { fonts: { regular, bold }, logo };
}

export function safeFontText(value: unknown, font: PDFFont): string {
  const text = asText(value);
  let safe = "";
  for (const character of text) {
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

export function wrapPdfText(
  value: unknown,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const safe = safeFontText(asText(value).replace(/\s+/g, " ").trim(), font);
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
