'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '../prototype.module.css';

type Quote = { price: number; label: string };

const fixedQuotes: Array<{ match: string; quote: Quote }> = [
  { match: 'manchester airport', quote: { price: 155, label: 'Fixed airport fare' } },
  { match: 'heathrow', quote: { price: 300, label: 'Fixed airport fare' } },
  { match: 'leeds bradford', quote: { price: 100, label: 'Fixed airport fare' } },
  { match: 'birmingham airport', quote: { price: 180, label: 'Prototype fixed fare' } },
];

export default function BookPage() {
  const [pickup, setPickup] = useState('Hull');
  const [destination, setDestination] = useState('Manchester Airport');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flight, setFlight] = useState('');
  const [quoted, setQuoted] = useState(false);
  const [booked, setBooked] = useState(false);
  const [reference, setReference] = useState('');

  const quote = useMemo<Quote>(() => {
    const haystack = `${pickup} ${destination}`.toLowerCase();
    const fixed = fixedQuotes.find(({ match }) => haystack.includes(match));
    if (fixed) return fixed.quote;
    return { price: 45, label: 'Prototype estimate — manual review required' };
  }, [pickup, destination]);

  function getQuote(event: FormEvent) {
    event.preventDefault();
    setQuoted(true);
    setBooked(false);
  }

  function confirmBooking() {
    const ref = `MF${Math.floor(10000 + Math.random() * 90000)}`;
    const booking = {
      id: ref,
      pickup,
      destination,
      date,
      time,
      name,
      phone,
      flight,
      price: quote.price,
      quoteLabel: quote.label,
      status: 'BOOKED',
      driver: null,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('mf-travel-demo-booking', JSON.stringify(booking));
    setReference(ref);
    setBooked(true);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <nav className={styles.nav}>
          <Link href="/">MF Travel</Link><span>·</span><Link href="/book">Book</Link><span>·</span><Link href="/admin">Dispatch</Link><span>·</span><Link href="/driver">Driver</Link>
        </nav>

        <p className={styles.eyebrow}>MF Travel prototype</p>
        <h1 className={styles.title}>Book the journey.<br />Know the price.</h1>
        <p className={styles.sub}>This is the first working slice of the future booking system: quote, booking record, dispatch and driver workflow on one site.</p>

        <form className={styles.card} onSubmit={getQuote}>
          <div className={styles.grid}>
            <label className={styles.label}>Pickup
              <input className={styles.input} value={pickup} onChange={(e) => setPickup(e.target.value)} required />
            </label>
            <label className={styles.label}>Destination
              <input className={styles.input} value={destination} onChange={(e) => setDestination(e.target.value)} required />
            </label>
            <label className={styles.label}>Date
              <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label className={styles.label}>Pickup time
              <input className={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </label>
            <label className={styles.label}>Passenger name
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className={styles.label}>Mobile number
              <input className={styles.input} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
            <label className={`${styles.label} ${styles.full}`}>Flight number <span className={styles.small}>(optional — for airport pickups)</span>
              <input className={styles.input} value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} placeholder="e.g. LS1748" />
            </label>
          </div>
          <div className={styles.buttonRow}>
            <button className={styles.primary} type="submit">Get quote</button>
          </div>
        </form>

        {quoted && (
          <section className={styles.card}>
            <p className={styles.eyebrow}>{quote.label}</p>
            <div className={styles.price}>£{quote.price}</div>
            <div className={styles.route}>{pickup} → {destination}</div>
            <div className={styles.meta}>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Date</div><strong>{date || 'Not set'}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Time</div><strong>{time || 'Not set'}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Passenger</div><strong>{name || 'Not set'}</strong></div>
            </div>
            <div className={styles.buttonRow}>
              <button className={styles.primary} type="button" onClick={confirmBooking}>Book journey</button>
              <button className={styles.secondary} type="button" onClick={() => setQuoted(false)}>Change details</button>
            </div>
          </section>
        )}

        {booked && (
          <section className={styles.card}>
            <span className={styles.status}>Booked</span>
            <h2>Booking {reference} is in the system.</h2>
            <p className={styles.sub}>For this prototype the booking is stored in this browser, so you can now open the dispatch screen, assign yourself, then run the driver workflow.</p>
            <div className={styles.buttonRow}>
              <Link className={styles.primary} href="/admin">Open dispatch</Link>
              <Link className={styles.secondary} href="/driver">Open driver app</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
