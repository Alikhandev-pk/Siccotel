import type { SettingsDoc } from "@/lib/cms/types";

/** Shared contact links from Settings, so the footer, Contact page and homepage button stay in step. */

/** Sales and information addresses, without blanks or a repeat if an admin sets both the same. */
export function contactEmails(settings: Pick<SettingsDoc, "email" | "infoEmail">): string[] {
  return [settings.email, settings.infoEmail]
    .map((e) => (typeof e === "string" ? e.trim() : ""))
    .filter((e, i, all) => e && all.indexOf(e) === i);
}

/** The WhatsApp chat link and number, or null when either is missing or the link is not a WhatsApp chat URL. */
export function whatsappContact(settings: Pick<SettingsDoc, "whatsappDisplay" | "whatsappHref">) {
  const display = typeof settings.whatsappDisplay === "string" ? settings.whatsappDisplay.trim() : "";
  const href = typeof settings.whatsappHref === "string" ? settings.whatsappHref.trim() : "";
  if (!display || !/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) return null;
  return { display, href };
}
