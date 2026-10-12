"use client";

import Button from "./Button";
import FareRow from "./FareRow";
import FareRowSkeleton from "./FareRowSkeleton";
import StatePanel from "./StatePanel";
import { AlertTriangleIcon, CalendarIcon, CompassIcon } from "./icons";
import { formatDateWindow } from "@/lib/format";
import type { FareSearchQuery, FlightFare, SearchStatus } from "@/lib/types";

interface ResultsPanelProps {
  status: SearchStatus;
  results: FlightFare[];
  query: FareSearchQuery | null;
  errorMessage: string | null;
  errorTitle: string | null;
  onRetry: () => void;
}

export default function ResultsPanel({
  status,
  results,
  query,
  errorMessage,
  errorTitle,
  onRetry,
}: ResultsPanelProps) {
  return (
    <section
      aria-label="Cheapest departure dates"
      aria-live="polite"
      aria-busy={status === "loading"}
      className="mt-6 sm:mt-8"
    >
      {/* Idle State */}
      {status === "idle" ? (
        <StatePanel
          icon={<CompassIcon className="size-6" />}
          title="Find your cheapest flying day"
        >
          Enter a route, a departure window, and your trip duration, then press{" "}
          <span className="font-semibold text-ink">Find cheapest dates</span>.
        </StatePanel>
      ) : null}

      {/* Loading Skeletons */}
      {status === "loading" ? (
        <>
          <p role="status" className="sr-only">
            Searching flight calendar fares…
          </p>
          {query ? <ResultsHeading query={query} /> : null}
          <ol className="mt-3 space-y-2.5">
            {Array.from({ length: 4 }, (_, index) => (
              <FareRowSkeleton key={index} />
            ))}
          </ol>
        </>
      ) : null}

      {/* Error State */}
      {status === "error" ? (
        <StatePanel
          tone="alert"
          icon={<AlertTriangleIcon className="size-6" />}
          title={errorTitle ?? "We could not load flight fares"}
          action={
            <Button variant="quiet" onClick={onRetry} className="mt-2">
              Try search again
            </Button>
          }
        >
          {errorMessage ?? "Something went wrong while querying Google Flights. Please try again."}
        </StatePanel>
      ) : null}

      {/* Empty State */}
      {status === "success" && results.length === 0 ? (
        <StatePanel
          icon={<CalendarIcon className="size-6" />}
          title="No flights found for this window"
        >
          {query ? (
            <>
              No {query.durationDays}-day round-trip flights found for{" "}
              <span className="font-semibold text-ink">
                {query.from} → {query.to}
              </span>{" "}
              between {formatDateWindow(query.departAfter, query.departBefore)}.
              <br />
            </>
          ) : null}
          Try extending your departure window or selecting a nearby airport.
        </StatePanel>
      ) : null}

      {/* Results List */}
      {status === "success" && results.length > 0 && query ? (
        <>
          <ResultsHeading query={query} count={results.length} />
          <ol className="mt-3 space-y-2.5">
            {results.map((fare, index) => (
              <FareRow key={fare.id} fare={fare} isCheapest={index === 0} />
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
}

function ResultsHeading({
  query,
  count,
}: {
  query: FareSearchQuery;
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="text-base font-semibold text-ink">Cheapest dates</h2>
        <p className="text-sm text-ink/70">
          {query.from} → {query.to} ·{" "}
          {formatDateWindow(query.departAfter, query.departBefore)} ·{" "}
          <span className="font-medium text-ink">
            {query.durationDays} days
          </span>
        </p>
      </div>
      {count ? (
        <span className="rounded-field border border-hairline bg-surface-strong px-2 py-0.5 text-[11px] font-semibold text-ink/80">
          {count} options ranked
        </span>
      ) : null}
    </div>
  );
}
