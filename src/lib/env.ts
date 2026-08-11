import "server-only";

import { z } from "zod";

const emailAddress = z.string().trim().min(1).refine(
  (value) => {
    const match = value.match(/<([^<>]+)>$/);
    const address = match?.[1]?.trim() ?? value;
    return z.email().safeParse(address).success;
  },
  "Must contain a valid email address",
);

const serverEnvSchema = z.object({
  RESEND_API_KEY: z.string().trim().min(1),
  RESEND_FROM_EMAIL: emailAddress,
  CONTACT_EMAIL_TO: z.string().trim().email(),
  NEXT_PUBLIC_SITE_URL: z.string().trim().url().refine(
    (value) => /^https?:\/\//i.test(value),
    "Must use http or https",
  ),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    throw new Error("Server environment is not configured");
  }

  return result.data;
}
