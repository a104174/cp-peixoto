import { describe, expect, it } from "vitest";

import { contactRequestSchema } from "../src/lib/validation/contact";

const validPayload = {
  name: "Pessoa Interessada",
  email: "cliente@example.com",
  phone: "+351 912 345 678",
  location: "Localização a confirmar",
  service: "Impermeabilização",
  message: "Gostaria de pedir um orçamento.",
  website: "",
};

describe("contactRequestSchema", () => {
  it("accepts a valid contact request", () => {
    const result = contactRequestSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it("accepts a valid contact request using only a phone number", () => {
    const result = contactRequestSchema.safeParse({
      name: validPayload.name,
      phone: validPayload.phone,
      location: validPayload.location,
      service: validPayload.service,
      message: validPayload.message,
      website: validPayload.website,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid contact request without a message", () => {
    const result = contactRequestSchema.safeParse({
      name: validPayload.name,
      email: validPayload.email,
      website: validPayload.website,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactRequestSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects fields that exceed their limits", () => {
    const result = contactRequestSchema.safeParse({
      ...validPayload,
      message: "m".repeat(4_001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    const result = contactRequestSchema.safeParse({
      ...validPayload,
      website: "https://bot.example",
    });

    expect(result.success).toBe(false);
  });

  it("rejects incomplete requests without a contact method", () => {
    const result = contactRequestSchema.safeParse({
      name: "Pessoa Interessada",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a contact request without a name", () => {
    const result = contactRequestSchema.safeParse({
      email: validPayload.email,
      message: validPayload.message,
      website: validPayload.website,
    });

    expect(result.success).toBe(false);
  });

  it("rejects unexpected properties", () => {
    const result = contactRequestSchema.safeParse({
      ...validPayload,
      recipient: "unexpected.com",
    });

    expect(result.success).toBe(false);
  });
});
