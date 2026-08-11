import { ContactRequestEmail, getContactRequestSubject } from "@/emails/contact-request";
import { getServerEnv } from "@/lib/env";
import { getResendClient } from "@/lib/resend";
import { contactRequestSchema } from "@/lib/validation/contact";
import type { ContactEmailData } from "@/types/contact";

const MAX_CONTACT_REQUEST_BODY_BYTES = 16 * 1024;

type ContactErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "INVALID_PAYLOAD"
  | "CONTACT_UNAVAILABLE";

function errorResponse(
  status: number,
  code: ContactErrorCode,
  message: string,
): Response {
  return Response.json(
    {
      success: false,
      error: { code, message },
    },
    { status },
  );
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("application/json")) {
    return errorResponse(
      415,
      "INVALID_CONTENT_TYPE",
      "O pedido deve utilizar o formato JSON.",
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400, "INVALID_JSON", "O pedido não é válido.");
  }

  const bodySize = new TextEncoder().encode(rawBody).byteLength;
  if (bodySize > MAX_CONTACT_REQUEST_BODY_BYTES) {
    return errorResponse(
      413,
      "PAYLOAD_TOO_LARGE",
      "O pedido excede o tamanho permitido.",
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return errorResponse(400, "INVALID_JSON", "O pedido não é válido.");
  }

  const parsed = contactRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(400, "INVALID_PAYLOAD", "Verifica os dados enviados.");
  }

  const contactData: ContactEmailData = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    location: parsed.data.location,
    service: parsed.data.service,
    message: parsed.data.message,
  };

  try {
    const { RESEND_FROM_EMAIL, CONTACT_EMAIL_TO } = getServerEnv();
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [CONTACT_EMAIL_TO],
      subject: getContactRequestSubject(contactData.name),
      ...(contactData.email ? { replyTo: contactData.email } : {}),
      react: ContactRequestEmail(contactData),
    });

    if (response.error) {
      console.error("[contact] Resend request failed");
      return errorResponse(
        503,
        "CONTACT_UNAVAILABLE",
        "Não foi possível enviar o pedido neste momento.",
      );
    }

    return Response.json({ success: true });
  } catch {
    console.error("[contact] Contact email delivery failed");
    return errorResponse(
      503,
      "CONTACT_UNAVAILABLE",
      "Não foi possível enviar o pedido neste momento.",
    );
  }
}
