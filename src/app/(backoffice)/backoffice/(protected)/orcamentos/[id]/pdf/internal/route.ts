import { getQuoteById } from "@/lib/backoffice/data";
import { loadQuotePdfLogo } from "@/lib/backoffice/pdf/assets";
import {
  buildInternalQuotePdfModel,
  internalQuotePdfFilename,
} from "@/lib/backoffice/pdf/model";
import { renderInternalQuotePdf } from "@/lib/backoffice/pdf/internal-render";
import { getAuthenticatedSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const authenticated = await getAuthenticatedSupabase();
  if (!authenticated) {
    return Response.json(
      { message: "A sua sessão expirou. Inicie sessão novamente." },
      { status: 401 },
    );
  }

  const { id } = await params;
  try {
    const [quote, logo] = await Promise.all([
      getQuoteById(id, authenticated),
      loadQuotePdfLogo(),
    ]);
    if (!quote) {
      return Response.json(
        { message: "Orçamento não encontrado." },
        { status: 404 },
      );
    }

    const model = buildInternalQuotePdfModel(quote);
    const pdf = await renderInternalQuotePdf(model, logo);
    const filename = internalQuotePdfFilename(model.quoteNumber);

    return new Response(Buffer.from(pdf), {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[backoffice] generate internal quote PDF", {
      quoteId: id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { message: "Não foi possível gerar o PDF interno. Tente novamente." },
      { status: 500 },
    );
  }
}
