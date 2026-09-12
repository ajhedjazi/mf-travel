'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../prototype.module.css';
import TomTomMap from './TomTomMap';

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

type WakeLockHandle = {
  released?: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: 'release', listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockHandle>;
  };
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
  const [keepAwake, setKeepAwake] = useState(false);
  const [wakeLockAvailable, setWakeLockAvailable] = useState(true);
  const [wakeLockMessage, setWakeLockMessage] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mf-travel-demo-booking');
    if (stored) setBooking(JSON.parse(stored));
    setWakeLockAvailable(Boolean((navigator as NavigatorWithWakeLock).wakeLock));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function requestWakeLock() {
      if (!keepAwake || document.visibilityState !== 'visible') return;
      const wakeLock = (navigator as NavigatorWithWakeLock).wakeLock;
      if (!wakeLock) {
        setWakeLockAvailable(false);
        setKeepAwake(false);
        setWakeLockMessage('Screen wake lock is not supported in this browser.');
        return;
      }

      try {
        const handle = await wakeLock.request('screen');
        if (cancelled) {
          await handle.release();
          return;
        }
        wakeLockRef.current = handle;
        setWakeLockMessage('Screen will stay awake while the driver app is visible.');
        handle.addEventListener?.('release', () => {
          if (!cancelled) wakeLockRef.current = null;
        });
      } catch {
        if (!cancelled) {
          setWakeLockMessage('Could not keep the screen awake. Check browser permissions or keep the phone on charge.');
        }
      }
    }

    async function releaseWakeLock() {
      const handle = wakeLockRef.current;
      wakeLockRef.current = null;
      if (handle && !handle.released) {
        try {
          await handle.release();
        } catch {
          // Wake lock can already be released automatically when the tab is hidden.
        }
      }
    }

    if (keepAwake) requestWakeLock();
    else releaseWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && keepAwake && !wakeLockRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      releaseWakeLock();
    };
  }, [keepAwake]);

  const navigationTarget = useMemo(() => {
    if (!booking) return '';
    return ['PASSENGER_ON_BOARD', 'COMPLETED'].includes(booking.status)
      ? booking.destination
      : booking.pickup;
  }, [booking]);

  const mapsHref = useMemo(() => {
    if (!navigationTarget) return '#';
    const target = encodeURIComponent(navigationTarget);
    return `https://maps.apple.com/?daddr=${target}&dirflg=d`;
  }, [navigationTarget]);

  const phoneHref = useMemo(() => {
    if (!booking?.phone) return '#';
    return `tel:${booking.phone.replace(/\s+/g, '')}`;
  }, [booking]);

  const smsHref = useMemo(() => {
    if (!booking?.phone) return '#';
    return `sms:${booking.phone.replace(/\s+/g, '')}`;
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

        <p className={styles.eyebrow}>MF Travel driver</p>
        <h1 className={styles.title}>Current job.</h1>
        <p className={styles.sub}>Your job, live TomTom route, traffic-aware ETA and the next action in one screen.</p>

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

            <TomTomMap
              target={navigationTarget}
              pickupDate={booking.date}
              pickupTime={booking.time}
              showDepartureAdvice={!['PASSENGER_ON_BOARD', 'COMPLETED'].includes(booking.status)}
            />

            <div className={styles.meta}>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Pickup</div><strong>{booking.date} · {booking.time}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Passenger</div><strong>{booking.name}</strong></div>
              <div className={styles.metaBox}><div className={styles.metaLabel}>Fare</div><strong>£{booking.price}</strong></div>
            </div>

            <div className={styles.steps}>
              <div className={styles.step}><span>Navigation target</span><strong>{navigationTarget}</strong></div>
              <div className={styles.step}><span>Booking ref</span><strong>{booking.id}</strong></div>
              <div className={styles.step}><span>Flight</span><strong>{booking.flight || '—'}</strong></div>
              <div className={styles.step}><span>Assigned driver</span><strong>{booking.driver || 'Not yet assigned'}</strong></div>
              <div className={styles.step}>
                <span>Keep screen awake</span>
                <strong>{keepAwake ? 'On' : wakeLockAvailable ? 'Off' : 'Unavailable'}</strong>
              </div>
            </div>

            <div className={`${styles.buttonRow} ${styles.driverActions}`}>
              {booking.status !== 'COMPLETED' && (
                <button className={`${styles.primary} ${styles.driverPrimaryAction}`} type="button" onClick={advance}>
                  {labels[booking.status] || 'Start job'}
                </button>
              )}
              {wakeLockAvailable && (
                <button
                  className={styles.secondary}
                  type="button"
                  aria-pressed={keepAwake}
                  onClick={() => {
                    setWakeLockMessage(null);
                    setKeepAwake((value) => !value);
                  }}
                >
                  {keepAwake ? 'Allow screen sleep' : 'Keep screen awake'}
                </button>
              )}
              <a className={styles.secondary} href={phoneHref}>Call passenger</a>
              <a className={styles.secondary} href={smsHref}>Text passenger</a>
              <a className={styles.secondary} href={mapsHref} target="_blank" rel="noreferrer">Apple Maps fallback</a>
            </div>

            {wakeLockMessage && <p className={styles.small}>{wakeLockMessage}</p>}
            {booking.status === 'COMPLETED' && <p className={styles.sub}><strong>Journey complete.</strong> Next step later will be payment capture, receipt and earnings.</p>}
          </section>
        )}
      </div>
    </main>
  );
}
