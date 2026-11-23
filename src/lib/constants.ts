export const SITE_NAME = "Chinvat Bridge";
/*
 * The site's titles, description and origin story are content now (settings:site, see
 * src/lib/content). SITE_NAME and CONTACT_EMAIL remain for app-owned pages and fallbacks that render
 * outside the content model (checkout, portal, the error boundary, the enquiry email); they must match
 * settings:site.
 */
/**
 * The canonical origin. Production sets NEXT_PUBLIC_SITE_URL; it must be the .com, which is the
 * primary domain and the one the mail runs on (.uk should redirect to it).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chinvatbridge.com";

export const CONTACT_EMAIL = "artin@chinvatbridge.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
