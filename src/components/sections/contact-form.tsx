"use client";

import { useRef, useState, type FormEvent } from "react";

import type { SiteDictionary } from "@/content/types";
import { CONTACT_FIELD_LIMITS } from "@/lib/validation/contact-constraints";
import {
  validateContactForm,
  type ContactFormErrors,
  type ContactFormField,
} from "@/lib/validation/contact-form";
import type { ContactFormValues } from "@/types/contact";

interface ContactLink {
  display: string;
  href: string;
}

interface ContactFormProps {
  content: SiteDictionary["contact"]["form"];
  email: ContactLink;
  phone: ContactLink;
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const editableFields = new Set<ContactFormField>([
  "name",
  "email",
  "phone",
  "location",
  "service",
  "message",
]);

function getFormValue(formData: FormData, name: keyof ContactFormValues): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getDescribedBy(...ids: (string | false | undefined)[]): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function isSuccessResponse(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true
  );
}

interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: FieldErrorProps) {
  return message ? (
    <p className="contact-field-error" id={id}>
      <span aria-hidden="true">!</span>
      {message}
    </p>
  ) : null;
}

export function ContactForm({ content, email, phone }: ContactFormProps) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<ContactFormErrors>({});
  const isSubmitting = useRef(false);

  function handleInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }

    const field = target.name as ContactFormField;
    if (!editableFields.has(field)) {
      return;
    }

    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];

      if (field === "email" || field === "phone") {
        delete next.contact;
      }

      return next;
    });

    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting.current) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: ContactFormValues = {
      name: getFormValue(formData, "name"),
      email: getFormValue(formData, "email"),
      phone: getFormValue(formData, "phone"),
      location: getFormValue(formData, "location"),
      service: getFormValue(formData, "service"),
      message: getFormValue(formData, "message"),
      website: getFormValue(formData, "website"),
    };
    const { errors, payload } = validateContactForm(
      values,
      content.validation,
    );

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("idle");

      const firstInvalidField =
        errors.name
          ? "name"
          : errors.email || errors.contact
            ? "email"
            : errors.phone
              ? "phone"
              : errors.location
                ? "location"
                : errors.service
                  ? "service"
                  : "message";

      requestAnimationFrame(() => {
        form
          .querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
          ?.focus();
      });
      return;
    }

    isSubmitting.current = true;
    setFieldErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody: unknown = await response.json().catch(() => null);

      if (!response.ok || !isSuccessResponse(responseBody)) {
        throw new Error("Contact request failed");
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      isSubmitting.current = false;
    }
  }

  const contactMethodError = fieldErrors.contact;
  const submitLabel =
    status === "submitting" ? content.submitting : content.submit;

  return (
    <form
      className="contact-form"
      noValidate
      onInput={handleInput}
      onSubmit={handleSubmit}
    >
      <div className="contact-form-grid">
        <div className="contact-field contact-field-wide">
          <label htmlFor="contact-name">{content.labels.name}</label>
          <input
            aria-describedby={
              fieldErrors.name ? "contact-name-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.name)}
            autoComplete="name"
            id="contact-name"
            maxLength={CONTACT_FIELD_LIMITS.name}
            name="name"
            required
            type="text"
          />
          <FieldError
            id="contact-name-error"
            message={fieldErrors.name}
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-email">{content.labels.email}</label>
          <input
            aria-describedby={getDescribedBy(
              "contact-method-guidance",
              fieldErrors.email && "contact-email-error",
              contactMethodError && "contact-method-error",
            )}
            aria-invalid={Boolean(fieldErrors.email || contactMethodError)}
            autoComplete="email"
            id="contact-email"
            maxLength={CONTACT_FIELD_LIMITS.email}
            name="email"
            type="email"
          />
          <FieldError
            id="contact-email-error"
            message={fieldErrors.email}
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-phone">{content.labels.phone}</label>
          <input
            aria-describedby={getDescribedBy(
              "contact-method-guidance",
              fieldErrors.phone && "contact-phone-error",
              contactMethodError && "contact-method-error",
            )}
            aria-invalid={Boolean(fieldErrors.phone || contactMethodError)}
            autoComplete="tel"
            id="contact-phone"
            inputMode="tel"
            maxLength={CONTACT_FIELD_LIMITS.phone}
            minLength={7}
            name="phone"
            type="tel"
          />
          <FieldError
            id="contact-phone-error"
            message={fieldErrors.phone}
          />
        </div>

        <p className="contact-method-guidance" id="contact-method-guidance">
          {content.contactGuidance}
        </p>
        <FieldError
          id="contact-method-error"
          message={contactMethodError}
        />

        <div className="contact-field">
          <label htmlFor="contact-location">
            {content.labels.location}
            <span>{content.labels.optional}</span>
          </label>
          <input
            aria-describedby={
              fieldErrors.location ? "contact-location-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.location)}
            id="contact-location"
            maxLength={CONTACT_FIELD_LIMITS.location}
            name="location"
            type="text"
          />
          <FieldError
            id="contact-location-error"
            message={fieldErrors.location}
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-service">
            {content.labels.service}
            <span>{content.labels.optional}</span>
          </label>
          <div className="contact-select">
            <select
              aria-describedby={
                fieldErrors.service ? "contact-service-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.service)}
              defaultValue=""
              id="contact-service"
              name="service"
            >
              <option value="">{content.servicePlaceholder}</option>
              {content.services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
          <FieldError
            id="contact-service-error"
            message={fieldErrors.service}
          />
        </div>

        <div className="contact-field contact-field-wide">
          <label htmlFor="contact-message">{content.labels.message}</label>
          <textarea
            aria-describedby={
              fieldErrors.message ? "contact-message-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.message)}
            id="contact-message"
            maxLength={CONTACT_FIELD_LIMITS.message}
            name="message"
            required
            rows={6}
          />
          <FieldError
            id="contact-message-error"
            message={fieldErrors.message}
          />
        </div>
      </div>

      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          autoComplete="off"
          id="contact-website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <button
        className="button button-primary contact-submit"
        disabled={status === "submitting"}
        type="submit"
      >
        {status === "submitting" ? (
          <span className="contact-submit-spinner" aria-hidden="true" />
        ) : null}
        <span>{submitLabel}</span>
      </button>

      <div
        className="contact-form-status"
        aria-atomic="true"
        aria-live={status === "error" ? "assertive" : "polite"}
        role={status === "error" ? "alert" : "status"}
      >
        {status === "success" ? (
          <div className="contact-success">
            <h3>{content.success.heading}</h3>
            <p>{content.success.message}</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="contact-error">
            <p>{content.error}</p>
            <div className="contact-error-links">
              <a href={phone.href}>{phone.display}</a>
              <a href={email.href}>{email.display}</a>
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
