import type { Metadata } from "next";
import { airportRoutes } from "./route-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mftravel.co.uk";

export const metadata: Metadata = {
  title: "Airport Transfers from Hull",
  description: "Compare MF Travel guide fares and plan pre-booked airport transfers from Hull and East Riding to Manchester, Leeds Bradford, Humberside, East Midlands and Liverpool.",
  alternates: { canonical: "/airport-transfers" },
  openGraph: {
    title: "Airport Transfers from Hull | MF Travel",
    description: "Pre-booked, door-to-terminal airport travel from Hull and East Riding with clear guide fares.",
    url: "/airport-transfers",
    images: [{ url: "/mf-travel-airport-hero.webp", width: 1536, height: 1024, alt: "MF Travel airport transfer vehicles" }],
  },
};

export default function AirportTransfersPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Airport transfers", item: `${siteUrl}/airport-transfers` },
        ],
      },
      {
        "@type": "ItemList",
        name: "Airport transfers from Hull",
        itemListElement: airportRoutes.map((route, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: route.title,
          url: `${siteUrl}/airport-transfers/${route.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="route-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="route-header">
        <a className="route-brand" href="/" aria-label="MF Travel home"><strong>MF</strong><span>Travel</span></a>
        <nav aria-label="Airport page navigation">
          <a href="/">Home</a>
          <a aria-current="page" href="/airport-transfers">Airport transfers</a>
          <a className="route-header-cta" href="/#quote">Get a quote</a>
        </nav>
      </header>

      <main>
        <section className="route-hub-hero">
          <div className="route-hub-hero__image" aria-hidden="true" />
          <div className="route-hub-hero__shade" aria-hidden="true" />
          <div className="route-wrap route-hub-hero__content">
            <p className="route-kicker">MF Travel · Hull &amp; East Riding</p>
            <h1>Airport transfers<br />planned <em>door to terminal.</em></h1>
            <p>Compare guide fares for the airports Hull travellers use most, then request one clear quote for the outward journey, return collection or both.</p>
            <div className="route-hero-actions">
              <a className="route-button route-button--gold" href="/#quote">Request a quote</a>
              <a className="route-text-link" href="#routes">Explore routes <span>↓</span></a>
            </div>
          </div>
        </section>

        <section className="route-intro route-wrap" aria-labelledby="airport-service-heading">
          <div>
            <p className="route-kicker">A pre-booked service</p>
            <h2 id="airport-service-heading">The holiday starts<br /><em>at your door.</em></h2>
          </div>
          <div className="route-intro-copy">
            <p>MF Travel focuses on journeys that benefit from proper planning: airport transfers, longer-distance travel and repeat bookings. It is not a reactive city-centre taxi service.</p>
            <ul className="route-tick-list">
              <li>One pickup and one drop-off included in the guide fare</li>
              <li>Flight and luggage details checked before travel</li>
              <li>Pre-booked journeys available day or night, subject to availability</li>
            </ul>
          </div>
        </section>

        <section className="route-list-section" id="routes" aria-labelledby="route-list-heading">
          <div className="route-wrap">
            <div className="route-section-heading">
              <p className="route-kicker">Priority routes</p>
              <h2 id="route-list-heading">From Hull to<br /><em>five key airports.</em></h2>
              <p>Every route page explains the guide fare, likely journey time, what is included and how the return collection is planned.</p>
            </div>
            <div className="route-card-grid">
              {airportRoutes.map((route, index) => (
                <a className="route-card" href={`/airport-transfers/${route.slug}`} key={route.slug}>
                  <span className="route-card__number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p>Hull to</p>
                    <h3>{route.airport}</h3>
                    <small>Approx. {route.miles} miles · {route.journeyTime}</small>
                  </div>
                  <strong><small>guide fare</small>£{route.price}</strong>
                  <span className="route-card__arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
            <p className="route-list-note">Newcastle, Birmingham, Teesside, Heathrow, Gatwick, Stansted and other UK airports are also available by individual quote.</p>
          </div>
        </section>

        <section className="route-process route-wrap" aria-labelledby="route-process-heading">
          <div className="route-section-heading">
            <p className="route-kicker">How booking works</p>
            <h2 id="route-process-heading">Clear before<br /><em>collection day.</em></h2>
          </div>
          <ol>
            <li><span>01</span><h3>Share the journey</h3><p>Pickup, airport, date, time, passengers, cases and flight number.</p></li>
            <li><span>02</span><h3>Receive the quote</h3><p>The agreed route, fare, included charges and relevant terms are confirmed.</p></li>
            <li><span>03</span><h3>Travel as planned</h3><p>MF Travel collects from the agreed address and takes you to the terminal.</p></li>
          </ol>
        </section>

        <section className="route-final-cta">
          <div className="route-wrap">
            <p className="route-kicker">Ready when you are</p>
            <h2>Tell us where<br /><em>you are flying from.</em></h2>
            <p>Request an outward journey, return collection or both in one straightforward message.</p>
            <a className="route-button route-button--gold" href="/#quote">Plan my airport journey</a>
          </div>
        </section>
      </main>

      <footer className="route-footer">
        <div className="route-wrap"><span>MF Travel · Hull</span><a href="/">Journeys that matter.</a></div>
      </footer>
    </div>
  );
}
