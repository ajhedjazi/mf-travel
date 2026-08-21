import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandLogo from "../../brand-logo";
import { airportRoutes, getAirportRoute } from "../route-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mftravel.co.uk";

type RoutePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return airportRoutes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getAirportRoute(slug);
  if (!route) return {};

  const path = `/airport-transfers/${route.slug}`;
  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${route.title} | MF Travel`,
      description: route.description,
      url: path,
      images: [{ url: "/mf-travel-airport-hero.webp", width: 1536, height: 1024, alt: `Pre-booked ${route.airport} transfer from Hull` }],
    },
    twitter: { card: "summary_large_image", title: `${route.title} | MF Travel`, description: route.description, images: ["/mf-travel-airport-hero.webp"] },
  };
}

export default async function AirportRoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = getAirportRoute(slug);
  if (!route) notFound();

  const routeUrl = `${siteUrl}/airport-transfers/${route.slug}`;
  const quoteHref = `/?destination=${encodeURIComponent(route.airport)}#quote`;
  const faqs = [
    {
      question: `How much is a transfer from Hull to ${route.airport}?`,
      answer: `The current MF Travel guide fare is £${route.price}. It assumes one Hull pickup, one airport drop-off, normal luggage and the standard airport charge. Your exact journey is confirmed in writing before booking.`,
    },
    {
      question: `How long does Hull to ${route.airport} take?`,
      answer: `The journey is approximately ${route.miles} miles and commonly takes ${route.journeyTime}, but collection time is planned with a margin for traffic, check-in and the exact pickup address.`,
    },
    {
      question: "Can MF Travel collect me after the return flight?",
      answer: "Yes. Request both legs together and provide the return flight number. The latest published arrival information can then be checked when planning your collection.",
    },
    {
      question: "What if I have several suitcases?",
      answer: "Tell MF Travel the number and approximate size of checked cases, cabin bags and any unusual items. Each car carries up to four passengers, but luggage space must be confirmed before booking.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Airport transfers", item: `${siteUrl}/airport-transfers` },
          { "@type": "ListItem", position: 3, name: route.title, item: routeUrl },
        ],
      },
      {
        "@type": "Service",
        name: route.title,
        description: route.description,
        provider: { "@type": "TransportationService", name: "MF Travel", url: siteUrl },
        areaServed: ["Hull", "East Riding of Yorkshire", "Beverley", "Cottingham", "Hessle", "Anlaby", "Willerby", "Brough"],
        serviceType: "Pre-booked airport transfer",
        offers: {
          "@type": "Offer",
          priceCurrency: "GBP",
          price: route.price,
          url: routeUrl,
          description: `Guide fare from Hull to ${route.airport}; the final quote depends on the confirmed journey details.`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <div className="route-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="route-header">
        <a className="route-brand" href="/" aria-label="MF Travel home"><BrandLogo tone="light" className="brand-logo--route" /></a>
        <nav aria-label="Airport route navigation">
          <a href="/">Home</a>
          <a href="/airport-transfers">Airport transfers</a>
          <a className="route-header-cta" href={quoteHref}>Get a quote</a>
        </nav>
      </header>

      <main>
        <section className="route-detail-hero">
          <div className="route-detail-hero__image" aria-hidden="true" />
          <div className="route-detail-hero__shade" aria-hidden="true" />
          <div className="route-wrap route-detail-hero__content">
            <nav className="route-breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><a href="/airport-transfers">Airport transfers</a><span>/</span><span>{route.shortName}</span>
            </nav>
            <p className="route-kicker">Pre-booked from Hull</p>
            <h1>Hull to<br /><em>{route.airport}</em></h1>
            <p>{route.intro}</p>
            <div className="route-fare-summary">
              <div><small>Guide fare</small><strong>£{route.price}</strong></div>
              <div><small>Road distance</small><strong>Approx. {route.miles} miles</strong></div>
              <div><small>Typical journey</small><strong>{route.journeyTime}</strong></div>
            </div>
            <div className="route-hero-actions">
              <a className="route-button route-button--gold" href={quoteHref}>Request this journey</a>
              <a className="route-text-link" href="#journey-details">See journey details <span>↓</span></a>
            </div>
          </div>
        </section>

        <section className="route-detail-intro route-wrap" id="journey-details">
          <div>
            <p className="route-kicker">The journey</p>
            <h2>{route.routeHeading}</h2>
            <p>{route.routeCopy}</p>
          </div>
          <aside className="route-price-card" aria-label={`${route.airport} guide fare details`}>
            <span>MF / {route.shortName}</span>
            <small>Guide fare from Hull</small>
            <strong>£{route.price}</strong>
            <p>One pickup · One drop-off · Normal luggage · Standard airport charge</p>
            <a href={quoteHref}>Get an exact quote <span>→</span></a>
          </aside>
        </section>

        <section className="route-planning-section">
          <div className="route-wrap">
            <div className="route-section-heading">
              <p className="route-kicker">Planned around you</p>
              <h2>Clear details.<br /><em>No last-minute guessing.</em></h2>
            </div>
            <div className="route-planning-grid">
              {route.planningPoints.map((point, index) => (
                <article key={point.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{point.title}</h3><p>{point.copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="route-airport-section route-wrap">
          <div>
            <p className="route-kicker">Why this route</p>
            <h2>{route.airportHeading}</h2>
            <p>{route.airportCopy}</p>
          </div>
          <div className="route-useful-for">
            <small>Useful for</small>
            <ul>{route.usefulFor.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="route-faq-section" aria-labelledby="route-faq-heading">
          <div className="route-wrap">
            <div className="route-section-heading">
              <p className="route-kicker">Before you book</p>
              <h2 id="route-faq-heading">Questions about<br /><em>this airport journey.</em></h2>
            </div>
            <div className="route-faq-list">
              {faqs.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="route-other-routes route-wrap" aria-labelledby="other-airports-heading">
          <div className="route-section-heading">
            <p className="route-kicker">Other airports</p>
            <h2 id="other-airports-heading">Compare another<br /><em>route from Hull.</em></h2>
          </div>
          <div className="route-mini-grid">
            {airportRoutes.filter((item) => item.slug !== route.slug).map((item) => (
              <a href={`/airport-transfers/${item.slug}`} key={item.slug}>
                <span>{item.shortName}</span><strong>from £{item.price}</strong><small>→</small>
              </a>
            ))}
          </div>
        </section>

        <section className="route-final-cta">
          <div className="route-wrap">
            <p className="route-kicker">Request a fixed quote</p>
            <h2>Your journey to<br /><em>{route.shortName}.</em></h2>
            <p>Share the address, date, flight, passengers and luggage. MF Travel will confirm the exact journey and fare before accepting the booking.</p>
            <a className="route-button route-button--gold" href={quoteHref}>Request this transfer</a>
          </div>
        </section>
      </main>

      <footer className="route-footer">
        <div className="route-wrap"><span>MF Travel · Hull</span><a href="/airport-transfers">All airport transfers</a></div>
      </footer>
    </div>
  );
}
