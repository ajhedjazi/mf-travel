'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TomTomMap.module.css';

type RouteSummary = {
  lengthInMeters?: number;
  travelTimeInSeconds?: number;
  trafficDelayInSeconds?: number;
};

type Props = {
  destination: string;
};

declare global {
  interface Window {
    maplibregl?: any;
  }
}

const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@6.9.0/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@6.9.0/dist/maplibre-gl.css';

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
      existing.addEventListener('load', () => resolve(window.maplibregl));
      existing.addEventListener('error', reject);
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
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 15000,
    });
  });
}

function formatDuration(seconds = 0) {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${minutes} min`;
}

function formatDistance(metres = 0) {
  return `${(metres / 1609.344).toFixed(1)} mi`;
}

export default function TomTomMap({ destination }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [message, setMessage] = useState('Getting your position and calculating the route…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

    async function start() {
      if (!key) {
        setMessage('TomTom is wired in. Add NEXT_PUBLIC_TOMTOM_API_KEY to switch the live map on.');
        return;
      }
      if (!containerRef.current) return;

      try {
        const [maplibregl, position] = await Promise.all([loadMapLibre(), getPosition()]);
        if (cancelled) return;

        const origin = [position.coords.longitude, position.coords.latitude] as [number, number];
        const searchUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(destination)}.json?key=${encodeURIComponent(key)}&countrySet=GB&limit=1`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error('Destination lookup failed');
        const search = await searchResponse.json();
        const result = search.results?.[0];
        if (!result?.position) throw new Error(`Could not find ${destination}`);

        const target = [result.position.lon, result.position.lat] as [number, number];

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
        new maplibregl.Marker({ color: '#d89a49' }).setLngLat(target).addTo(map);

        const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${origin[1]},${origin[0]}:${target[1]},${target[0]}/json?key=${encodeURIComponent(key)}&traffic=true&travelMode=car&routeType=fastest`;
        const routeResponse = await fetch(routeUrl);
        if (!routeResponse.ok) throw new Error('Route calculation failed');
        const routeData = await routeResponse.json();
        const route = routeData.routes?.[0];
        if (!route) throw new Error('No TomTom route returned');

        setSummary(route.summary ?? null);
        setMessage('Live TomTom route');

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
  }, [destination]);

  return (
    <div className={styles.mapCard}>
      <div ref={containerRef} className={styles.map} aria-label={`TomTom route to ${destination}`} />
      {summary ? (
        <div className={styles.summary}>
          <div><span className={styles.label}>TomTom ETA</span><span className={styles.value}>{formatDuration(summary.travelTimeInSeconds)}</span></div>
          <div><span className={styles.label}>Distance</span><span className={styles.value}>{formatDistance(summary.lengthInMeters)}</span></div>
          <div><span className={styles.label}>Traffic delay</span><span className={styles.value}>+{formatDuration(summary.trafficDelayInSeconds)}</span></div>
        </div>
      ) : (
        <div className={`${styles.notice} ${error ? styles.error : ''}`}>{message}</div>
      )}
    </div>
  );
}
