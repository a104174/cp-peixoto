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
