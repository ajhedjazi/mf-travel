'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

export default function AdminPage() {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mf-travel-demo-booking');
    if (stored) setBooking(JSON.parse(stored));
  }, []);

  function assignToAmir() {
    if (!booking) return;
    const next = { ...booking, driver: 'Amir', status: 'ASSIGNED' };
    localStorage.setItem('mf-travel-demo-booking', JSON.stringify(next));
    setBooking(next);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <nav className={styles.nav}>
          <Link href="/">MF Travel</Link><span>·</span><Link href="/book">Book</Link><span>·</span><Link href="/admin">Dispatch</Link><span>·</span><Link href="/driver">Driver</Link>
        </nav>

        <p className={styles.eyebrow}>Operator dashboard</p>
        <h1 className={styles.title}>Dispatch.</h1>
        <p className={styles.sub}>A deliberately simple first version: see the booking, assign a driver and hand it over to the driver app.</p>

        {!booking ? (
          <section className={styles.card}>
            <h2>No prototype booking yet.</h2>
            <p className={styles.sub}>Create one on the customer booking page first.</p>
            <Link className={styles.primary} href="/book">Create booking</Link>
          </section>
        ) : (
          <section className={styles.card}>
            <span className={styles.status}>{booking.status.replaceAll('_', ' ')}</span>
            <div className={styles.route}>{booking.pickup} → {booking.destination}</div>
            <div className={styles.meta}>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Booking</div><strong>{booking.id}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Pickup</div><strong>{booking.date} · {booking.time}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Fare</div><strong>£{booking.price}</strong></div>
            </div>

            <div className={styles.steps}>
              <div className={styles.step}><span>Passenger</span><strong>{booking.name}</strong></div>
              <div className={styles.step}><span>Phone</span><strong>{booking.phone}</strong></div>
              <div className={styles.step}><span>Flight</span><strong>{booking.flight || '—'}</strong></div>
              <div className={styles.step}><span>Driver</span><strong>{booking.driver || 'Unassigned'}</strong></div>
            </div>

            <div className={styles.buttonRow}>
              {!booking.driver && <button className={styles.primary} type="button" onClick={assignToAmir}>Assign to Amir</button>}
              <Link className={styles.secondary} href="/driver">Open driver app</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
