import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@/lib/env";

export function getResendClient(): Resend {
  const { RESEND_API_KEY } = getServerEnv();
  return new Resend(RESEND_API_KEY);
}
