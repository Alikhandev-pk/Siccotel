import logo from "@/assets/brand/siccotel-logo.png";
import { company, contact, social } from "@/content/company";
import { absoluteUrl, siteUrl } from "@/lib/site";

/** Organization structured data built only from verified facts. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    legalName: company.legalName,
    ...(siteUrl ? { url: siteUrl, logo: absoluteUrl(logo.src) } : {}),
    foundingDate: String(company.foundedYear),
    description: company.shortDescription,
    email: contact.email,
    telephone: contact.phone.href.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.headOffice.street,
      addressLocality: contact.headOffice.locality,
      addressCountry: "PK",
    },
    sameAs: social.map((s) => s.href),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
