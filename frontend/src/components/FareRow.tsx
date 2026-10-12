import { cn } from "@/lib/cn";
import {
  formatDayMonthYear,
  formatDuration,
  formatFare,
  formatStops,
  formatWeekday,
} from "@/lib/format";
import { ArrowNarrowRightIcon } from "./icons";
import type { FlightFare } from "@/lib/types";

interface FareRowProps {
  fare: FlightFare;
  /** True for the single cheapest result — gets the accent rail + label. */
  isCheapest: boolean;
}

/**
 * One ranked result. Mobile-first layout: weekday + dates and fare share the
 * first line; flight facts and the optional inspect link sit below.
 */
export default function FareRow({ fare, isCheapest }: FareRowProps) {
  const facts = [
    fare.airline,
    fare.durationMinutes != null
      ? formatDuration(fare.durationMinutes)
      : null,
    fare.stops != null ? formatStops(fare.stops) : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <li
      className={cn(
        "relative rounded-row border px-4 py-3 sm:px-5 transition-shadow",
        isCheapest
          ? "border-ink/25 bg-surface-strong shadow-xs"
          : "border-hairline bg-surface"
      )}
    >
      {isCheapest ? (
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-0 top-2 w-0.75 rounded-full bg-accent"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="rounded-full border border-hairline bg-page/70 px-2.5 py-0.5 font-num text-[11px] uppercase tracking-wide text-ink/70">
          {formatWeekday(fare.date)}
        </span>

        {/* Departure & Return Dates */}
        <div className="flex items-center gap-1.5 font-num text-sm font-semibold text-ink">
          <time dateTime={fare.date}>{formatDayMonthYear(fare.date)}</time>
          {fare.returnDate ? (
            <>
              <span className="text-muted text-xs font-normal">→</span>
              <time dateTime={fare.returnDate} className="text-ink/80">
                {formatDayMonthYear(fare.returnDate)}
              </time>
            </>
          ) : null}
        </div>

        {isCheapest ? (
          <span className="rounded-field bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">
            Lowest fare
          </span>
        ) : null}

        {/* Price */}
        <p className="ml-auto text-right">
          <span className="font-num text-xl font-semibold tabular-nums text-ink">
            {formatFare(fare.priceUsd)}
          </span>
          <span className="block text-[11px] text-ink/60">
            round-trip
          </span>
        </p>
      </div>

      {facts.length > 0 || fare.inspectUrl ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-hairline/40 pt-2">
          <p className="text-xs text-ink/70">
            {facts.length > 0
              ? facts.join(" · ")
              : "Round-trip fare via Google Flights"}
          </p>
          {fare.inspectUrl ? (
            <a
              href={fare.inspectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              Inspect flight options
              <ArrowNarrowRightIcon className="size-3.5" />
            </a>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
