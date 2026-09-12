'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './TomTomMap.module.css';

type RouteSummary = {
  lengthInMeters?: number;
  travelTimeInSeconds?: number;
  trafficDelayInSeconds?: number;
};

type Props = {
  target: string;
  pickupDate: string;
  pickupTime: string;
  showDepartureAdvice: boolean;
};

declare global {
  interface Window {
    maplibregl?: any;
  }
}

const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@6.9.0/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@6.9.0/dist/maplibre-gl.css';
const EARLY_ARRIVAL_MINUTES = 10;
const ROUTE_REFRESH_MS = 2 * 60 * 1000;

function loadMapLibre(): Promise<any> {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);

  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPLIBRE_JS}"]`);
    if (existing) {
      if (window.maplibregl) {
        resolve(window.maplibregl);
        return;
      }
      existing.addEventListener('load', () => resolve(window.maplibregl), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => resolve(window.maplibregl);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported on this device'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 15000,
    });
  });
}

function formatDuration(seconds = 0) {
  const minutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${minutes} min`;
}

function formatDistance(metres = 0) {
  return `${(metres / 1609.344).toFixed(1)} mi`;
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function parsePickup(date: string, time: string) {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function TomTomMap({ target, pickupDate, pickupTime, showDepartureAdvice }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [message, setMessage] = useState('Getting your position and calculating the route…');
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    const routeRefresh = window.setInterval(() => setRefreshTick((value) => value + 1), ROUTE_REFRESH_MS);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(routeRefresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

    async function start() {
      setError(null);
      setSummary(null);
      setMessage('Getting your position and calculating the route…');

      if (!key) {
        setMessage('TomTom is wired in. Add NEXT_PUBLIC_TOMTOM_API_KEY to switch the live map on.');
        return;
      }
      if (!containerRef.current || !target) return;

      try {
        const [maplibregl, position] = await Promise.all([loadMapLibre(), getPosition()]);
        if (cancelled) return;

        const origin = [position.coords.longitude, position.coords.latitude] as [number, number];
        const searchUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(target)}.json?key=${encodeURIComponent(key)}&countrySet=GB&limit=1`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error('Target lookup failed');
        const search = await searchResponse.json();
        const result = search.results?.[0];
        if (!result?.position) throw new Error(`Could not find ${target}`);

        const destination = [result.position.lon, result.position.lat] as [number, number];

        mapRef.current?.remove?.();
        const map = new maplibregl.Map({
          container: containerRef.current,
          center: origin,
          zoom: 10,
          attributionControl: true,
          style: {
            version: 8,
            sources: {
              tomtom: {
                type: 'raster',
                tiles: [`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`],
                tileSize: 256,
                attribution: '© TomTom',
              },
            },
            layers: [{ id: 'tomtom', type: 'raster', source: 'tomtom' }],
          },
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
        map.addControl(new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }), 'top-right');

        new maplibregl.Marker({ color: '#123b3a' }).setLngLat(origin).addTo(map);
        new maplibregl.Marker({ color: '#d89a49' }).setLngLat(destination).addTo(map);

        const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${origin[1]},${origin[0]}:${destination[1]},${destination[0]}/json?key=${encodeURIComponent(key)}&traffic=true&travelMode=car&routeType=fastest`;
        const routeResponse = await fetch(routeUrl);
        if (!routeResponse.ok) throw new Error('Route calculation failed');
        const routeData = await routeResponse.json();
        const route = routeData.routes?.[0];
        if (!route) throw new Error('No TomTom route returned');

        if (cancelled) return;
        setSummary(route.summary ?? null);
        setMessage('Live TomTom route');
        setLastUpdated(new Date());

        const points = route.legs?.flatMap((leg: any) => leg.points ?? []) ?? [];
        const coordinates = points.map((point: any) => [point.longitude, point.latitude]);

        map.on('load', () => {
          if (!coordinates.length || cancelled) return;
          map.addSource('driver-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates },
            },
          });
          map.addLayer({
            id: 'driver-route-outline',
            type: 'line',
            source: 'driver-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.9 },
          });
          map.addLayer({
            id: 'driver-route',
            type: 'line',
            source: 'driver-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#123b3a', 'line-width': 5 },
          });

          const bounds = coordinates.reduce(
            (box: any, point: [number, number]) => box.extend(point),
            new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
          );
          map.fitBounds(bounds, { padding: 48, duration: 700 });
        });
      } catch (err) {
        if (cancelled) return;
        const text = err instanceof Error ? err.message : 'Could not load TomTom map';
        setError(text);
        setMessage('TomTom map unavailable — Apple Maps fallback remains available below.');
      }
    }

    start();
    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, [target, refreshTick]);

  const departure = useMemo(() => {
    if (!showDepartureAdvice || !summary?.travelTimeInSeconds) return null;
    const pickup = parsePickup(pickupDate, pickupTime);
    if (!pickup) return null;

    const leaveBy = new Date(
      pickup.getTime() - (summary.travelTimeInSeconds + EARLY_ARRIVAL_MINUTES * 60) * 1000,
    );
    const minutesUntilLeave = Math.round((leaveBy.getTime() - now.getTime()) / 60_000);

    if (minutesUntilLeave <= 0) {
      return { tone: 'go', label: 'GO NOW', detail: `Leave by ${formatClock(leaveBy)} · aim to arrive ${EARLY_ARRIVAL_MINUTES} min early` };
    }
    if (minutesUntilLeave <= 15) {
      return { tone: 'soon', label: `LEAVE IN ${minutesUntilLeave} MIN`, detail: `Leave by ${formatClock(leaveBy)} · aim to arrive ${EARLY_ARRIVAL_MINUTES} min early` };
    }
    return { tone: 'ok', label: 'ON TIME', detail: `Leave by ${formatClock(leaveBy)} · ${minutesUntilLeave} min until departure` };
  }, [now, pickupDate, pickupTime, showDepartureAdvice, summary]);

  return (
    <div className={styles.mapCard}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.label}>Routing to</span>
          <strong>{target}</strong>
          {lastUpdated && <small>Updated {formatClock(lastUpdated)}</small>}
        </div>
        <button className={styles.refreshButton} type="button" onClick={() => setRefreshTick((value) => value + 1)}>
          Refresh route
        </button>
      </div>

      {departure && (
        <div className={`${styles.departure} ${styles[`departure_${departure.tone}`]}`}>
          <strong>{departure.label}</strong>
          <span>{departure.detail}</span>
        </div>
      )}

      <div ref={containerRef} className={styles.map} aria-label={`TomTom route to ${target}`} />
      {summary ? (
        <div className={styles.summary}>
          <div><span className={styles.label}>Drive time</span><span className={styles.value}>{formatDuration(summary.travelTimeInSeconds)}</span></div>
          <div><span className={styles.label}>Distance</span><span className={styles.value}>{formatDistance(summary.lengthInMeters)}</span></div>
          <div><span className={styles.label}>Traffic delay</span><span className={styles.value}>+{formatDuration(summary.trafficDelayInSeconds)}</span></div>
        </div>
      ) : (
        <div className={`${styles.notice} ${error ? styles.error : ''}`}>{message}{error ? ` (${error})` : ''}</div>
      )}
    </div>
  );
}
