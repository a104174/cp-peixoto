import { z } from "zod";

import {
  CONTACT_FIELD_LIMITS,
  CONTACT_PHONE_PATTERN,
} from "./contact-constraints";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const optionalText = (max: number) =>
  z.preprocess(
    normalizeOptionalText,
    z.string().max(max).optional(),
  );

const optionalEmail = z.preprocess(
  normalizeOptionalText,
  z.string().max(CONTACT_FIELD_LIMITS.email).email().optional(),
);

const optionalPhone = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .min(7)
    .max(CONTACT_FIELD_LIMITS.phone)
    .regex(CONTACT_PHONE_PATTERN)
    .optional(),
);

const honeypot = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.literal("").optional(),
);

export const contactRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(CONTACT_FIELD_LIMITS.name),
    email: optionalEmail,
    phone: optionalPhone,
    location: optionalText(CONTACT_FIELD_LIMITS.location),
    service: optionalText(CONTACT_FIELD_LIMITS.service),
    message: optionalText(CONTACT_FIELD_LIMITS.message),
    website: honeypot,
  })
  .strict()
  .superRefine((data, context) => {
    if (!data.email && !data.phone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Provide a valid email or phone number",
      });
    }
  });

export type ValidatedContactRequest = z.infer<typeof contactRequestSchema>;
