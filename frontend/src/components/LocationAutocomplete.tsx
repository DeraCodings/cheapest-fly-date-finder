"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface AirportItem {
  type: string;
  airport_code?: string;
  title: string;
  city?: string;
  distance?: string;
  kgmid?: string;
}

export interface LocationItem {
  type: string;
  kgmid: string;
  full_name: string;
  short_name: string;
  description?: string;
  airports?: AirportItem[];
}

interface LocationAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  departure?: boolean;
  placeholder?: string;
  error?: string;
}

export default function LocationAutocomplete({
  id,
  label,
  value,
  onChange,
  departure = false,
  placeholder,
  error,
}: LocationAutocompleteProps) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isManualSelectionRef = useRef(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const errorId = `${id}-error`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 2 || isManualSelectionRef.current) {
      isManualSelectionRef.current = false;
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, departure }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Location fetch failed");
        const data = await res.json();
        const results: LocationItem[] = data.locations || [];

        setLocations(results);
        setIsOpen(results.length > 0);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to fetch location suggestions:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, departure]);

  const handleInputChange = (newVal: string) => {
    isManualSelectionRef.current = false;
    onChange(newVal);
    if (newVal.trim().length < 2) {
      setLocations([]);
      setIsOpen(false);
    }
  };

  const selectCity = (city: LocationItem) => {
    isManualSelectionRef.current = true;
    onChange(city.short_name || city.full_name);
    setLocations([]);
    setIsOpen(false);
  };

  const selectAirport = (airport: AirportItem, city: LocationItem) => {
    isManualSelectionRef.current = true;
    const text = airport.airport_code
      ? `${city.short_name || airport.title} (${airport.airport_code})`
      : airport.title;
    onChange(text);
    setLocations([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (locations.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className={cn(
            "h-11 w-full rounded-field border bg-surface-strong px-3 text-sm text-ink outline-none transition-colors",
            "placeholder:text-muted",
            error ? "border-alert" : "border-hairline focus:border-decorative",
          )}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted animate-pulse">
            Searching…
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && locations.length > 0 && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-72 w-full min-w-[280px] overflow-y-auto rounded-field border border-hairline bg-surface-strong shadow-lg py-1 divide-y divide-hairline/40">
          {locations.map((loc) => (
            <li key={loc.kgmid || loc.full_name} className="py-1">
              {/* City Row */}
              <button
                type="button"
                onClick={() => selectCity(loc)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted text-sm">📍</span>
                  <div className="truncate">
                    <p className="font-semibold text-sm text-ink truncate">
                      {loc.short_name || loc.full_name}
                    </p>
                    {loc.description && (
                      <p className="text-xs text-muted truncate">
                        {loc.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* Sub-Airports list */}
              {loc.airports && loc.airports.length > 0 && (
                <ul className="pl-6 pr-2 pb-1 space-y-0.5">
                  {loc.airports.map((airport, idx) => (
                    <li key={airport.airport_code || idx}>
                      <button
                        type="button"
                        onClick={() => selectAirport(airport, loc)}
                        className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-surface text-left text-xs cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-muted group-hover:text-ink">
                            ✈️
                          </span>
                          <span className="truncate text-ink font-medium">
                            {airport.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {airport.distance && (
                            <span className="text-muted text-[11px]">
                              {airport.distance}
                            </span>
                          )}
                          {airport.airport_code && (
                            <span className="rounded border border-hairline bg-surface px-1.5 py-0.5 font-num text-[11px] font-semibold text-ink">
                              {airport.airport_code}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p id={errorId} className="text-xs font-semibold text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
