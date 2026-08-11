import { z } from "zod";

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 32;
const MAX_LOCATION_LENGTH = 160;
const MAX_SERVICE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4_000;

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
  z.string().max(MAX_EMAIL_LENGTH).email().optional(),
);

const optionalPhone = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .min(7)
    .max(MAX_PHONE_LENGTH)
    .regex(/^[0-9+().\s-]+$/)
    .optional(),
);

const honeypot = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.literal("").optional(),
);

export const contactRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
    email: optionalEmail,
    phone: optionalPhone,
    location: optionalText(MAX_LOCATION_LENGTH),
    service: optionalText(MAX_SERVICE_LENGTH),
    message: optionalText(MAX_MESSAGE_LENGTH),
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
