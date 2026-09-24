import { getClientQuotePdfSource } from "@/lib/backoffice/data";
import { loadQuotePdfLogo } from "@/lib/backoffice/pdf/assets";
import {
  buildClientQuotePdfModel,
  clientQuotePdfFilename,
} from "@/lib/backoffice/pdf/model";
import { renderCustomerQuotePdf } from "@/lib/backoffice/pdf/render";
import { getAuthenticatedSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_WORK_DESCRIPTION_LENGTH = 20_000;

export async function POST(
  request: Request,
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Descrição inválida." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("workDescription" in body) ||
    typeof body.workDescription !== "string" ||
    body.workDescription.length > MAX_WORK_DESCRIPTION_LENGTH ||
    body.workDescription.includes("\u0000")
  ) {
    return Response.json(
      { message: "A descrição deve ser texto até 20.000 caracteres." },
      { status: 400 },
    );
  }

  try {
    const [loaded, logo] = await Promise.all([
      getClientQuotePdfSource(id, authenticated),
      loadQuotePdfLogo(),
    ]);
    if (!loaded.source) {
      return Response.json(
        { message: "Orçamento não encontrado." },
        { status: 404 },
      );
    }

    const description = body.workDescription;
    const model = buildClientQuotePdfModel(loaded.source, description);
    const pdf = await renderCustomerQuotePdf(model, logo);
    const { data: saved, error: saveError } = await authenticated.client.rpc(
      "save_client_pdf_work_description",
      { target_quote_id: id, work_description: description },
    );
    if (saveError) throw saveError;
    if (!saved) {
      return Response.json(
        { message: "Orçamento não encontrado." },
        { status: 404 },
      );
    }

    const filename = clientQuotePdfFilename(model.quoteNumber, model.clientName);

    return new Response(Buffer.from(pdf), {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[backoffice] generate client quote PDF", {
      quoteId: id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { message: "Não foi possível gerar o PDF cliente. Tente novamente." },
      { status: 500 },
    );
  }
}
