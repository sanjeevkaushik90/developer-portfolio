/**
 * Shared by the contact form (in the browser) and the /api/contact route (on the server), so both apply
 * exactly the same rules. The server always validates again: the browser's checks are for convenience only.
 */

export const FIELD_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

export type ContactFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactField = keyof ContactFields;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const FIELD_ORDER: readonly ContactField[] = ["name", "email", "subject", "message"];

// A practical check, not the full email standard: something@something.tld with no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(values: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) errors.name = "Please enter your name.";
  else if (name.length < FIELD_LIMITS.name.min) errors.name = "Your name looks too short.";
  else if (name.length > FIELD_LIMITS.name.max) errors.name = `Please keep your name under ${FIELD_LIMITS.name.max} characters.`;

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > FIELD_LIMITS.email.max || !EMAIL.test(email)) errors.email = "Please enter a valid email address, like name@example.com.";

  if (!subject) errors.subject = "Please enter a subject.";
  else if (subject.length < FIELD_LIMITS.subject.min) errors.subject = "The subject looks too short.";
  else if (subject.length > FIELD_LIMITS.subject.max) errors.subject = `Please keep the subject under ${FIELD_LIMITS.subject.max} characters.`;

  if (!message) errors.message = "Please write a message.";
  else if (message.length < FIELD_LIMITS.message.min) errors.message = `Please write at least ${FIELD_LIMITS.message.min} characters.`;
  else if (message.length > FIELD_LIMITS.message.max) errors.message = `Please keep the message under ${FIELD_LIMITS.message.max} characters.`;

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** What /api/contact answers with. The form shows "sent" only for `ok: true`. */
export type ContactApiResult =
  | { ok: true }
  | {
      ok: false;
      code: "validation" | "bad_request" | "forbidden" | "rate_limited" | "not_configured" | "delivery_failed";
      message: string;
      errors?: ContactErrors;
    };

/** Returns the address only if it is a real http(s) link; anything else (including empty) is treated as not set. */
export function safeHttpUrl(url: string | undefined): string | undefined {
  const value = url?.trim();
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Returns the address only if it looks like an email address. */
export function safeEmail(email: string | undefined): string | undefined {
  const value = email?.trim();
  return value && EMAIL.test(value) ? value : undefined;
}