/** Formatting helpers — all dates are parsed as UTC to avoid drift. */

function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/**
 * Adds a number of days to an ISO date string (YYYY-MM-DD) in UTC.
 * Example: addDays("2026-11-01", 7) -> "2026-11-08"
 */
export function addDays(isoDate: string, days: number): string {
  const d = parseIsoDate(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculates the difference in full days between two ISO dates: (end - start).
 * Example: dayDiff("2026-11-01", "2026-11-08") -> 7
 */
export function dayDiff(startIso: string, endIso: string): number {
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  const diffMs = e.getTime() - s.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

const weekdayFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});
const monthFmt = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
});

/** "2026-11-02" → "Mon" */
export function formatWeekday(iso: string): string {
  return weekdayFmt.format(parseIsoDate(iso));
}

/** "2026-11-02" → "02 Nov 2026" */
export function formatDayMonthYear(iso: string): string {
  const d = parseIsoDate(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${monthFmt.format(d)} ${d.getUTCFullYear()}`;
}

/** 412 → "$412" */
export function formatFare(usd: number): string {
  return `$${usd.toLocaleString("en-US")}`;
}

/** 445 → "7h 25m", 300 → "5h", 45 → "45m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** 0 → "Nonstop", 1 → "1 stop", 2 → "2 stops" */
export function formatStops(stops: number): string {
  if (stops === 0) return "Nonstop";
  return `${stops} stop${stops === 1 ? "" : "s"}`;
}

/**
 * "2026-11-01", "2026-11-30" → "1–30 Nov 2026"
 * Handles same-day, same-month, cross-month, and cross-year windows.
 */
export function formatDateWindow(startIso: string, endIso: string): string {
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  const monthS = monthFmt.format(s);
  const monthE = monthFmt.format(e);
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();

  if (startIso === endIso) {
    return `${s.getUTCDate()} ${monthE} ${e.getUTCFullYear()}`;
  }
  if (sameYear && s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}–${e.getUTCDate()} ${monthE} ${e.getUTCFullYear()}`;
  }
  if (sameYear) {
    return `${s.getUTCDate()} ${monthS} – ${e.getUTCDate()} ${monthE} ${e.getUTCFullYear()}`;
  }
  return `${s.getUTCDate()} ${monthS} ${s.getUTCFullYear()} – ${e.getUTCDate()} ${monthE} ${e.getUTCFullYear()}`;
}

/**
 * Parse departure and destination location
 * Takes "New York (JFK)" → "JFK"
 * Takes "LHR" → "LHR"
 * Takes "New York" → "New York"
 */
export function extractAirportCode(location: string): string {
  // 1. Matches "(LHR)" in "London (LHR)"
  const match = location.match(/\(([A-Za-z]{3})\)/);
  if (match) {
    return match[1].toUpperCase();
  }

  // 2. If the user typed a 3-letter code directly (e.g. "LHR" or "lhr")
  const trimmed = location.trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // 3. Fallback to the original value if no code found (e.g. city name)
  return trimmed;
}

// Normalizes a location string for comparison purposes.
export function normalizeLocation(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}