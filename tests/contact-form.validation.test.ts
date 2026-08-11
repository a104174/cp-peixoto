import { describe, expect, it } from "vitest";

import { validateContactForm } from "../src/lib/validation/contact-form";
import type {
  ContactFormValidationMessages,
  ContactFormValues,
} from "../src/types/contact";

const messages: ContactFormValidationMessages = {
  required: "required",
  invalidEmail: "invalid-email",
  invalidPhone: "invalid-phone",
  contactRequired: "contact-required",
  tooLong: "too-long",
};

const validValues: ContactFormValues = {
  name: "  Maria Silva  ",
  email: " maria@example.com ",
  phone: "",
  location: " Aargau ",
  service: "floor-coatings",
  message: " Pedido de orçamento. ",
  website: "",
};

describe("validateContactForm", () => {
  it("normalizes a valid payload and preserves the stable service value", () => {
    const result = validateContactForm(validValues, messages);

    expect(result.errors).toEqual({});
    expect(result.payload).toEqual({
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "",
      location: "Aargau",
      service: "floor-coatings",
      message: "Pedido de orçamento.",
      website: "",
    });
  });

  it("accepts a valid request using only a phone number", () => {
    const result = validateContactForm(
      {
        ...validValues,
        email: "",
        phone: "+41 77 218 85 37",
      },
      messages,
    );

    expect(result.errors).toEqual({});
  });

  it("requires name, message and at least one contact method", () => {
    const result = validateContactForm(
      {
        ...validValues,
        name: " ",
        email: "",
        phone: "",
        message: "",
      },
      messages,
    );

    expect(result.errors).toMatchObject({
      name: "required",
      message: "required",
      contact: "contact-required",
    });
  });

  it("rejects invalid email and phone values", () => {
    const result = validateContactForm(
      {
        ...validValues,
        email: "invalid-email",
        phone: "not a phone",
      },
      messages,
    );

    expect(result.errors).toMatchObject({
      email: "invalid-email",
      phone: "invalid-phone",
    });
  });

  it("uses limits compatible with the server schema", () => {
    const result = validateContactForm(
      {
        ...validValues,
        name: "n".repeat(121),
        location: "l".repeat(161),
        service: "s".repeat(121),
        message: "m".repeat(4_001),
      },
      messages,
    );

    expect(result.errors).toMatchObject({
      name: "too-long",
      location: "too-long",
      service: "too-long",
      message: "too-long",
    });
  });
});
