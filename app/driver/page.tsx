'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from '../prototype.module.css';

type Booking = {
  id: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  flight?: string;
  price: number;
  status: string;
  driver: string | null;
};

const flow = ['ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED', 'PASSENGER_ON_BOARD', 'COMPLETED'];
const labels: Record<string, string> = {
  ASSIGNED: 'Start job',
  DRIVER_EN_ROUTE: 'Mark arrived',
  ARRIVED: 'Passenger on board',
  PASSENGER_ON_BOARD: 'Complete journey',
};

export default function DriverPage() {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mf-travel-demo-booking');
    if (stored) setBooking(JSON.parse(stored));
  }, []);

  const mapsHref = useMemo(() => {
    if (!booking) return '#';
    const destination = encodeURIComponent(booking.destination);
    return `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
  }, [booking]);

  function advance() {
    if (!booking) return;
    const current = flow.indexOf(booking.status);
    const nextStatus = current < 0 ? 'DRIVER_EN_ROUTE' : flow[Math.min(current + 1, flow.length - 1)];
    const next = { ...booking, status: nextStatus };
    localStorage.setItem('mf-travel-demo-booking', JSON.stringify(next));
    setBooking(next);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <nav className={styles.nav}>
          <Link href="/">MF Travel</Link><span>·</span><Link href="/book">Book</Link><span>·</span><Link href="/admin">Dispatch</Link><span>·</span><Link href="/driver">Driver</Link>
        </nav>

        <p className={styles.eyebrow}>Driver app</p>
        <h1 className={styles.title}>Today&apos;s job.</h1>
        <p className={styles.sub}>This is the bit you would actually use from the car: destination, passenger, status and one big next-action button.</p>

        {!booking ? (
          <section className={styles.card}>
            <h2>No job loaded.</h2>
            <p className={styles.sub}>Create a booking first, then assign it from dispatch.</p>
            <Link className={styles.primary} href="/book">Create booking</Link>
          </section>
        ) : (
          <section className={styles.card}>
            <span className={styles.status}>{booking.status.replaceAll('_', ' ')}</span>
            <div className={styles.route}>{booking.pickup} → {booking.destination}</div>

            <div className={styles.meta}>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Pickup</div><strong>{booking.date} · {booking.time}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Passenger</div><strong>{booking.name}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Fare</div><strong>£{booking.price}</strong></div>
            </div>

            <div className={styles.steps}>
              <div className={styles.step}><span>Booking ref</span><strong>{booking.id}</strong></div>
              <div className={styles.step}><span>Flight</span><strong>{booking.flight || '—'}</strong></div>
              <div className={styles.step}><span>Assigned driver</span><strong>{booking.driver || 'Not yet assigned'}</strong></div>
            </div>

            <div className={styles.buttonRow}>
              <a className={styles.secondary} href={mapsHref} target="_blank" rel="noreferrer">Navigate in Apple Maps</a>
              {booking.status !== 'COMPLETED' && (
                <button className={styles.primary} type="button" onClick={advance}>
                  {labels[booking.status] || 'Start job'}
                </button>
              )}
            </div>

            {booking.status === 'COMPLETED' && <p className={styles.sub}><strong>Journey complete.</strong> Next step later will be payment capture, receipt and earnings.</p>}
          </section>
        )}
      </div>
    </main>
  );
}
