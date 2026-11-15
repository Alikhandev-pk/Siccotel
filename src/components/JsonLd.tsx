import logo from "@/assets/brand/siccotel-logo.png";
import { company } from "@/content/company";
import type { SettingsDoc } from "@/lib/cms/types";
import { absoluteUrl, siteUrl } from "@/lib/site";

/** Organization structured data built only from verified facts. */
export function OrganizationJsonLd({ settings }: { settings: SettingsDoc }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    legalName: company.legalName,
    ...(siteUrl ? { url: siteUrl, logo: absoluteUrl(logo.src) } : {}),
    foundingDate: String(company.foundedYear),
    description: company.shortDescription,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.headOffice.street,
      addressLocality: settings.headOffice.locality,
      addressCountry: "PK",
    },
    sameAs: settings.social.map((s) => s.href),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
