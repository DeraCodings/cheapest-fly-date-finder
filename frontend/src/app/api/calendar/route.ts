import { NextResponse } from "next/server";
import { addDays, dayDiff } from "@/lib/format";
import type {
  FlightFare,
  SearchApiCalendarItem,
  SearchApiCalendarResponse,
} from "@/lib/types";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { origin, destination, departAfter, departBefore, durationDays } = body;

    // 1. Input validation
    if (!origin || !destination || !departAfter || !departBefore) {
      return NextResponse.json(
        { error: "Origin, destination, and departure dates are required." },
        { status: 400 }
      );
    }

    const duration = Number(durationDays);
    if (!Number.isInteger(duration) || duration < 1 || duration > 60) {
      return NextResponse.json(
        { error: "Trip duration must be an integer between 1 and 60 days." },
        { status: 400 }
      );
    }

    if (departAfter > departBefore) {
      return NextResponse.json(
        { error: "Start date must be before or on the end date." },
        { status: 400 }
      );
    }

    // Enforce max window limit to prevent API combination limit errors
    const windowLength = dayDiff(departAfter, departBefore);
    if (windowLength > 31) {
      return NextResponse.json(
        {
          error: "Departure window cannot exceed 30 days. Please narrow your search window.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.SEARCHAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SEARCHAPI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    // 2. Compute date parameters for SearchApi Google Flights Calendar
    const outboundStart = departAfter;
    const outboundEnd = departBefore;
    const returnStart = addDays(departAfter, duration);
    const returnEnd = addDays(departBefore, duration);

    const url = "https://www.searchapi.org/api/v1/search";
    const params = new URLSearchParams({
      engine: "google_flights_calendar",
      flight_type: "round_trip",
      departure_id: origin,
      arrival_id: destination,
      outbound_date: outboundStart,
      return_date: returnStart,
      outbound_date_start: outboundStart,
      outbound_date_end: outboundEnd,
      return_date_start: returnStart,
      return_date_end: returnEnd,
      currency: "USD",
      hl: "en",
      gl: "us",
      api_key: apiKey,
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("SearchApi Calendar request failed:", response.status, errorText);
      const isCombinationLimit =
        response.status === 400 &&
        errorText.includes("unique combinations") &&
        errorText.includes("maximum allowed limit");

      if (isCombinationLimit) {
        return NextResponse.json(
          {
            errorTitle: "Narrow your departure date range",
            error:
              "This search creates too many date combinations for the flight provider. Choose a shorter departure window and try again.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch fares from flight provider." },
        { status: response.status }
      );
    }

    const data: SearchApiCalendarResponse = await response.json();
    if (data.error) {
      console.error("SearchApi returned error:", data.error);
      return NextResponse.json(
        { error: data.error },
        { status: 502 }
      );
    }

    const calendarItems: SearchApiCalendarItem[] = Array.isArray(data.calendar)
      ? data.calendar
      : [];

    // 3. Filter valid date combinations matching requested duration & sort by price
    const validFares: FlightFare[] = calendarItems
      .filter((item): item is Required<Pick<SearchApiCalendarItem, "departure" | "return" | "price">> => {
        // Exclude days with no flights or missing/zero prices
        if (!item.departure || !item.return) return false;
        if (item.has_no_flights) return false;
        if (typeof item.price !== "number" || item.price <= 0) return false;

        // Ensure the flight combo strictly matches the requested trip duration
        const tripLength = dayDiff(item.departure, item.return);
        return tripLength === duration;
      })
      .sort((a, b) => a.price - b.price)
      .map((item, index) => {
        const inspectUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(
          destination
        )}%20from%20${encodeURIComponent(origin)}%20on%20${item.departure}%20through%20${item.return}`;

        return {
          id: `${origin}-${destination}-${item.departure}-${item.return}-${index}`,
          fromCode: origin,
          toCode: destination,
          fromCity: origin,
          toCity: destination,
          date: item.departure,
          returnDate: item.return,
          priceUsd: item.price,
          airline: null,
          durationMinutes: null,
          stops: null,
          inspectUrl,
        };
      });

    return NextResponse.json({
      fares: validFares,
      totalFound: validFares.length,
      requestedDuration: duration,
    });
  } catch (error) {
    console.error("Unhandled error in /api/calendar:", error);
    return NextResponse.json(
      { error: "Internal server error while searching calendar fares." },
      { status: 500 }
    );
  }
};