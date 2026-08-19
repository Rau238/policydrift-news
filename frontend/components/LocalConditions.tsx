'use client';

import { useEffect, useState } from 'react';

/** Default when location permission is denied / unavailable. */
const MUMBAI = { lat: 19.076, lon: 72.8777, place: 'Mumbai' };
const CACHE_KEY = 'pd-local-wx-v3';
const CACHE_MS = 20 * 60 * 1000;
/** GPS can take several seconds after Allow; do not race the permission dialog. */
const GEO_TIMEOUT_MS = 20_000;

type WeatherKind = 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm' | 'unknown';

type Conditions = {
  place: string;
  tempC: number;
  aqi: number | null;
  kind: WeatherKind;
};

function aqiMeta(aqi: number | null): { label: string; className: string } {
  if (aqi == null || Number.isNaN(aqi)) return { label: '—', className: 'text-slate-400' };
  if (aqi <= 50) return { label: 'Good', className: 'text-emerald-300' };
  if (aqi <= 100) return { label: 'Fair', className: 'text-lime-300' };
  if (aqi <= 150) return { label: 'Moderate', className: 'text-amber-300' };
  if (aqi <= 200) return { label: 'Poor', className: 'text-orange-300' };
  if (aqi <= 300) return { label: 'Very poor', className: 'text-rose-300' };
  return { label: 'Hazard', className: 'text-red-300' };
}

function kindFromCode(code: number | undefined): WeatherKind {
  if (code == null || Number.isNaN(code)) return 'unknown';
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rain';
  if (code <= 77 || (code >= 85 && code <= 86)) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

function WeatherIcon({ kind }: { kind: WeatherKind }) {
  if (kind === 'clear') {
    return (
      <svg className="pd-wx h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <circle className="pd-wx-sun" cx="12" cy="12" r="4" fill="#fbbf24" />
        <g stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" className="pd-wx-rays">
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M5.1 18.9l1.6-1.6M17.3 6.7l1.6-1.6" />
        </g>
      </svg>
    );
  }
  if (kind === 'cloudy' || kind === 'fog' || kind === 'unknown') {
    return (
      <svg className="pd-wx h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          className="pd-wx-cloud"
          fill="#cbd5e1"
          d="M7.5 18h10a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6-1.4A3.5 3.5 0 0 0 7.5 18z"
        />
        {kind === 'fog' ? (
          <g className="pd-wx-fog" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round">
            <path d="M5 20.2h10M8 22h9" />
          </g>
        ) : null}
      </svg>
    );
  }
  if (kind === 'drizzle' || kind === 'rain' || kind === 'storm') {
    return (
      <svg className="pd-wx h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          className="pd-wx-cloud"
          fill={kind === 'storm' ? '#94a3b8' : '#cbd5e1'}
          d="M6.8 14.5h9.2a3 3 0 0 0 .35-6 4.2 4.2 0 0 0-8.1-1.2A3 3 0 0 0 6.8 14.5z"
        />
        <g className="pd-wx-rain" stroke={kind === 'storm' ? '#38bdf8' : '#7dd3fc'} strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 16.2v3.2M12 16.8v3.2M15 16.2v3.2" />
        </g>
        {kind === 'storm' ? (
          <path className="pd-wx-bolt" fill="#fbbf24" d="M13.2 11.2 10.8 15h2l-1.6 3.6 4-4.8h-2.2z" />
        ) : null}
      </svg>
    );
  }
  // snow
  return (
    <svg className="pd-wx h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        className="pd-wx-cloud"
        fill="#e2e8f0"
        d="M6.8 13.5h9.2a3 3 0 0 0 .35-6 4.2 4.2 0 0 0-8.1-1.2A3 3 0 0 0 6.8 13.5z"
      />
      <g className="pd-wx-snow" fill="#e0f2fe">
        <circle cx="9" cy="17" r="1" />
        <circle cx="12.2" cy="18.2" r="1" />
        <circle cx="15.2" cy="16.8" r="1" />
      </g>
    </svg>
  );
}

function readCache(): Conditions | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: Conditions };
    if (!parsed?.data || Date.now() - parsed.at > CACHE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: Conditions) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* ignore */
  }
}

function readCoords(timeoutMs = GEO_TIMEOUT_MS): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    let done = false;
    const finish = (value: { lat: number; lon: number } | null) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    // Outer timer covers permission prompt + fix; PositionOptions.timeout alone often fires too early.
    const timer = window.setTimeout(() => finish(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        finish({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        finish(null);
      },
      {
        enableHighAccuracy: false,
        timeout: Math.max(8000, timeoutMs - 2000),
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

async function reversePlace(lat: number, lon: number): Promise<string> {
  const fallback = 'Your area';
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 5000);
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: ctrl.signal });
    window.clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as {
        city?: string;
        locality?: string;
        local?: string;
        principalSubdivision?: string;
      };
      const name = data.city || data.locality || data.local || data.principalSubdivision;
      if (name) return name;
    }
  } catch {
    /* try Nominatim */
  }
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 5000);
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    window.clearTimeout(timer);
    if (!res.ok) return fallback;
    const data = (await res.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        state_district?: string;
        state?: string;
      };
    };
    const a = data.address;
    return (
      a?.city ||
      a?.town ||
      a?.village ||
      a?.municipality ||
      a?.state_district ||
      a?.state ||
      fallback
    );
  } catch {
    return fallback;
  }
}

async function fetchWeatherAqi(
  lat: number,
  lon: number,
): Promise<{ tempC: number; aqi: number | null; kind: WeatherKind } | null> {
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 6000);
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
        { signal: ctrl.signal },
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`,
        { signal: ctrl.signal },
      ),
    ]);
    window.clearTimeout(timer);

    if (!weatherRes.ok) return null;
    const weather = (await weatherRes.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const aqiJson = aqiRes.ok
      ? ((await aqiRes.json()) as { current?: { us_aqi?: number } })
      : null;

    const tempC = weather.current?.temperature_2m;
    if (typeof tempC !== 'number') return null;

    const aqi = typeof aqiJson?.current?.us_aqi === 'number' ? Math.round(aqiJson.current.us_aqi) : null;
    return {
      tempC: Math.round(tempC),
      aqi,
      kind: kindFromCode(weather.current?.weather_code),
    };
  } catch {
    return null;
  }
}

async function conditionsFor(
  lat: number,
  lon: number,
  place: string,
): Promise<Conditions | null> {
  const wx = await fetchWeatherAqi(lat, lon);
  if (!wx) return null;
  return { place, tempC: wx.tempC, aqi: wx.aqi, kind: wx.kind };
}

/** Compact animated weather · place · temp · AQI. GPS in parallel; Mumbai only as fallback. */
export function LocalConditions() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Conditions | null>(null);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    /** Once GPS weather is applied, never overwrite with Mumbai. */
    let fromGeo = false;

    const apply = (next: Conditions, source: 'geo' | 'fallback') => {
      if (cancelled) return;
      if (fromGeo && source !== 'geo') return;
      if (source === 'geo') fromGeo = true;
      setData(next);
      writeCache(next);
    };

    const cached = readCache();
    if (cached) {
      setData(cached);
      // Cached GPS result: still refresh weather, but treat as geo so Mumbai cannot clobber it.
      if (cached.place !== MUMBAI.place) fromGeo = true;
    }

    // Start GPS immediately — do not wait for Mumbai API.
    const geoPromise = readCoords(GEO_TIMEOUT_MS);

    (async () => {
      // Interim fallback only while GPS is pending (and we have no cache yet).
      if (!cached) {
        const mumbai = await conditionsFor(MUMBAI.lat, MUMBAI.lon, MUMBAI.place);
        if (!cancelled && mumbai && !fromGeo) apply(mumbai, 'fallback');
      }

      const geo = await geoPromise;
      if (cancelled) return;

      if (geo) {
        const [place, wx] = await Promise.all([
          reversePlace(geo.lat, geo.lon),
          fetchWeatherAqi(geo.lat, geo.lon),
        ]);
        if (cancelled) return;
        if (wx) {
          apply({ place, tempC: wx.tempC, aqi: wx.aqi, kind: wx.kind }, 'geo');
          return;
        }
        // Coords ok but weather failed — still show place from GPS.
        apply(
          {
            place,
            tempC: cached?.tempC ?? 0,
            aqi: cached?.aqi ?? null,
            kind: cached?.kind ?? 'unknown',
          },
          'geo',
        );
        return;
      }

      // Denied / timed out: keep cache or load Mumbai once.
      if (fromGeo || cached) return;
      const mumbai = await conditionsFor(MUMBAI.lat, MUMBAI.lon, MUMBAI.place);
      if (!cancelled && mumbai) apply(mumbai, 'fallback');
      else if (!cancelled) {
        apply({ place: MUMBAI.place, tempC: 0, aqi: null, kind: 'unknown' }, 'fallback');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const ready = mounted && Boolean(data);
  const aqiTone = aqiMeta(ready ? (data?.aqi ?? null) : null);
  const place = ready && data ? data.place : 'City';
  const tempLabel = ready && data ? `${data.tempC}°` : '—°';
  const aqiLabel = ready && data ? `AQI ${data.aqi ?? '—'}` : 'AQI —';
  const kind = ready && data ? data.kind : 'unknown';

  return (
    <div
      className="inline-flex h-8 max-w-[14rem] items-center overflow-hidden rounded-full bg-white/[0.05] px-2 text-[10px] font-medium leading-none text-slate-200 ring-1 ring-white/10 sm:max-w-[20rem] sm:px-2.5 sm:text-xs"
      title={
        ready
          ? `${place} · ${data!.tempC}°C · ${aqiLabel}${data!.aqi != null ? ` (${aqiTone.label})` : ''}`
          : 'Loading local conditions'
      }
      aria-label={
        ready
          ? `Local conditions: ${place}, ${data!.tempC} degrees Celsius, air quality ${data!.aqi ?? 'unavailable'}`
          : 'Loading city weather and air quality'
      }
      aria-busy={!ready}
    >
      <span className="mr-1.5 inline-flex w-3.5 shrink-0 items-center justify-center" aria-hidden>
        {ready ? <WeatherIcon kind={kind} /> : <span className="h-3 w-3 rounded-full bg-white/10" />}
      </span>
      <span className={`min-w-0 truncate font-semibold ${ready ? 'text-slate-100' : 'text-slate-500'}`}>
        {place}
      </span>
      <span className="mx-1.5 h-3 w-px shrink-0 bg-white/15 sm:mx-2" aria-hidden />
      <span className={`w-8 shrink-0 text-right tabular-nums sm:w-9 ${ready ? 'text-white' : 'text-slate-500'}`}>
        {tempLabel}
      </span>
      <span className="mx-1.5 h-3 w-px shrink-0 bg-white/15 sm:mx-2" aria-hidden />
      <span className={`w-[3.6rem] shrink-0 tabular-nums sm:w-[4rem] ${ready ? aqiTone.className : 'text-slate-500'}`}>
        {aqiLabel}
      </span>
    </div>
  );
}
