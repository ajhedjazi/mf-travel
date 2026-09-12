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

type Coordinates = [number, number];

declare global {
  interface Window {
    maplibregl?: any;
  }
}

const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@6.9.0/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@6.9.0/dist/maplibre-gl.css';
const EARLY_ARRIVAL_MINUTES = 10;
const ROUTE_REFRESH_MS = 2 * 60 * 1000;
const STALE_ROUTE_MS = 5 * 60 * 1000;
const FORECAST_CUTOFF_MINUTES = 5;
const REQUEST_TIMEOUT_MS = 10_000;

function loadMapLibre(): Promise<any> {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);

  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }

    const timeout = window.setTimeout(() => reject(new Error('Map library timed out')), REQUEST_TIMEOUT_MS);
    const finish = (value: any) => {
      window.clearTimeout(timeout);
      resolve(value);
    };
    const fail = () => {
      window.clearTimeout(timeout);
      reject(new Error('Map library failed to load'));
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPLIBRE_JS}"]`);
    if (existing) {
      if (window.maplibregl) {
        finish(window.maplibregl);
        return;
      }
      existing.addEventListener('load', () => finish(window.maplibregl), { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => finish(window.maplibregl);
    script.onerror = fail;
    document.body.appendChild(script);
  });
}

async function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('TomTom request timed out');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
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

function toTomTomDateTime(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export default function TomTomMap({ target, pickupDate, pickupTime, showDepartureAdvice }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const geocodeCacheRef = useRef<{ target: string; destination: Coordinates } | null>(null);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [message, setMessage] = useState('Getting your position and calculating the route…');
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isForecast, setIsForecast] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    const routeRefresh = window.setInterval(() => setRefreshTick((value) => value + 1), ROUTE_REFRESH_MS);
    const refreshOnFocus = () => {
      setNow(new Date());
      setRefreshTick((value) => value + 1);
    };
    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') refreshOnFocus();
    };
    const handleOnline = () => {
      setIsOnline(true);
      setNow(new Date());
      setRefreshTick((value) => value + 1);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNow(new Date());
    };

    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', refreshOnVisibility);

    return () => {
      window.clearInterval(clock);
      window.clearInterval(routeRefresh);
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

    async function start() {
      setError(null);
      setIsRefreshing(true);
      setIsForecast(false);
      setMessage('Getting your position and calculating the route…');

      if (!key) {
        setSummary(null);
        setMessage('TomTom is wired in. Add NEXT_PUBLIC_TOMTOM_API_KEY to switch the live map on.');
        setIsRefreshing(false);
        return;
      }
      if (!containerRef.current || !target) {
        setIsRefreshing(false);
        return;
      }
      if (!navigator.onLine) {
        setMessage('You are offline. Reconnect for a fresh TomTom route; Apple Maps fallback remains available below.');
        setIsRefreshing(false);
        return;
      }

      try {
        const [maplibregl, position] = await Promise.all([loadMapLibre(), getPosition()]);
        if (cancelled) return;

        const origin = [position.coords.longitude, position.coords.latitude] as Coordinates;
        let destination: Coordinates;

        if (geocodeCacheRef.current?.target === target) {
          destination = geocodeCacheRef.current.destination;
        } else {
          const searchUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(target)}.json?key=${encodeURIComponent(key)}&countrySet=GB&limit=1`;
          const searchResponse = await fetchWithTimeout(searchUrl);
          if (!searchResponse.ok) throw new Error(`Target lookup failed (${searchResponse.status})`);
          const search = await searchResponse.json();
          const result = search.results?.[0];
          if (!result?.position) throw new Error(`Could not find ${target}`);
          destination = [result.position.lon, result.position.lat];
          geocodeCacheRef.current = { target, destination };
        }

        const pickup = showDepartureAdvice ? parsePickup(pickupDate, pickupTime) : null;
        const desiredArrival = pickup
          ? new Date(pickup.getTime() - EARLY_ARRIVAL_MINUTES * 60_000)
          : null;
        const shouldForecast = Boolean(
          desiredArrival && desiredArrival.getTime() - Date.now() > FORECAST_CUTOFF_MINUTES * 60_000,
        );
        const timingParam = shouldForecast && desiredArrival
          ? `&arriveAt=${encodeURIComponent(toTomTomDateTime(desiredArrival))}`
          : '';

        const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${origin[1]},${origin[0]}:${destination[1]},${destination[0]}/json?key=${encodeURIComponent(key)}&traffic=true&travelMode=car&routeType=fastest${timingParam}`;
        const routeResponse = await fetchWithTimeout(routeUrl);
        if (!routeResponse.ok) throw new Error(`Route calculation failed (${routeResponse.status})`);
        const routeData = await routeResponse.json();
        const route = routeData.routes?.[0];
        if (!route) throw new Error('No TomTom route returned');

        if (cancelled) return;
        setSummary(route.summary ?? null);
        setIsForecast(shouldForecast);
        setMessage(shouldForecast ? 'TomTom pickup-time traffic forecast' : 'Live TomTom route');
        setLastUpdated(new Date());

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
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, [target, pickupDate, pickupTime, showDepartureAdvice, refreshTick]);

  const isStale = Boolean(lastUpdated && now.getTime() - lastUpdated.getTime() > STALE_ROUTE_MS);

  const departure = useMemo(() => {
    if (!showDepartureAdvice || !summary?.travelTimeInSeconds) return null;
    const pickup = parsePickup(pickupDate, pickupTime);
    if (!pickup) return null;

    const leaveBy = new Date(
      pickup.getTime() - (summary.travelTimeInSeconds + EARLY_ARRIVAL_MINUTES * 60) * 1000,
    );
    const minutesUntilLeave = Math.round((leaveBy.getTime() - now.getTime()) / 60_000);
    const forecastLabel = isForecast ? ' · pickup-time traffic forecast' : ' · live traffic';

    if (minutesUntilLeave <= 0) {
      return { tone: 'go', label: 'GO NOW', detail: `Leave by ${formatClock(leaveBy)} · aim to arrive ${EARLY_ARRIVAL_MINUTES} min early${forecastLabel}` };
    }
    if (minutesUntilLeave <= 15) {
      return { tone: 'soon', label: `LEAVE IN ${minutesUntilLeave} MIN`, detail: `Leave by ${formatClock(leaveBy)} · aim to arrive ${EARLY_ARRIVAL_MINUTES} min early${forecastLabel}` };
    }
    return { tone: 'ok', label: 'ON TIME', detail: `Leave by ${formatClock(leaveBy)} · ${minutesUntilLeave} min until departure${forecastLabel}` };
  }, [isForecast, now, pickupDate, pickupTime, showDepartureAdvice, summary]);

  return (
    <div className={styles.mapCard}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.label}>Routing to</span>
          <strong>{target}</strong>
          {lastUpdated && <small>Updated {formatClock(lastUpdated)} · {isForecast ? 'forecast route' : 'live route'}</small>}
        </div>
        <button
          className={styles.refreshButton}
          type="button"
          disabled={!isOnline || isRefreshing}
          onClick={() => setRefreshTick((value) => value + 1)}
        >
          {!isOnline ? 'Offline' : isRefreshing ? 'Refreshing…' : 'Refresh route'}
        </button>
      </div>

      {!isOnline && (
        <div className={`${styles.routeWarning} ${styles.routeWarningDanger}`} role="alert">
          <strong>OFFLINE</strong>
          <span>Do not rely on this ETA. Reconnect for fresh traffic data or use Apple Maps fallback below.</span>
        </div>
      )}

      {isOnline && isStale && (
        <div className={styles.routeWarning} role="status">
          <strong>ROUTE DATA IS STALE</strong>
          <span>Last successful update was over 5 minutes ago. Refresh before relying on the departure time.</span>
        </div>
      )}

      {departure && (
        <div className={`${styles.departure} ${styles[`departure_${departure.tone}`]}`}>
          <strong>{departure.label}</strong>
          <span>{departure.detail}</span>
        </div>
      )}

      <div ref={containerRef} className={styles.map} aria-label={`TomTom route to ${target}`} />
      {summary ? (
        <div className={styles.summary}>
          <div><span className={styles.label}>{isForecast ? 'Forecast drive time' : 'Drive time'}</span><span className={styles.value}>{formatDuration(summary.travelTimeInSeconds)}</span></div>
          <div><span className={styles.label}>Distance</span><span className={styles.value}>{formatDistance(summary.lengthInMeters)}</span></div>
          <div><span className={styles.label}>{isForecast ? 'Forecast delay' : 'Traffic delay'}</span><span className={styles.value}>+{formatDuration(summary.trafficDelayInSeconds)}</span></div>
        </div>
      ) : (
        <div className={`${styles.notice} ${error ? styles.error : ''}`}>{message}{error ? ` (${error})` : ''}</div>
      )}
    </div>
  );
}
