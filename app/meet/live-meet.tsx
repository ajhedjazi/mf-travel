"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../driver/driver.module.css";

type Role = "driver" | "passenger";

type LocationPoint = {
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: number;
  expiresAt: number;
};

type Props = {
  sessionId: string;
  role: Role;
};

type MeetPayload = {
  driver: LocationPoint | null;
  passenger: LocationPoint | null;
};

function distanceMetres(a: LocationPoint, b: LocationPoint) {
  const radius = 6_371_000;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(metres: number) {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

function updatedLabel(point: LocationPoint | null) {
  if (!point) return "Waiting for location";
  const seconds = Math.max(0, Math.round((Date.now() - point.updatedAt) / 1000));
  if (seconds < 10) return "Live now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function appleMapsUrl(point: LocationPoint, label: string) {
  return `https://maps.apple.com/?ll=${point.lat},${point.lng}&q=${encodeURIComponent(label)}`;
}

export default function LiveMeet({ sessionId, role }: Props) {
  const [payload, setPayload] = useState<MeetPayload>({ driver: null, passenger: null });
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const watchId = useRef<number | null>(null);
  const lastSent = useRef(0);

  const own = role === "driver" ? payload.driver : payload.passenger;
  const other = role === "driver" ? payload.passenger : payload.driver;
  const otherLabel = role === "driver" ? "Passenger" : "Driver";
  const ownLabel = role === "driver" ? "You · Driver" : "You · Passenger";

  async function refresh() {
    try {
      const response = await fetch(`/.netlify/functions/meet-location?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load live locations.");
      const next = await response.json() as MeetPayload;
      setPayload(next);
      setError("");
    } catch {
      setError("Live location is temporarily unavailable. Try again in a moment.");
    }
  }

  async function sendLocation(position: GeolocationPosition) {
    const now = Date.now();
    if (now - lastSent.current < 2500) return;
    lastSent.current = now;

    try {
      const response = await fetch(`/.netlify/functions/meet-location?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      });
      if (!response.ok) throw new Error("Could not share location.");
      setError("");
      await refresh();
    } catch {
      setError("Could not update your location. Check your signal and try again.");
    }
  }

  function startSharing() {
    if (!("geolocation" in navigator)) {
      setError("This phone does not provide browser location access.");
      return;
    }

    setError("");
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setSharing(true);
        void sendLocation(position);
      },
      (positionError) => {
        setSharing(false);
        setError(positionError.code === positionError.PERMISSION_DENIED
          ? "Location permission was denied. Allow location access in Safari and try again."
          : "Could not get your location. Check location services and signal.");
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
    watchId.current = id;
  }

  function stopSharing() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSharing(false);
  }

  useEffect(() => {
    void refresh();
    const poll = window.setInterval(() => {
      void refresh();
      setTick((value) => value + 1);
    }, 3000);

    return () => {
      window.clearInterval(poll);
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [sessionId]);

  const distance = own && other ? distanceMetres(own, other) : null;

  const projected = useMemo(() => {
    if (!own && !other) return null;
    if (!own || !other) {
      return {
        own: own ? { x: 50, y: 50 } : null,
        other: other ? { x: 50, y: 50 } : null,
      };
    }

    const midLat = (own.lat + other.lat) / 2;
    const midLng = (own.lng + other.lng) / 2;
    const metresPerLng = 111_320 * Math.cos(midLat * Math.PI / 180);
    const metresPerLat = 110_540;
    const span = Math.max(80, (distance ?? 80) * 1.6);

    const project = (point: LocationPoint) => {
      const east = (point.lng - midLng) * metresPerLng;
      const north = (point.lat - midLat) * metresPerLat;
      return {
        x: Math.max(12, Math.min(88, 50 + (east / span) * 76)),
        y: Math.max(12, Math.min(88, 50 - (north / span) * 76)),
      };
    };

    return { own: project(own), other: project(other) };
  }, [own?.lat, own?.lng, other?.lat, other?.lng, distance, tick]);

  return (
    <div className={styles.liveMeet}>
      <div className={styles.liveTopline}>
        <div>
          <p className={styles.liveEyebrow}>Live pickup map</p>
          <strong className={styles.liveDistance}>{distance !== null ? formatDistance(distance) : "Waiting to connect"}</strong>
        </div>
        <span className={`${styles.liveBadge} ${sharing ? styles.liveBadgeOn : ""}`}>{sharing ? "Sharing" : "Not sharing"}</span>
      </div>

      <div className={styles.proximityMap} aria-label="Live proximity view">
        <div className={styles.mapGrid} />
        {projected?.own && (
          <div className={`${styles.mapPerson} ${styles.mapOwn}`} style={{ left: `${projected.own.x}%`, top: `${projected.own.y}%` }}>
            <span className={styles.mapDot} />
            <span className={styles.mapLabel}>{ownLabel}</span>
          </div>
        )}
        {projected?.other && (
          <div className={`${styles.mapPerson} ${styles.mapOther}`} style={{ left: `${projected.other.x}%`, top: `${projected.other.y}%` }}>
            <span className={styles.mapDot} />
            <span className={styles.mapLabel}>{otherLabel}</span>
          </div>
        )}
        {!projected && <p className={styles.mapEmpty}>Start sharing to appear on the live meet map.</p>}
      </div>
      <p className={styles.mapCaption}>Proximity view · not a street map. Open the other person in Apple Maps for exact streets and walking/driving position.</p>

      <div className={styles.liveStatuses}>
        <div><span>{ownLabel}</span><strong>{updatedLabel(own)}</strong></div>
        <div><span>{otherLabel}</span><strong>{updatedLabel(other)}</strong></div>
      </div>

      <div className={styles.liveActions}>
        {!sharing ? (
          <button className={`${styles.action} ${styles.actionPrimary}`} type="button" onClick={startSharing}>Share my live location</button>
        ) : (
          <button className={styles.action} type="button" onClick={stopSharing}>Stop sharing</button>
        )}
        {other ? (
          <a className={styles.action} href={appleMapsUrl(other, otherLabel)}>Open {otherLabel.toLowerCase()} in Apple Maps</a>
        ) : (
          <button className={styles.action} type="button" disabled>Waiting for {otherLabel.toLowerCase()}</button>
        )}
      </div>

      {distance !== null && distance <= 100 && <p className={styles.nearbyAlert}>Very close — you’re within about {Math.round(distance)} metres of each other.</p>}
      {error && <p className={styles.liveError}>{error}</p>}
      <p className={styles.privacyNote}>Location is shared only for this private link and expires automatically after 2 hours.</p>
    </div>
  );
}
