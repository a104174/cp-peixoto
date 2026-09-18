import { getQuoteById } from "@/lib/backoffice/data";
import { loadQuotePdfLogo } from "@/lib/backoffice/pdf/assets";
import {
  buildCustomerQuotePdfModel,
  quotePdfFilename,
} from "@/lib/backoffice/pdf/model";
import { renderCustomerQuotePdf } from "@/lib/backoffice/pdf/render";
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
    const quote = await getQuoteById(id);
    if (!quote) {
      return Response.json(
        { message: "Orçamento não encontrado." },
        { status: 404 },
      );
    }

    const model = buildCustomerQuotePdfModel(quote);
    const logo = await loadQuotePdfLogo();
    const pdf = await renderCustomerQuotePdf(model, logo);
    const filename = quotePdfFilename(model.quoteNumber, model.clientName);

    return new Response(Buffer.from(pdf), {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[backoffice] generate quote PDF", {
      quoteId: id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { message: "Não foi possível gerar o PDF. Tente novamente." },
      { status: 500 },
    );
  }
}
