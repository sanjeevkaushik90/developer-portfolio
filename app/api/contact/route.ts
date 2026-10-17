import { NextResponse } from "next/server";
import { FIELD_ORDER, hasErrors, validateContact, type ContactApiResult, type ContactFields } from "../../../lib/contact";
import { DeliveryError, NotConfiguredError, deliverMessage } from "../../../lib/contactDelivery";

const MAX_BODY_BYTES = 20_000;

// A simple limit of 5 messages per 10 minutes per address. It lives in this server instance's memory, so on
// serverless hosting it is only best-effort; use your host's or your backend's rate limiting for more.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function tooManyRequests(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 1000) {
    for (const [k, v] of recent) if (v.every((t) => now - t >= WINDOW_MS)) recent.delete(k);
  }
  return false;
}

function reply(body: ContactApiResult, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  // Only accept requests that come from this site's own pages.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      /* treated as a mismatch below */
    }
    if (!host || originHost !== host) {
      return reply({ ok: false, code: "forbidden", message: "This request was not accepted." }, 403);
    }
  }

  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return reply({ ok: false, code: "bad_request", message: "Unsupported request." }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return reply({ ok: false, code: "bad_request", message: "The message is too large." }, 413);
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return reply({ ok: false, code: "bad_request", message: "The message is too large." }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return reply({ ok: false, code: "bad_request", message: "The request could not be read." }, 400);
  }
  if (typeof body !== "object" || body === null) {
    return reply({ ok: false, code: "bad_request", message: "The request could not be read." }, 400);
  }

  const data = body as Record<string, unknown>;
  const values = {} as ContactFields;
  for (const field of FIELD_ORDER) {
    const value = data[field];
    if (typeof value !== "string") {
      return reply({ ok: false, code: "bad_request", message: "The request could not be read." }, 400);
    }
    values[field] = value;
  }

  // Hidden "honeypot" field: people never see it, so only automated form-fillers write to it. They are
  // answered as if it worked, so they learn nothing, but nothing is sent.
  if (typeof data.website === "string" && data.website.trim() !== "") {
    return reply({ ok: true }, 200);
  }

  const errors = validateContact(values);
  if (hasErrors(errors)) {
    return reply({ ok: false, code: "validation", message: "Please check the highlighted fields.", errors }, 422);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooManyRequests(ip)) {
    return reply({ ok: false, code: "rate_limited", message: "Too many messages. Please try again in a few minutes." }, 429);
  }

  try {
    await deliverMessage(values);
    return reply({ ok: true }, 200);
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return reply(
        { ok: false, code: "not_configured", message: "This site cannot send messages yet." },
        501,
      );
    }
    // The message content is never logged, only the kind of failure.
    console.error("[contact] delivery failed:", error instanceof DeliveryError ? error.message : "unexpected error");
    return reply({ ok: false, code: "delivery_failed", message: "The message could not be sent. Please try again later." }, 502);
  }
}