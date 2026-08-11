export type ContactServiceValue =
  | "floor-coatings"
  | "waterproofing"
  | "decorative-floors"
  | "other";

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string;
  message: string;
  website: string;
}

export interface ContactFormValidationMessages {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  contactRequired: string;
  tooLong: string;
}

export interface ContactRequest {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  service?: string;
  message?: string;
  website?: string;
}

export type ContactEmailData = Omit<ContactRequest, "website">;
