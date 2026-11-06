// The public business domain is canonical, including in previews and local tests.
// Deployment URLs and historical hosting environment variables must not leak into SEO.
export const siteUrl = "https://mftravel.co.uk";
export const businessId = `${siteUrl}/#business`;
export const websiteId = `${siteUrl}/#website`;
export const logoPath = "/brand/mf-travel-business-card-logo.webp";
export const serviceAreas = [
  "Hull", "East Riding of Yorkshire", "Beverley", "Cottingham",
  "Hessle", "Anlaby", "Willerby", "Brough",
];

export const fareInclusions = "Each guide fare includes one direct pickup within Hull, one airport drop-off, normal luggage, the standard airport charge and airport parking. It covers up to four passengers, subject to luggage space. We confirm a fixed quote after checking your journey details.";

export function businessSchema() {
  const phone = process.env.NEXT_PUBLIC_BOOKING_PHONE?.trim();
  const email = process.env.NEXT_PUBLIC_BOOKING_EMAIL?.trim();
  const licence = process.env.NEXT_PUBLIC_OPERATOR_LICENCE?.trim();
  const authority = process.env.NEXT_PUBLIC_LICENSING_AUTHORITY?.trim();
  return {
    "@type": "Organization",
    "@id": businessId,
    name: "MF Travel",
    url: siteUrl,
    description: "Pre-booked airport transfers and long-distance private-hire travel from Hull and East Riding.",
    logo: {
      "@type": "ImageObject", url: `${siteUrl}${logoPath}`, width: 572, height: 174,
    },
    image: `${siteUrl}/mf-travel-airport-hero.webp`,
    areaServed: serviceAreas,
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(licence && authority ? {
      identifier: {
        "@type": "PropertyValue",
        name: `${authority} private-hire operator licence`, value: licence,
      },
    } : {}),
  };
}

// Escape '<' to keep JSON-LD safe inside an HTML script element.
export function serializeSchema(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
