import { NextResponse } from "next/server";
import { enquiryTypeLabel, limits, validateEnquiry, type EnquiryInput } from "@/lib/enquiry";

/**
 * Enquiry delivery. Configure ONE of these in the environment (see .env.example):
 *
 *  1. Resend (email):  RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL
 *  2. Webhook (CRM / Zapier / Make / Slack relay etc.): ENQUIRY_WEBHOOK_URL
 *     (+ optional ENQUIRY_WEBHOOK_SECRET, sent as a Bearer token)
 *
 * With neither configured the endpoint returns 503 and the form tells the
 * visitor to phone or email instead — it never reports a false success.
 */

type Result = { ok: true } | { ok: false; status: number; code: string };

const MAX_BODY_BYTES = 16 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best-effort, per-instance rate limit. Use a shared store (e.g. Redis/KV)
// if this is deployed across many serverless instances.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max + 1) : "");

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function deliver(e: EnquiryInput, meta: { ip: string; userAgent: string }): Promise<Result> {
  const { RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL, ENQUIRY_WEBHOOK_URL, ENQUIRY_WEBHOOK_SECRET } = process.env;
  const type = enquiryTypeLabel(e.enquiryType);
  const fields: [string, string][] = [
    ["Enquiry type", type],
    ["Full name", e.fullName],
    ["Company", e.company || "—"],
    ["Email", e.email],
    ["Phone", e.phone],
    ["City", e.city],
  ];

  if (RESEND_API_KEY && ENQUIRY_TO_EMAIL && ENQUIRY_FROM_EMAIL) {
    const text = `${fields.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${e.message}`;
    const html = `<table cellpadding="6">${fields
      .map(([k, v]) => `<tr><th align="left">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
      .join("")}</table><p><strong>Message</strong></p><p style="white-space:pre-wrap">${escapeHtml(e.message)}</p>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: ENQUIRY_FROM_EMAIL,
        to: ENQUIRY_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: e.email,
        subject: `Website enquiry: ${type} — ${e.fullName}${e.company ? ` (${e.company})` : ""}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Enquiry email delivery failed", res.status, await res.text().catch(() => ""));
      return { ok: false, status: 502, code: "delivery_failed" };
    }
    return { ok: true };
  }

  if (ENQUIRY_WEBHOOK_URL) {
    const res = await fetch(ENQUIRY_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ENQUIRY_WEBHOOK_SECRET ? { Authorization: `Bearer ${ENQUIRY_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({
        ...e,
        enquiryTypeLabel: type,
        submittedAt: new Date().toISOString(),
        source: "website",
        userAgent: meta.userAgent,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Enquiry webhook delivery failed", res.status);
      return { ok: false, status: 502, code: "delivery_failed" };
    }
    return { ok: true };
  }

  console.warn("Enquiry received but no delivery method is configured (see .env.example).");
  return { ok: false, status: 503, code: "not_configured" };
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, code: "bad_request" }, { status: 415 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, code: "too_large" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, code: "bad_request" }, { status: 400 });
  }

  // JSON can contain null, arrays or primitives; only an object is a form payload.
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json({ ok: false, code: "bad_request" }, { status: 400 });
  }
  const body = parsed as Record<string, unknown>;

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: false, code: "rejected" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  const input: EnquiryInput = {
    fullName: str(body.fullName, limits.fullName).trim(),
    company: str(body.company, limits.company).trim(),
    email: str(body.email, limits.email).trim(),
    phone: str(body.phone, limits.phone).trim(),
    city: str(body.city, limits.city).trim(),
    enquiryType: str(body.enquiryType, 20).trim() as EnquiryInput["enquiryType"],
    message: str(body.message, limits.message).trim(),
  };

  const errors = validateEnquiry(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, code: "invalid", errors }, { status: 400 });
  }

  try {
    const result = await deliver(input, { ip, userAgent: request.headers.get("user-agent") ?? "" });
    if (!result.ok) return NextResponse.json({ ok: false, code: result.code }, { status: result.status });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enquiry delivery error", err);
    return NextResponse.json({ ok: false, code: "delivery_failed" }, { status: 502 });
  }
}
