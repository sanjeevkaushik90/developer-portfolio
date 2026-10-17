"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { FiAlertCircle, FiCheckCircle, FiSend } from "react-icons/fi";
import { CONTACT } from "../../data/contact";
import {
  FIELD_LIMITS,
  FIELD_ORDER,
  hasErrors,
  safeEmail,
  validateContact,
  type ContactApiResult,
  type ContactErrors,
  type ContactField,
  type ContactFields,
} from "../../lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ContactFields = { name: "", email: "", subject: "", message: "" };
const REQUEST_TIMEOUT_MS = 15_000;

const inputBase =
  "w-full rounded-xl border bg-[#100F17] px-4 py-3 text-base text-[#F2F0F7] placeholder:text-[#A6A0B5]/60 transition-colors duration-200 hover:border-[#B8A0FF]/40 focus:border-[#B8A0FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF] disabled:cursor-not-allowed disabled:opacity-60";

function inputClass(hasError: boolean): string {
  return `${inputBase} ${hasError ? "border-red-400/70" : "border-[#343044]"}`;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#F2F0F7]">
        {label}
        <span aria-hidden="true" className="ml-1 text-[#B8A0FF]">
          *
        </span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm text-red-300">
          <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/**
 * The contact form. It checks the fields in the browser, then posts them to /api/contact, which checks them
 * again and hands the message to the delivery integration. "Sent" is shown ONLY when that route answers
 * `ok: true`; if no email service or backend is configured yet, the form says so honestly instead.
 */
export default function ContactForm() {
  const [values, setValues] = useState<ContactFields>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<string>("");
  const [honeypot, setHoneypot] = useState("");

  // Stops a second request from starting while one is running, even for a double click in the same instant.
  const submittingRef = useRef(false);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const successRef = useRef<HTMLDivElement>(null);
  // Where focus should go next. It is applied after the next render (see the effect below), because while a
  // request is running the fields are disabled and cannot take focus yet.
  const pendingFocus = useRef<ContactField | "success" | null>(null);

  const fallbackEmail = safeEmail(CONTACT.email);
  const submitting = status === "submitting";

  const setField = (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    // Once a field has shown an error, re-check it as the person types so the message goes away when fixed.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateContact(next)[field] }));
    }
  };

  const checkField = (field: ContactField) => () => {
    setErrors((prev) => ({ ...prev, [field]: validateContact(values)[field] }));
  };

  const focusFirstInvalid = (found: ContactErrors) => {
    pendingFocus.current = FIELD_ORDER.find((f) => found[f]) ?? null;
  };

  // Runs after every render: once the form is no longer sending, move focus to what was asked for.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || status === "submitting") return;
    pendingFocus.current = null;
    if (target === "success") successRef.current?.focus();
    else fieldRefs.current[target]?.focus();
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const found = validateContact(values);
    setErrors(found);
    if (hasErrors(found)) {
      setStatus("idle");
      setFailure("");
      focusFirstInvalid(found);
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    setFailure("");

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => null)) as ContactApiResult | null;

      if (response.ok && data?.ok === true) {
        setValues(EMPTY);
        setErrors({});
        pendingFocus.current = "success";
        setStatus("success");
        return;
      }

      if (data && data.ok === false && data.code === "validation" && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        focusFirstInvalid(data.errors);
        return;
      }

      setStatus("error");
      if (data && data.ok === false && data.code === "not_configured") {
        setFailure("This site cannot send messages yet, so your message was not sent.");
      } else if (data && data.ok === false && data.code === "rate_limited") {
        setFailure("Too many messages were sent from your connection. Please try again in a few minutes.");
      } else {
        setFailure("Your message could not be sent. Please try again in a moment.");
      }
    } catch (error) {
      setStatus("error");
      setFailure(
        error instanceof DOMException && error.name === "AbortError"
          ? "The request took too long, so your message may not have been sent. Please try again."
          : "Could not reach the server. Please check your connection and try again.",
      );
    } finally {
      window.clearTimeout(timer);
      submittingRef.current = false;
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="rounded-2xl border border-[#343044] bg-[#1B1926]/70 p-6 shadow-[0_0_60px_-24px_rgba(184,160,255,0.30)] sm:p-8"
      >
        {status === "success" ? (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="flex flex-col items-start gap-4 rounded-xl py-4 outline-none"
          >
            <span className="grid size-12 place-items-center rounded-xl border border-[#B8A0FF]/30 bg-[#B8A0FF]/10 text-[#B8A0FF]">
              <FiCheckCircle aria-hidden="true" className="size-6" />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-[#F2F0F7]">Message sent</h2>
            <p className="max-w-[44ch] text-base leading-relaxed text-[#A6A0B5]">
              Thank you for getting in touch. The message was accepted, and I will reply to the email address you gave.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="inline-flex min-h-10 items-center rounded-xl border border-[#343044] bg-[#100F17] px-4 text-sm font-medium text-[#F2F0F7] transition-colors duration-200 hover:border-[#B8A0FF]/60 hover:text-[#B8A0FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF]"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate aria-busy={submitting} className="space-y-5">
            <p className="text-sm text-[#A6A0B5]">
              Fields marked <span className="text-[#B8A0FF]">*</span> are required.
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="contact-name" label="Full name" error={errors.name}>
                <input
                  ref={(el) => {
                    fieldRefs.current.name = el;
                  }}
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  maxLength={FIELD_LIMITS.name.max}
                  value={values.name}
                  onChange={setField("name")}
                  onBlur={checkField("name")}
                  disabled={submitting}
                  placeholder="Your name"
                  className={inputClass(Boolean(errors.name))}
                />
              </Field>

              <Field id="contact-email" label="Email address" error={errors.email}>
                <input
                  ref={(el) => {
                    fieldRefs.current.email = el;
                  }}
                  id="contact-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  maxLength={FIELD_LIMITS.email.max}
                  value={values.email}
                  onChange={setField("email")}
                  onBlur={checkField("email")}
                  disabled={submitting}
                  placeholder="name@example.com"
                  className={inputClass(Boolean(errors.email))}
                />
              </Field>
            </div>

            <Field id="contact-subject" label="Subject" error={errors.subject}>
              <input
                ref={(el) => {
                  fieldRefs.current.subject = el;
                }}
                id="contact-subject"
                name="subject"
                type="text"
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={errors.subject ? true : undefined}
                aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                maxLength={FIELD_LIMITS.subject.max}
                value={values.subject}
                onChange={setField("subject")}
                onBlur={checkField("subject")}
                disabled={submitting}
                placeholder="What is this about?"
                className={inputClass(Boolean(errors.subject))}
              />
            </Field>

            <Field id="contact-message" label="Message" error={errors.message}>
              <textarea
                ref={(el) => {
                  fieldRefs.current.message = el;
                }}
                id="contact-message"
                name="message"
                rows={6}
                required
                aria-required="true"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                maxLength={FIELD_LIMITS.message.max}
                value={values.message}
                onChange={setField("message")}
                onBlur={checkField("message")}
                disabled={submitting}
                placeholder="Tell me about the opportunity or idea"
                className={`${inputClass(Boolean(errors.message))} resize-y`}
              />
            </Field>

            {/* Hidden from people and screen readers: only automated form-fillers write here. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Leave this field empty
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            {status === "error" && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm leading-relaxed text-red-200"
              >
                <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>
                  {failure}
                  {fallbackEmail && (
                    <>
                      {" "}
                      You can email me directly at{" "}
                      <a
                        href={`mailto:${fallbackEmail}`}
                        className="font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF]"
                      >
                        {fallbackEmail}
                      </a>
                      .
                    </>
                  )}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B8A0FF] px-6 text-sm font-semibold text-[#100F17] transition-[translate,opacity] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:px-8"
            >
              {submitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-[#100F17]/30 border-t-[#100F17] motion-reduce:animate-none"
                  />
                  Sending&hellip;
                </>
              ) : (
                <>
                  Send Message
                  <FiSend aria-hidden="true" className="size-4" />
                </>
              )}
            </button>

            {/* Announces "sending" to screen readers without moving focus */}
            <p role="status" aria-live="polite" className="sr-only">
              {submitting ? "Sending your message" : ""}
            </p>
          </form>
        )}
      </motion.div>
    </MotionConfig>
  );
}