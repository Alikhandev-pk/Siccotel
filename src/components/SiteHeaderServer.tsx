import { getSettings } from "@/lib/cms/public";
import { SiteHeader } from "./SiteHeader";

/** Reads the published contact settings for the client-side header. */
export async function SiteHeaderServer() {
  const s = await getSettings();
  return <SiteHeader contact={{ email: s.email, phoneDisplay: s.topBarPhoneDisplay, phoneHref: s.topBarPhoneHref, storeUrl: s.links.siccoStore }} />;
}
