export const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  location: 160,
  service: 120,
  message: 4_000,
} as const;

export const CONTACT_PHONE_PATTERN = /^[0-9+().\s-]+$/;
