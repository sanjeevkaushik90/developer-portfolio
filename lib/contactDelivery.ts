import type { ContactFields } from "./contact";

/**
 * THE INTEGRATION POINT. This is the only code that hands a contact message to a service. It runs on the
 * server, so API keys stay secret: they are read from environment variables (never NEXT_PUBLIC_ ones) and
 * are never sent to the browser.
 *
 * Nothing is configured by default, so a message is never reported as sent unless a service accepted it.
 * Pick ONE of these and set its variables (see .env.example):
 *
 *  1. Your own backend, for example a FastAPI endpoint:
 *       CONTACT_API_URL=https://your-api.example.com/contact      (receives a JSON POST)
 *       CONTACT_API_KEY=...                                       (optional, sent as a Bearer token)
 *
 *  2. Email through Resend's HTTP API (no extra package needed):
 *       RESEND_API_KEY=...   CONTACT_TO_EMAIL=you@example.com   CONTACT_FROM_EMAIL="Portfolio <contact@your-domain.com>"
 *
 * To use a different service, add another branch to `deliverMessage`. If CONTACT_API_URL is set it wins.
 */

export class NotConfiguredError extends Error {
  constructor() {
    super("No email service or backend is configured.");
    this.name = "NotConfiguredError";
  }
}

export class DeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeliveryError";
  }
}

type Env = Record<string, string | undefined>;
export type DeliveryMode = "forward" | "resend" | "none";

function isHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export function getDeliveryMode(env: Env = process.env): DeliveryMode {
  if (isHttpUrl(env.CONTACT_API_URL?.trim())) return "forward";
  if (env.RESEND_API_KEY?.trim() && env.CONTACT_TO_EMAIL?.trim() && env.CONTACT_FROM_EMAIL?.trim()) return "resend";
  return "none";
}

/** Removes line breaks so a value can never inject extra email headers. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

const TIMEOUT_MS = 10_000;

export async function deliverMessage(
  message: ContactFields,
  env: Env = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const mode = getDeliveryMode(env);
  if (mode === "none") throw new NotConfiguredError();

  const clean: ContactFields = {
    name: oneLine(message.name),
    email: oneLine(message.email),
    subject: oneLine(message.subject),
    message: message.message.trim(),
  };

  let response: Response;
  try {
    if (mode === "forward") {
      const key = env.CONTACT_API_KEY?.trim();
      response = await fetchImpl(env.CONTACT_API_URL!.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
        body: JSON.stringify(clean),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } else {
      response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.RESEND_API_KEY!.trim()}` },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL!.trim(),
          to: [env.CONTACT_TO_EMAIL!.trim()],
          reply_to: clean.email,
          subject: `[Portfolio] ${clean.subject}`,
          text: `From: ${clean.name} <${clean.email}>\nSubject: ${clean.subject}\n\n${clean.message}`,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    }
  } catch {
    throw new DeliveryError("The service could not be reached.");
  }

  // Only a success response from the service counts as accepted.
  if (!response.ok) throw new DeliveryError(`The service answered with status ${response.status}.`);
}