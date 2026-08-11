import {
  CONTACT_FIELD_LIMITS,
  CONTACT_PHONE_PATTERN,
} from "./contact-constraints";
import type {
  ContactFormValidationMessages,
  ContactFormValues,
} from "@/types/contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFormField =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "service"
  | "message"
  | "contact";

export type ContactFormErrors = Partial<Record<ContactFormField, string>>;

export interface ContactFormValidationResult {
  errors: ContactFormErrors;
  payload: ContactFormValues;
}

function normalize(value: string): string {
  return value.trim();
}

export function validateContactForm(
  values: ContactFormValues,
  messages: ContactFormValidationMessages,
): ContactFormValidationResult {
  const payload: ContactFormValues = {
    name: normalize(values.name),
    email: normalize(values.email),
    phone: normalize(values.phone),
    location: normalize(values.location),
    service: normalize(values.service),
    message: normalize(values.message),
    website: values.website,
  };
  const errors: ContactFormErrors = {};

  if (!payload.name) {
    errors.name = messages.required;
  } else if (payload.name.length > CONTACT_FIELD_LIMITS.name) {
    errors.name = messages.tooLong;
  }

  if (
    payload.email &&
    (payload.email.length > CONTACT_FIELD_LIMITS.email ||
      !EMAIL_PATTERN.test(payload.email))
  ) {
    errors.email = messages.invalidEmail;
  }

  if (
    payload.phone &&
    (payload.phone.length < 7 ||
      payload.phone.length > CONTACT_FIELD_LIMITS.phone ||
      !CONTACT_PHONE_PATTERN.test(payload.phone))
  ) {
    errors.phone = messages.invalidPhone;
  }

  if (!payload.email && !payload.phone) {
    errors.contact = messages.contactRequired;
  }

  if (payload.location.length > CONTACT_FIELD_LIMITS.location) {
    errors.location = messages.tooLong;
  }

  if (payload.service.length > CONTACT_FIELD_LIMITS.service) {
    errors.service = messages.tooLong;
  }

  if (!payload.message) {
    errors.message = messages.required;
  } else if (payload.message.length > CONTACT_FIELD_LIMITS.message) {
    errors.message = messages.tooLong;
  }

  return { errors, payload };
}
