"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { allAirportFares } from "./airport-transfers/route-data";

type TimeTheme = "day" | "night";

const fares = allAirportFares;

const faqItems = [
  {
    question: "Are the airport fares fixed?",
    answer: "The prices shown are guide fares from Hull. Your confirmed quote is fixed for the journey details agreed with you; a different pickup, extra stop or change of journey may alter it before booking.",
  },
  {
    question: "What is included in my quote?",
    answer: "Guide fares assume one pickup, one drop-off, normal luggage and the standard airport charge. Your written quote will state exactly what is included, including any different parking, waiting or extra-stop cost.",
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "Share your flight number so the latest arrival information can be checked and the collection planned around it. Any included waiting time and possible additional parking or waiting cost will be made clear before you confirm.",
  },
  {
    question: "Can I travel early in the morning or late at night?",
    answer: "Yes. Airport pickups can be arranged at any hour, subject to advance booking and availability. The journey may be available around the clock even when the enquiry line is not staffed 24 hours a day.",
  },
  {
    question: "How many passengers and bags can you take?",
    answer: "Each car carries up to four passengers. Luggage space depends on the number and size of bags, so tell us exactly what you are bringing and we will confirm the suitable vehicle.",
  },
  {
    question: "Can I book both parts of my trip?",
    answer: "Yes. Request the outward journey, the return collection, or both together. Add the return date and flight details to your journey notes.",
  },
  {
    question: "How do I pay, and can I get a receipt?",
    answer: "Your booking confirmation will state the available payment method or methods and when payment is due. A receipt can be provided for your records.",
  },
  {
    question: "What are the deposit and cancellation terms?",
    answer: "If a deposit is required, its amount and due date will be stated before you book. The cancellation and change terms will also be provided in writing before MF Travel accepts the journey.",
  },
];

const navItems = [
  { id: "home", label: "Home", short: "Home", icon: "home" },
  { id: "airport", label: "Airport transfers", short: "Airports", icon: "plane" },
  { id: "fares", label: "Guide fares", short: "Fares", icon: "price" },
  { id: "fleet", label: "Our fleet", short: "Fleet", icon: "car" },
  { id: "distance", label: "Long distance", short: "Distance", icon: "route" },
  { id: "service", label: "Our service", short: "Service", icon: "spark" },
  { id: "faq", label: "Questions", short: "FAQ", icon: "question" },
  { id: "quote", label: "Get a quote", short: "Quote", icon: "mail" },
];

const rawBookingNumber = process.env.NEXT_PUBLIC_BOOKING_PHONE?.trim() ?? "";
const bookingEmail = process.env.NEXT_PUBLIC_BOOKING_EMAIL?.trim() ?? "";
const operatorLicence = process.env.NEXT_PUBLIC_OPERATOR_LICENCE?.trim() ?? "";
const licensingAuthority = process.env.NEXT_PUBLIC_LICENSING_AUTHORITY?.trim() ?? "";
const whatsappNumber = rawBookingNumber
  ? rawBookingNumber.replace(/\D/g, "").replace(/^0/, "44")
  : "";

function getUkTimeTheme(): TimeTheme {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );

  return hour >= 7 && hour < 19 ? "day" : "night";
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></>,
    plane: <><path d="M22 16 13.5 12V4.5a1.5 1.5 0 0 0-3 0V12L2 16v2l8.5-2.5V21L8 22.5V24l4-1 4 1v-1.5L13.5 21v-5.5L22 18Z"/></>,
    route: <><circle cx="7" cy="17" r="3"/><path d="M7 14V8a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v8"/><circle cx="17" cy="19" r="2"/></>,
    spark: <><path d="m12 2 2.2 6.2L20 11l-5.8 2.8L12 20l-2.2-6.2L4 11l5.8-2.8Z"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.2 8-8 10-4.8-2-8-5-8-10V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    person: <><circle cx="12" cy="7" r="4"/><path d="M4 22v-3c0-4 3-7 8-7s8 3 8 7v3"/></>,
    car: <><path d="m5 10 2-5h10l2 5"/><path d="M4 10h16l1 3v6h-3v-2H6v2H3v-6Z"/><circle cx="7" cy="13.5" r="1"/><circle cx="17" cy="13.5" r="1"/></>,
    luggage: <><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M9 8V5h6v3M9 12v5M15 12v5M9 24h0M15 24h0"/></>,
    arrow: <><path d="M4 12h15M14 7l5 5-5 5"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></>,
    moon: <path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/>,
    price: <><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-1-1.8-1.5-3.2-1.5-1.7 0-3 1-3 2.4 0 3.6 6.4 1.8 6.4 5.2 0 1.4-1.3 2.4-3.2 2.4-1.5 0-2.7-.6-3.5-1.7M12 5v14"/></>,
    question: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.7 2.7 0 1 1 3.3 2.7c-.7.3-.9.8-.9 1.6M12 17h.01"/></>,
    phone: <path d="M5.2 3.5 8 3l2 5-2 1.5c1.3 2.7 3.3 4.7 6 6L15.5 13l5 2-.5 2.8c-.3 1.6-1.7 2.7-3.3 2.5C9.6 19.4 4.6 14.4 3.7 7.3 3.5 5.7 4 4.3 5.2 3.5Z"/>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="1"/><path d="M16 8V5H5v11h3"/></>,
  };

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`wordmark${compact ? " wordmark--compact" : ""}`} aria-label="MF Travel">
      <span>MF</span><small>Travel</small>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow"><span />{children}</p>;
}

function PanelCount({ current }: { current: number }) {
  return <div className="panel-count"><span>{String(current).padStart(2, "0")}</span> / 08</div>;
}

export default function Home() {
  const scroller = useRef<HTMLElement>(null);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [requestDraft, setRequestDraft] = useState("");
  const [journeyDestination, setJourneyDestination] = useState("");
  const [automaticTheme, setAutomaticTheme] = useState<TimeTheme>("night");
  const [themeOverride, setThemeOverride] = useState<TimeTheme | null>(null);
  const theme = themeOverride ?? automaticTheme;

  const toggleTheme = () => {
    setThemeOverride((current) => current === null ? (automaticTheme === "day" ? "night" : "day") : null);
  };

  const goTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (window.innerWidth <= 820) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const root = scroller.current ?? target.closest<HTMLElement>(".panel-scroller");
      if (root) root.scrollLeft = target.offsetLeft;
    }
    setActive(id);
    setMenuOpen(false);
  };

  const chooseFare = (airport: string) => {
    setJourneyDestination(airport);
    goTo("quote");
  };

  useEffect(() => {
    const updateTheme = () => setAutomaticTheme(getUkTimeTheme());
    updateTheme();
    const timer = window.setInterval(updateTheme, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const destination = new URLSearchParams(window.location.search).get("destination");
    const timer = window.setTimeout(() => {
      if (destination) setJourneyDestination(destination);
      if (window.location.hash === "#quote") goTo("quote");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const sections = navItems.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { root, threshold: [0.35, 0.65] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      if (window.innerWidth <= 820 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if ((event.target as HTMLElement).closest(".quote-card, .faq-grid")) return;
      event.preventDefault();
      root.scrollBy({ left: event.deltaY, behavior: "auto" });
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const draft = [
      "Hello MF Travel, I would like a quote.",
      "",
      `Pickup: ${data.get("pickup")}`,
      `Destination: ${data.get("destination")}`,
      `Date and time: ${data.get("date")} at ${data.get("time")}`,
      `Passengers: ${data.get("passengers")}`,
      `Luggage: ${data.get("luggage") || "Not stated"}`,
      `Name: ${data.get("name")}`,
      `Contact: ${data.get("contact")}`,
      `Notes: ${data.get("notes") || "None"}`,
    ].join("\n");

    setRequestDraft(draft);

    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(draft)}`, "_blank", "noopener,noreferrer");
      setFormMessage("Your request has been prepared and opened in WhatsApp. Check the details, then press send.");
      return;
    }

    try {
      await navigator.clipboard.writeText(draft);
      setFormMessage("Your request is ready and copied. The MF Travel booking number is being confirmed, so nothing has been sent yet.");
    } catch {
      setFormMessage("Your request is ready below. The MF Travel booking number is being confirmed, so nothing has been sent yet.");
    }
  };

  const copyDraft = async () => {
    if (!requestDraft) return;
    await navigator.clipboard.writeText(requestDraft);
    setFormMessage("Journey request copied.");
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TransportationService",
        name: "MF Travel",
        description: "Pre-booked airport transfers and long-distance private-hire travel from Hull.",
        areaServed: ["Hull", "East Riding of Yorkshire", "Beverley", "Cottingham", "Hessle", "Anlaby", "Willerby", "Brough"],
        serviceType: ["Airport transfer", "Long-distance private hire", "24-hour pre-booked airport travel"],
        ...(rawBookingNumber ? { telephone: rawBookingNumber } : {}),
        ...(bookingEmail ? { email: bookingEmail } : {}),
        ...(operatorLicence && licensingAuthority
          ? {
              identifier: {
                "@type": "PropertyValue",
                name: `${licensingAuthority} private-hire operator licence`,
                value: operatorLicence,
              },
            }
          : {}),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Guide airport fares from Hull",
          itemListElement: fares.map((fare) => ({
            "@type": "Offer",
            priceCurrency: "GBP",
            price: fare.price,
            description: `Guide fare from Hull to ${fare.airport}; final quote depends on journey details.`,
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <div className="site-shell" data-theme={theme}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <aside className="side-rail" aria-label="Main navigation">
        <button className="brand-button" onClick={() => goTo("home")} aria-label="MF Travel home"><Wordmark /></button>
        <nav className="rail-nav">
          {navItems.map((item) => (
            <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => goTo(item.id)} aria-current={active === item.id ? "page" : undefined}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="theme-toggle theme-toggle--rail" onClick={toggleTheme} aria-label={themeOverride === null ? `Switch to ${theme === "day" ? "night" : "day"} theme` : "Use automatic UK-time theme"}>
          <Icon name={theme === "day" ? "sun" : "moon"} />
          <span>{theme === "day" ? "Day" : "Night"}</span>
          <small>{themeOverride === null ? "UK time" : "Manual"}</small>
        </button>
        <div className="rail-note"><span>Hull</span><small>Pre-booked travel</small></div>
      </aside>

      <header className="mobile-header">
        <button className="brand-button" onClick={() => goTo("home")} aria-label="MF Travel home"><Wordmark compact /></button>
        <div className="mobile-actions">
          <button className="theme-toggle theme-toggle--mobile" onClick={toggleTheme} aria-label={themeOverride === null ? `Switch to ${theme === "day" ? "night" : "day"} theme` : "Use automatic UK-time theme"}><Icon name={theme === "day" ? "sun" : "moon"} /></button>
          <button className={`menu-button${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}><span /><span /><span /></button>
        </div>
        {menuOpen && <div className="mobile-menu">{navItems.map((item) => <button key={item.id} onClick={() => goTo(item.id)}>{item.label}</button>)}</div>}
      </header>

      <main className="panel-scroller" ref={scroller}>
        <section id="home" className="panel hero-panel">
          <div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" />
          <div className="hero-content">
            <Eyebrow>MF Travel · Hull</Eyebrow>
            <h1>Journeys<br />that <em>matter.</em></h1>
            <p className="hero-intro">Pre-booked airport transfers from Hull and East Riding, plus long-distance travel planned around you.</p>
            <div className="hero-actions">
              <button className="button button--gold" onClick={() => goTo("quote")}>Get a quote <Icon name="arrow" /></button>
              <button className="text-button" onClick={() => goTo("fares")}>See guide fares <span>→</span></button>
            </div>
          </div>
          <div className="trust-strip" aria-label="Service priorities">
            <div><Icon name="clock" /><p><strong>Day or night</strong><span>Pre-booked around your flight</span></p></div>
            <div><Icon name="price" /><p><strong>Clear quote</strong><span>Know the agreed fare</span></p></div>
            <div><Icon name="person" /><p><strong>Personal</strong><span>A local two-person team</span></p></div>
            <div><Icon name="car" /><p><strong>Comfortable</strong><span>Two estate-class cars</span></p></div>
          </div>
          <PanelCount current={1} />
        </section>

        <section id="airport" className="panel content-panel airport-panel">
          <div className="panel-copy">
            <Eyebrow>Airport transfers from Hull</Eyebrow>
            <h2>Your holiday<br />starts at <em>the door.</em></h2>
            <p className="lead">Door-to-terminal travel from Hull, Beverley, Cottingham, Hessle, Anlaby, Willerby, Brough and the wider East Riding, with flight and luggage details agreed before collection.</p>
            <div className="feature-list">
              <article><span>01</span><div><h3>Flight-aware planning</h3><p>Share the flight number so pickup and return timings can be planned around the latest information.</p></div></article>
              <article><span>02</span><div><h3>One clear quote</h3><p>Your confirmation states the agreed journey and which airport or parking charges are included.</p></div></article>
              <article><span>03</span><div><h3>Outward and return</h3><p>Arrange Manchester, Leeds Bradford, Humberside and other airport journeys in one request.</p></div></article>
            </div>
            <a className="button button--line" href="/airport-transfers">View airport routes <Icon name="arrow" /></a>
          </div>
          <div className="editorial-card editorial-card--airport"><span className="card-number">A</span><div><Icon name="plane" /><p>Hull to the terminal</p><small>Pre-booked. Planned. Personal.</small></div></div>
          <PanelCount current={2} />
        </section>

        <section id="fares" className="panel content-panel fares-panel">
          <div className="panel-copy fares-copy">
            <Eyebrow>Guide fares from Hull</Eyebrow>
            <h2>Clear from<br /><em>the outset.</em></h2>
            <p className="lead">A useful starting point for the airports Hull travellers use most. Choose a route to begin your request.</p>
            <p className="fare-smallprint">Guide fares are for a direct journey from Hull with one pickup, one drop-off, normal luggage and the standard airport charge included. Your exact address, date, stops, passengers and luggage are confirmed in the final quote.</p>
          </div>
          <div className="fare-board" aria-label="Airport guide fares">
            {fares.map((fare) => fare.slug ? (
              <a className="fare-row" href={`/airport-transfers/${fare.slug}`} key={fare.airport}>
                <span><strong>{fare.airport}</strong><small>{fare.note} · View route</small></span>
                <span className="fare-price"><small>guide</small>£{fare.price}</span>
                <Icon name="arrow" />
              </a>
            ) : (
              <button className="fare-row" key={fare.airport} onClick={() => chooseFare(fare.airport)}>
                <span><strong>{fare.airport}</strong><small>{fare.note} · Request quote</small></span>
                <span className="fare-price"><small>guide</small>£{fare.price}</span>
                <Icon name="arrow" />
              </button>
            ))}
            <p>Teesside, Heathrow, Gatwick, Stansted and other UK airports or long-distance destinations are quoted individually.</p>
          </div>
          <PanelCount current={3} />
        </section>

        <section id="fleet" className="panel content-panel fleet-panel">
          <div className="panel-copy fleet-heading">
            <Eyebrow>Our fleet</Eyebrow>
            <h2>Room to<br /><em>settle in.</em></h2>
            <p className="lead">Two comfortable cars for airport transfers, longer journeys and repeat customers.</p>
            <p className="body-copy">Each vehicle carries up to four passengers. Tell us the number and size of your cases and cabin bags so luggage space can be confirmed before booking.</p>
          </div>
          <div className="fleet-grid">
            <article className="fleet-card fleet-card--volvo"><div className="fleet-photo" aria-hidden="true" /><span>01</span><div><p>White</p><h3>2019 Volvo V60 R-Line</h3><small>Estate · Up to 4 passengers</small></div></article>
            <article className="fleet-card fleet-card--insignia"><div className="fleet-photo" aria-hidden="true" /><span>02</span><div><p>Arctic Silver</p><h3>2017 Vauxhall Insignia</h3><small>Hatchback · Up to 4 passengers</small></div></article>
          </div>
          <PanelCount current={4} />
        </section>

        <section id="distance" className="panel content-panel distance-panel">
          <div className="route-art" aria-hidden="true"><span className="route-dot route-dot--one" /><span className="route-line" /><span className="route-dot route-dot--two" /><small>Hull</small><small>Wherever matters</small></div>
          <div className="panel-copy panel-copy--right">
            <Eyebrow>Long-distance private hire</Eyebrow>
            <h2>More than<br />a run <em>across town.</em></h2>
            <p className="lead">For events, business travel, cruise terminals, family visits and UK destinations that deserve a proper plan.</p>
            <div className="statements">
              <p><Icon name="luggage" /><span><strong>Space checked</strong>Passenger and luggage details agreed before travel.</span></p>
              <p><Icon name="route" /><span><strong>Route agreed</strong>Pickup, stops and destination stated in your quote.</span></p>
              <p><Icon name="person" /><span><strong>Direct service</strong>Designed for customers who prefer a familiar local team.</span></p>
            </div>
            <button className="button button--line" onClick={() => goTo("quote")}>Request a journey <Icon name="arrow" /></button>
          </div>
          <PanelCount current={5} />
        </section>

        <section id="service" className="panel content-panel service-panel">
          <div className="panel-copy service-heading">
            <Eyebrow>About MF Travel</Eyebrow>
            <h2>Local people.<br /><em>Properly planned.</em></h2>
            <p className="lead">MF Travel is being developed in Hull by Amir and Mark around airport transfers, longer journeys and repeat bookings—not reactive city-centre taxi work.</p>
            {operatorLicence && licensingAuthority && (
              <p className="compliance-note"><Icon name="shield" /><span><strong>Licensed private-hire operator</strong>{licensingAuthority} · Licence {operatorLicence}. Journeys are carried out by appropriately licensed drivers and vehicles with the required private-hire insurance.</span></p>
            )}
          </div>
          <div className="service-grid service-grid--four">
            <article><span>01</span><Icon name="clock" /><h3>Day or night</h3><p>Pre-booked airport journeys arranged around departure and arrival times.</p></article>
            <article><span>02</span><Icon name="price" /><h3>Transparent</h3><p>The agreed journey and fare confirmed clearly.</p></article>
            <article><span>03</span><Icon name="plane" /><h3>Flight-aware</h3><p>Flight information used to plan airport collections.</p></article>
            <article><span>04</span><Icon name="person" /><h3>Personal</h3><p>Direct communication with a small local team.</p></article>
          </div>
          <PanelCount current={6} />
        </section>

        <section id="faq" className="panel content-panel faq-panel">
          <div className="panel-copy faq-heading">
            <Eyebrow>Good to know</Eyebrow>
            <h2>Before<br />you <em>book.</em></h2>
            <p className="lead">Practical answers without the small print being hidden.</p>
          </div>
          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <PanelCount current={7} />
        </section>

        <section id="quote" className="panel content-panel quote-panel">
          <div className="panel-copy quote-copy">
            <Eyebrow>Request a quote</Eyebrow>
            <h2>Where can we<br /><em>take you?</em></h2>
            <p className="lead">Give us the useful details once. The form prepares a clear request and never sends anything without you.</p>
            {rawBookingNumber ? (
              <div className="contact-actions">
                <a className="button button--line" href={`tel:${rawBookingNumber}`}><Icon name="phone" /> Call MF Travel</a>
                <a className="button button--gold" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"><Icon name="mail" /> WhatsApp</a>
                {bookingEmail && <a className="button button--line" href={`mailto:${bookingEmail}`}><Icon name="mail" /> Email</a>}
              </div>
            ) : (
              <div className="contact-pending"><Icon name="phone" /><p><strong>Booking line being confirmed</strong><span>Your request can be prepared now. Call and WhatsApp will appear here as soon as the shared business number is confirmed.</span></p></div>
            )}
          </div>
          <form className="quote-card" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Pickup<input name="pickup" autoComplete="street-address" placeholder="Pickup address or area" required /></label>
              <label>Destination<input name="destination" value={journeyDestination} onChange={(event) => setJourneyDestination(event.target.value)} placeholder="Airport or destination" required /></label>
            </div>
            <div className="form-row form-row--three">
              <label>Date<input name="date" type="date" required /></label>
              <label>Time<input name="time" type="time" required /></label>
              <label>Passengers<select name="passengers" defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
            </div>
            <div className="form-row">
              <label>Name<input name="name" autoComplete="name" placeholder="Your name" required /></label>
              <label>Phone or email<input name="contact" autoComplete="tel" placeholder="Best way to contact you" required /></label>
            </div>
            <label>Luggage<input name="luggage" placeholder="e.g. 2 large cases and 2 cabin bags" /></label>
            <label>Journey notes<textarea name="notes" rows={3} placeholder="Return leg, flight number, extra stops or anything else we should know" /></label>
            <button className="button button--gold button--full" type="submit">{rawBookingNumber ? "Prepare in WhatsApp" : "Prepare quote request"} <Icon name="arrow" /></button>
            {formMessage && <p className="form-message" role="status">{formMessage}</p>}
            {requestDraft && !rawBookingNumber && <div className="request-draft"><pre>{requestDraft}</pre><button type="button" onClick={copyDraft}><Icon name="copy" /> Copy request</button></div>}
          </form>
          <PanelCount current={8} />
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[navItems[0], navItems[2], navItems[3], navItems[7]].map((item) => (
          <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => goTo(item.id)} aria-current={active === item.id ? "page" : undefined}><Icon name={item.icon} /><span>{item.short}</span></button>
        ))}
      </nav>

      {rawBookingNumber && (
        <div className="mobile-contact-bar" aria-label="Contact MF Travel">
          <a href={`tel:${rawBookingNumber}`}><Icon name="phone" /><span>Call</span></a>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"><Icon name="mail" /><span>WhatsApp</span></a>
        </div>
      )}
    </div>
  );
}
