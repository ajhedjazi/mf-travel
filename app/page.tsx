"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const navItems = [
  { id: "home", label: "Home", short: "Home", icon: "home" },
  { id: "airport", label: "Airport transfers", short: "Airport", icon: "plane" },
  { id: "distance", label: "Long distance", short: "Long distance", icon: "route" },
  { id: "service", label: "Our service", short: "Service", icon: "spark" },
  { id: "about", label: "About us", short: "About", icon: "people" },
  { id: "quote", label: "Get a quote", short: "Quote", icon: "mail" },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></>,
    plane: <><path d="M22 16 13.5 12V4.5a1.5 1.5 0 0 0-3 0V12L2 16v2l8.5-2.5V21L8 22.5V24l4-1 4 1v-1.5L13.5 21v-5.5L22 18Z"/></>,
    route: <><circle cx="7" cy="17" r="3"/><path d="M7 14V8a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v8"/><circle cx="17" cy="19" r="2"/></>,
    spark: <><path d="m12 2 2.2 6.2L20 11l-5.8 2.8L12 20l-2.2-6.2L4 11l5.8-2.8Z"/></>,
    people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.4-4 2.4-6 6-6s5.6 2 6 6"/><path d="M15 14c3.4 0 5.4 2 5.8 6"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.2 8-8 10-4.8-2-8-5-8-10V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    person: <><circle cx="12" cy="7" r="4"/><path d="M4 22v-3c0-4 3-7 8-7s8 3 8 7v3"/></>,
    car: <><path d="m5 10 2-5h10l2 5"/><path d="M4 10h16l1 3v6h-3v-2H6v2H3v-6Z"/><circle cx="7" cy="13.5" r="1"/><circle cx="17" cy="13.5" r="1"/></>,
    luggage: <><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M9 8V5h6v3M9 12v5M15 12v5M9 24h0M15 24h0"/></>,
    arrow: <><path d="M4 12h15M14 7l5 5-5 5"/></>,
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

export default function Home() {
  const scroller = useRef<HTMLElement>(null);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
    setMenuOpen(false);
  };

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const sections = navItems.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { root, threshold: [0.35, 0.65] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      if (window.innerWidth <= 820 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if ((event.target as HTMLElement).closest(".quote-card")) return;
      event.preventDefault();
      root.scrollBy({ left: event.deltaY, behavior: "auto" });
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("Your journey details are ready. No request has been sent yet — online sending will be enabled when MF Travel confirms its booking contact.");
  };

  return (
    <div className="site-shell">
      <aside className="side-rail" aria-label="Main navigation">
        <button className="brand-button" onClick={() => goTo("home")} aria-label="MF Travel home"><Wordmark /></button>
        <nav className="rail-nav">
          {navItems.map((item) => (
            <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => goTo(item.id)} aria-current={active === item.id ? "page" : undefined}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-note"><span>Hull</span><small>Pre-booked travel</small></div>
      </aside>

      <header className="mobile-header">
        <button className="brand-button" onClick={() => goTo("home")} aria-label="MF Travel home"><Wordmark compact /></button>
        <button className={`menu-button${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}><span /><span /><span /></button>
        {menuOpen && <div className="mobile-menu">{navItems.map((item) => <button key={item.id} onClick={() => goTo(item.id)}>{item.label}</button>)}</div>}
      </header>

      <main className="panel-scroller" ref={scroller}>
        <section id="home" className="panel hero-panel">
          <div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" />
          <div className="hero-content">
            <Eyebrow>MF Travel · Hull</Eyebrow>
            <h1>Journeys<br />that <em>matter.</em></h1>
            <p className="hero-intro">Pre-booked airport transfers and long-distance travel, planned around you.</p>
            <div className="hero-actions">
              <button className="button button--gold" onClick={() => goTo("quote")}>Get a quote <Icon name="arrow" /></button>
              <button className="text-button" onClick={() => goTo("airport")}>Explore the service <span>↓</span></button>
            </div>
          </div>
          <div className="trust-strip" aria-label="Service priorities">
            <div><Icon name="clock" /><p><strong>Punctual</strong><span>Time matters</span></p></div>
            <div><Icon name="shield" /><p><strong>Prepared</strong><span>Journeys planned ahead</span></p></div>
            <div><Icon name="person" /><p><strong>Personal</strong><span>Direct, local service</span></p></div>
            <div><Icon name="car" /><p><strong>Comfortable</strong><span>Room to settle in</span></p></div>
          </div>
          <div className="panel-count"><span>01</span> / 06</div>
        </section>

        <section id="airport" className="panel content-panel airport-panel">
          <div className="panel-copy">
            <Eyebrow>Airport transfers</Eyebrow>
            <h2>Start the trip<br />before <em>take-off.</em></h2>
            <p className="lead">A calm, pre-booked journey from Hull to the airport, with your pickup planned in advance.</p>
            <div className="feature-list">
              <article><span>01</span><div><h3>Door-to-terminal</h3><p>Collection from your chosen Hull or surrounding-area address.</p></div></article>
              <article><span>02</span><div><h3>Built around your flight</h3><p>Tell us the flight and luggage details when you request a quote.</p></div></article>
              <article><span>03</span><div><h3>Return journeys</h3><p>Ask for outward, return or both legs in one straightforward request.</p></div></article>
            </div>
            <button className="button button--line" onClick={() => goTo("quote")}>Plan an airport journey <Icon name="arrow" /></button>
          </div>
          <div className="editorial-card editorial-card--airport"><span className="card-number">A</span><div><Icon name="plane" /><p>Hull to the terminal</p><small>Pre-booked. Planned. Personal.</small></div></div>
          <div className="panel-count"><span>02</span> / 06</div>
        </section>

        <section id="distance" className="panel content-panel distance-panel">
          <div className="route-art" aria-hidden="true"><span className="route-dot route-dot--one" /><span className="route-line" /><span className="route-dot route-dot--two" /><small>Hull</small><small>Wherever matters</small></div>
          <div className="panel-copy panel-copy--right">
            <Eyebrow>Long-distance travel</Eyebrow>
            <h2>More than<br />a run <em>across town.</em></h2>
            <p className="lead">For the journeys that deserve a proper plan: events, business travel, family visits and destinations beyond Hull.</p>
            <div className="statements">
              <p><Icon name="luggage" /><span><strong>Space for the journey</strong>Share passenger and luggage details before you travel.</span></p>
              <p><Icon name="route" /><span><strong>A clear route</strong>Request your pickup and destination directly—without chasing a city-centre cab.</span></p>
              <p><Icon name="person" /><span><strong>A familiar service</strong>Designed for repeat customers who value straightforward travel.</span></p>
            </div>
            <button className="button button--line" onClick={() => goTo("quote")}>Request a journey <Icon name="arrow" /></button>
          </div>
          <div className="panel-count"><span>03</span> / 06</div>
        </section>

        <section id="service" className="panel content-panel service-panel">
          <div className="panel-copy service-heading">
            <Eyebrow>Our service</Eyebrow>
            <h2>Travel with<br /><em>intention.</em></h2>
            <p className="lead">MF Travel is being shaped around the journeys people want to arrange properly—not reactive city-centre taxi work.</p>
          </div>
          <div className="service-grid">
            <article><span>01</span><Icon name="clock" /><h3>Pre-booked</h3><p>Time to understand the journey before collection day.</p></article>
            <article><span>02</span><Icon name="person" /><h3>Personal</h3><p>Direct communication with a small, Hull-based team.</p></article>
            <article><span>03</span><Icon name="car" /><h3>Considered</h3><p>A service focused on comfort, clarity and the details.</p></article>
          </div>
          <div className="panel-count"><span>04</span> / 06</div>
        </section>

        <section id="about" className="panel content-panel about-panel">
          <div className="about-mark" aria-hidden="true">MF</div>
          <div className="panel-copy panel-copy--right">
            <Eyebrow>About MF Travel</Eyebrow>
            <h2>Local people.<br />A better way<br />to <em>book travel.</em></h2>
            <p className="lead">MF Travel is a Hull-based private-hire and airport-transfer business being developed by Amir and Mark.</p>
            <p className="body-copy">The idea is simple: focus on airport transfers, longer journeys and repeat bookings where reliability and personal service matter most.</p>
            <button className="button button--line" onClick={() => goTo("quote")}>Tell us your journey <Icon name="arrow" /></button>
          </div>
          <div className="panel-count"><span>05</span> / 06</div>
        </section>

        <section id="quote" className="panel content-panel quote-panel">
          <div className="panel-copy quote-copy">
            <Eyebrow>Request a quote</Eyebrow>
            <h2>Where can we<br /><em>take you?</em></h2>
            <p className="lead">Share the journey details below. You’ll see a clear notice before anything is sent.</p>
            <div className="contact-pending"><Icon name="mail" /><p><strong>Booking contact coming soon</strong><span>No phone number or email has been published without confirmation.</span></p></div>
          </div>
          <form className="quote-card" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Pickup<input name="pickup" autoComplete="street-address" placeholder="Pickup address or area" required /></label>
              <label>Destination<input name="destination" placeholder="Airport or destination" required /></label>
            </div>
            <div className="form-row form-row--three">
              <label>Date<input name="date" type="date" required /></label>
              <label>Time<input name="time" type="time" required /></label>
              <label>Passengers<select name="passengers" defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></label>
            </div>
            <div className="form-row">
              <label>Name<input name="name" autoComplete="name" placeholder="Your name" required /></label>
              <label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            </div>
            <label>Journey notes<textarea name="notes" rows={3} placeholder="Return leg, flight number, luggage or anything else we should know" /></label>
            <button className="button button--gold button--full" type="submit">Prepare quote request <Icon name="arrow" /></button>
            {formMessage && <p className="form-message" role="status">{formMessage}</p>}
          </form>
          <div className="panel-count"><span>06</span> / 06</div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[navItems[0], navItems[1], navItems[2], navItems[5]].map((item) => (
          <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => goTo(item.id)} aria-current={active === item.id ? "page" : undefined}><Icon name={item.icon} /><span>{item.short}</span></button>
        ))}
      </nav>
    </div>
  );
}
