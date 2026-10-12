"use client";

import { useState, type FormEvent } from "react";
import Button from "./Button";
import Field from "./Field";
import LocationAutocomplete from "./LocationAutocomplete";
import { CompassIcon } from "./icons";
import { dayDiff, normalizeLocation } from "@/lib/format";
import type { FareSearchQuery } from "@/lib/types";

/** Prefilled with a realistic sample route so the prototype demos instantly. */
const DEFAULT_QUERY: FareSearchQuery = {
  from: "New York (JFK)",
  to: "London (LHR)",
  departAfter: "2026-11-01",
  departBefore: "2026-11-20",
  durationDays: 7,
};

type FieldKey = keyof FareSearchQuery;
type FormErrors = Partial<Record<FieldKey, string>>;

interface SearchFormProps {
  onSearch: (query: FareSearchQuery) => void;
  isSearching: boolean;
}

export default function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  const [query, setQuery] = useState<FareSearchQuery>(DEFAULT_QUERY);
  const [errors, setErrors] = useState<FormErrors>({});

  const setValue = (key: FieldKey) => (value: string | number) => {
    setQuery((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const from = query.from.trim();
    const to = query.to.trim();

    if (!from) next.from = "Enter an origin city or airport.";
    if (!to) next.to = "Enter a destination city or airport.";
    if (from && to && normalizeLocation(from) === normalizeLocation(to)) {
      next.to = "Destination must differ from the origin.";
    }

    if (!query.departAfter) next.departAfter = "Pick earliest departure date.";
    if (!query.departBefore) next.departBefore = "Pick latest departure date.";

    if (query.departAfter && query.departBefore) {
      if (query.departBefore < query.departAfter) {
        next.departBefore = "Latest date must be on or after earliest date.";
      } else if (dayDiff(query.departAfter, query.departBefore) > 31) {
        next.departBefore = "Departure window cannot exceed 30 days.";
      }
    }

    const duration = Number(query.durationDays);
    if (!duration || duration < 1 || duration > 60) {
      next.durationDays = "Trip duration must be 1–60 days.";
    }

    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSearch({
      from: query.from.trim(),
      to: query.to.trim(),
      departAfter: query.departAfter,
      departBefore: query.departBefore,
      durationDays: Number(query.durationDays) || 7,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Flight search"
      className="rounded-row border border-hairline bg-surface p-4 sm:p-5"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.25fr_1.25fr_1fr_1fr_0.75fr_auto]">
        {/* Origin */}
        <div className="col-span-2 sm:col-span-1">
          <LocationAutocomplete
            id="search-from"
            label="Origin"
            value={query.from}
            onChange={setValue("from")}
            placeholder="JFK or New York"
            error={errors.from}
            departure={true}
          />
        </div>

        {/* Destination */}
        <div className="col-span-2 sm:col-span-1">
          <LocationAutocomplete
            id="search-to"
            label="Destination"
            value={query.to}
            onChange={setValue("to")}
            placeholder="LHR or London"
            error={errors.to}
            departure={false}
          />
        </div>

        {/* Earliest Departure */}
        <Field
          id="search-depart-after"
          label="Earliest departure"
          type="date"
          value={query.departAfter}
          onChange={setValue("departAfter")}
          error={errors.departAfter}
        />

        {/* Latest Departure */}
        <Field
          id="search-depart-before"
          label="Latest departure"
          type="date"
          value={query.departBefore}
          onChange={setValue("departBefore")}
          error={errors.departBefore}
        />

        {/* Length of Stay */}
        <Field
          id="search-duration"
          label="Length of stay (days)"
          type="number"
          min={1}
          max={60}
          value={query.durationDays ? String(query.durationDays) : ""}
          onChange={(val) => {
            const num = val === "" ? 0 : Number(val);
            setValue("durationDays")(num);
          }}
          placeholder="7"
          error={errors.durationDays}
        />

        {/* Submit Button */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1">
          <Button
            type="submit"
            className="w-full lg:mt-6.5 lg:w-auto cursor-pointer"
            disabled={isSearching}
            aria-busy={isSearching}
          >
            {isSearching ? (
              "Searching…"
            ) : (
              <>
                <CompassIcon className="size-4.5" />
                Find cheapest dates
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
