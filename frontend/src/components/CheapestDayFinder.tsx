"use client";

import { useCallback, useRef, useState } from "react";
import ResultsPanel from "./ResultsPanel";
import SearchForm from "./SearchForm";
import { extractAirportCode } from "@/lib/format";
import type { FareSearchQuery, FlightFare, SearchStatus } from "@/lib/types";

/**
 * Owns the search lifecycle: form → Calendar API → ranked results.
 * A request-id guard prevents out-of-order responses from stale searches.
 */
export default function CheapestDayFinder() {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<FlightFare[]>([]);
  const [activeQuery, setActiveQuery] = useState<FareSearchQuery | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const requestId = useRef(0);

  const runSearch = useCallback(async (query: FareSearchQuery) => {
    const id = ++requestId.current;
    setActiveQuery(query);
    setStatus("loading");
    setResults([]);
    setErrorMessage(null);
    setErrorTitle(null);

    let responseErrorTitle: string | null = null;
    try {
      const originCode = extractAirportCode(query.from);
      const destinationCode = extractAirportCode(query.to);

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: originCode,
          destination: destinationCode,
          departAfter: query.departAfter,
          departBefore: query.departBefore,
          durationDays: query.durationDays,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        responseErrorTitle = data.errorTitle || null;
        throw new Error(data.error || "Failed to search calendar fares.");
      }

      if (id !== requestId.current) return;
      setResults(data.fares || []);
      setStatus("success");
    } catch (err) {
      if (id !== requestId.current) return;
      const message =
        err instanceof Error
          ? err.message
          : "The flight search failed unexpectedly. Please try again.";
      setErrorMessage(message);
      setErrorTitle(responseErrorTitle);
      setStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    if (activeQuery) runSearch(activeQuery);
  }, [activeQuery, runSearch]);

  return (
    <div>
      <SearchForm onSearch={runSearch} isSearching={status === "loading"} />
      <ResultsPanel
        status={status}
        results={results}
        query={activeQuery}
        errorMessage={errorMessage}
        errorTitle={errorTitle}
        onRetry={retry}
      />
    </div>
  );
}
