"use client";

import { Suspense, useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { enquiryTypes } from "@/content/navigation";
import { contact } from "@/content/company";
import { emptyEnquiry, limits, validateEnquiry, type EnquiryErrors, type EnquiryInput } from "@/lib/enquiry";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const errorMessages: Record<string, string> = {
  not_configured:
    "Online enquiries aren’t connected yet, so your message was not sent. Please call or email us using the details on this page.",
  delivery_failed: "We couldn’t deliver your message just now, so it was not sent. Please try again, or call or email us.",
  rate_limited: "You’ve sent several enquiries in a short time. Please wait a few minutes, or call or email us.",
  network: "We couldn’t reach the server, so your message was not sent. Check your connection and try again.",
};

const fieldOrder: (keyof EnquiryInput)[] = ["fullName", "company", "email", "phone", "city", "enquiryType", "message"];

// Isolate URL access so the form itself remains in the prerendered HTML.
function EnquiryTypeSync({ onChange }: { onChange: (type: EnquiryInput["enquiryType"]) => void }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    onChange(type && enquiryTypes.some((option) => option.value === type) ? type as EnquiryInput["enquiryType"] : "");
  }, [type, onChange]);

  return null;
}

export function EnquiryForm({ deliveryConfigured }: { deliveryConfigured: boolean }) {
  const id = useId();
  const [values, setValues] = useState<EnquiryInput>(emptyEnquiry);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EnquiryInput, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Also follows same-page Next.js links and back/forward navigation.
  const syncEnquiryType = useCallback((type: EnquiryInput["enquiryType"]) => {
    setValues((previous) => previous.enquiryType === type ? previous : { ...previous, enquiryType: type });
    setErrors((previous) => {
      if (!previous.enquiryType) return previous;
      const next = { ...previous };
      delete next.enquiryType;
      return next;
    });
  }, []);

  const fid = (k: keyof EnquiryInput) => `${id}-${k}`;

  const update = (k: keyof EnquiryInput, value: string) => {
    const next = { ...values, [k]: value };
    setValues(next);
    if (touched[k] || showSummary) setErrors(validateEnquiry(next));
  };

  const blur = (k: keyof EnquiryInput) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validateEnquiry(values));
  };

  const visibleError = (k: keyof EnquiryInput) => (touched[k] || showSummary ? errors[k] : undefined);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return; // prevent duplicate submissions

    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setShowSummary(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShowSummary(false);

    if (!deliveryConfigured) {
      setStatus({ kind: "error", message: errorMessages.not_configured });
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }

    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    submitting.current = true;
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; errors?: EnquiryErrors };

      if (res.ok && data.ok === true) {
        setStatus({ kind: "success" });
        setValues(emptyEnquiry);
        setTouched({});
      } else if (data.code === "invalid" && data.errors) {
        setErrors(data.errors);
        setShowSummary(true);
        setStatus({ kind: "idle" });
        requestAnimationFrame(() => summaryRef.current?.focus());
      } else {
        setStatus({ kind: "error", message: errorMessages[data.code ?? ""] ?? errorMessages.delivery_failed });
      }
    } catch {
      setStatus({ kind: "error", message: errorMessages.network });
    } finally {
      submitting.current = false;
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  }

  const isSubmitting = status.kind === "submitting";
  const errorList = fieldOrder.filter((k) => errors[k]);

  const inputCls = (k: keyof EnquiryInput) =>
    `mt-2 block w-full rounded-[3px] border bg-white px-4 text-base text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/25 ${
      visibleError(k) ? "border-accent focus:border-accent" : "border-line-strong hover:border-ink/40 focus:border-ink"
    }`;

  const label = (k: keyof EnquiryInput, children: string, optional?: boolean) => (
    <label htmlFor={fid(k)} className="block text-sm font-semibold text-ink">
      {children}
      {optional ? (
        <span className="font-normal text-muted"> (optional)</span>
      ) : (
        <span aria-hidden className="text-accent">
          {" "}
          *
        </span>
      )}
    </label>
  );

  const fieldError = (k: keyof EnquiryInput) =>
    visibleError(k) ? (
      <p id={`${fid(k)}-error`} className="mt-2 flex items-start gap-1.5 text-sm text-accent">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        {visibleError(k)}
      </p>
    ) : null;

  const a11y = (k: keyof EnquiryInput) => ({
    id: fid(k),
    name: k,
    "aria-invalid": visibleError(k) ? true : undefined,
    "aria-describedby": visibleError(k) ? `${fid(k)}-error` : undefined,
  });

  if (status.kind === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-[4px] border border-line bg-stone p-8 focus:outline-none">
        <CircleCheck aria-hidden className="size-8 text-[#1f7a4d]" />
        <h3 className="mt-4 text-2xl font-semibold">Thank you — your enquiry has been sent.</h3>
        <p className="mt-3 leading-relaxed text-ink-soft">
          The Siccotel team will be in touch. For anything urgent, call{" "}
          <a href={contact.phone.href} className="font-semibold text-ink underline underline-offset-4">
            {contact.phone.display}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-[3px] border border-ink/15 bg-white px-4 text-sm font-semibold hover:border-ink/40"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-busy={isSubmitting} className="space-y-6">
      <Suspense fallback={null}>
        <EnquiryTypeSync onChange={syncEnquiryType} />
      </Suspense>
      {!deliveryConfigured && (
        <div className="rounded-[4px] border border-line-strong bg-stone p-5 text-[0.9375rem] leading-relaxed">
          <h3 className="flex items-start gap-2 font-semibold text-ink">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
            Online enquiry delivery is currently unavailable.
          </h3>
          <p className="mt-2 text-ink-soft">
            This form cannot send your message yet. Please email{" "}
            <a href={`mailto:${contact.email}`} className="font-semibold text-ink underline underline-offset-4">
              {contact.email}
            </a>{" "}
            or call{" "}
            <a href={contact.phone.href} className="font-semibold text-ink underline underline-offset-4">
              {contact.phone.display}
            </a>
            .
          </p>
        </div>
      )}
      {showSummary && errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-[4px] border border-accent/40 bg-[#fff5f5] p-5 focus:outline-none"
        >
          <h3 className="flex items-center gap-2 font-semibold text-accent">
            <CircleAlert aria-hidden className="size-5" />
            Please fix {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}:
          </h3>
          <ul className="mt-2 space-y-1 pl-7 text-sm">
            {errorList.map((k) => (
              <li key={k}>
                <a href={`#${fid(k)}`} className="text-ink underline underline-offset-4 hover:text-accent">
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          {label("fullName", "Full name")}
          <input
            {...a11y("fullName")}
            type="text"
            autoComplete="name"
            maxLength={limits.fullName}
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            onBlur={() => blur("fullName")}
            className={`${inputCls("fullName")} h-12`}
          />
          {fieldError("fullName")}
        </div>
        <div>
          {label("company", "Company name", true)}
          <input
            {...a11y("company")}
            type="text"
            autoComplete="organization"
            maxLength={limits.company}
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
            onBlur={() => blur("company")}
            className={`${inputCls("company")} h-12`}
          />
          {fieldError("company")}
        </div>
        <div>
          {label("email", "Email")}
          <input
            {...a11y("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={limits.email}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            className={`${inputCls("email")} h-12`}
          />
          {fieldError("email")}
        </div>
        <div>
          {label("phone", "Phone")}
          <input
            {...a11y("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+92"
            maxLength={limits.phone}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => blur("phone")}
            className={`${inputCls("phone")} h-12`}
          />
          {fieldError("phone")}
        </div>
        <div>
          {label("city", "City")}
          <input
            {...a11y("city")}
            type="text"
            autoComplete="address-level2"
            maxLength={limits.city}
            value={values.city}
            onChange={(e) => update("city", e.target.value)}
            onBlur={() => blur("city")}
            className={`${inputCls("city")} h-12`}
          />
          {fieldError("city")}
        </div>
        <div>
          {label("enquiryType", "Enquiry type")}
          <select
            {...a11y("enquiryType")}
            value={values.enquiryType}
            onChange={(e) => update("enquiryType", e.target.value)}
            onBlur={() => blur("enquiryType")}
            className={`${inputCls("enquiryType")} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2316181b'%20stroke-width='2'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-11`}
          >
            <option value="" disabled>
              Select an option
            </option>
            {enquiryTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {fieldError("enquiryType")}
        </div>
      </div>

      <div>
        {label("message", "Message")}
        <textarea
          {...a11y("message")}
          rows={6}
          maxLength={limits.message}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => blur("message")}
          className={`${inputCls("message")} resize-y py-3`}
        />
        {fieldError("message")}
      </div>

      {/* Honeypot for bots — hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        className="focus:outline-none"
      >
        {status.kind === "error" && (
          <div role="alert" className="rounded-[4px] border border-accent/40 bg-[#fff5f5] p-5 text-[0.9375rem] leading-relaxed">
            <p className="flex items-start gap-2 font-semibold text-accent">
              <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
              Your message was not sent.
            </p>
            <p className="mt-2 text-ink-soft">{status.message}</p>
            <p className="mt-3 text-ink-soft">
              Phone:{" "}
              <a href={contact.phone.href} className="font-semibold text-ink underline underline-offset-4">
                {contact.phone.display}
              </a>{" "}
              · Email:{" "}
              <a href={`mailto:${contact.email}`} className="font-semibold text-ink underline underline-offset-4">
                {contact.email}
              </a>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Fields marked <span className="text-accent">*</span> are required.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send enquiry
              <Send aria-hidden className="size-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
