/**
 * Shared domain types for the Cheapest-Day-to-Fly Finder.
 *
 * FlightFare is the normalized shape consumed by the UI. SearchApi* types
 * describe the raw provider responses used by the API routes and fixtures.
 */

/** A validated search request coming from the search form. */
export interface FareSearchQuery {
  /** Free-text origin: IATA code ("JFK") or city name ("New York"). */
  from: string;
  /** Free-text destination: IATA code or city name. */
  to: string;
  /** Start of the departure window, ISO date (yyyy-mm-dd). */
  departAfter: string;
  /** End of the departure window, ISO date (yyyy-mm-dd). */
  departBefore: string;
  /** Length of stay / trip duration in days (e.g. 7). */
  durationDays: number;
}

/** One dated fare option returned for a route + window. */
export interface FlightFare {
  id: string;
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  /** Departure date, ISO (yyyy-mm-dd). */
  date: string;
  /** Return date for round-trip options, ISO (yyyy-mm-dd). */
  returnDate?: string;
  /** Lowest available fare for that day, in USD. */
  priceUsd: number;
  /** Airline name, or null when not provided by the source. */
  airline: string | null;
  /** Total travel time in minutes, or null when not provided. */
  durationMinutes: number | null;
  /** 0 = nonstop. Null when not provided. */
  stops: number | null;
  /** External link to inspect flight options. Null = no link available. */
  inspectUrl: string | null;
}

/** Shared SearchApi metadata included with provider responses. */
export interface SearchApiMetadata {
  id: string;
  status: string;
  created_at: string;
  request_time_taken: number;
  parsing_time_taken: number;
  total_time_taken: number;
  request_url: string;
  html_url: string;
  json_url: string;
}

/** Provider search parameters are serialized as strings. */
export type SearchApiParameters = Record<string, string>;

/** Calendar fare entry; fields are absent for dates without available fares. */
export interface SearchApiCalendarItem {
  departure?: string;
  return?: string;
  price?: number;
  is_lowest_price?: boolean;
  has_no_flights?: boolean;
}

/** Raw response from the SearchApi Google Flights Calendar engine. */
export interface SearchApiCalendarResponse {
  search_metadata: SearchApiMetadata;
  search_parameters: SearchApiParameters;
  calendar?: SearchApiCalendarItem[];
  error?: string;
}

export interface SearchApiAirport {
  id: string;
  name: string;
}

export interface SearchApiFlightSegment {
  departure_airport: SearchApiAirport & { date: string; time: string };
  arrival_airport: SearchApiAirport & { date: string; time: string };
  duration: number;
  airplane?: string;
  airline: string;
  airline_logo?: string;
  travel_class?: string;
  flight_number?: string;
  ticket_also_sold_by?: string[];
  is_overnight?: boolean;
  is_often_delayed?: boolean;
  extensions?: string[];
  detected_extensions?: {
    has_in_seat_usb_outlet?: boolean;
    has_power_and_usb_outlets?: boolean;
    has_on_demand_video?: boolean;
    wifi?: string;
    seat_type?: string;
    legroom_short?: string;
    legroom_long?: string;
    carbon_emission?: number;
  };
}

export interface SearchApiLayover {
  duration: number;
  name: string;
  id: string;
}

export interface SearchApiFlightOption {
  flights: SearchApiFlightSegment[];
  layovers?: SearchApiLayover[];
  total_duration: number;
  carbon_emissions: {
    this_flight: number;
    typical_for_this_route: number;
    difference_percent: number;
    lowest_route: number;
  };
  price: number;
  type: string;
  extensions: string[];
  airline_logo: string;
  departure_token: string;
}

export interface SearchApiPriceInsights {
  lowest_price: number;
  price_level: string;
  typical_price_range: {
    low_price: number;
    high_price: number;
  };
  price_history: Array<{
    price: number;
    iso_date: string;
  }>;
}

export interface SearchApiAirportDetails {
  airport: SearchApiAirport;
  city: string;
  country: string;
  country_code: string;
  image: string;
  thumbnail: string;
}

export interface SearchApiAirportRoute {
  departure: SearchApiAirportDetails[];
  arrival: SearchApiAirportDetails[];
}

export interface SearchApiCodeName {
  code: string;
  name: string;
}

/** Raw response from the SearchApi Google Flights engine. */
export interface SearchApiFlightsResponse {
  search_metadata: SearchApiMetadata;
  search_parameters: SearchApiParameters;
  best_flights: SearchApiFlightOption[];
  other_flights: SearchApiFlightOption[];
  price_insights: SearchApiPriceInsights;
  airports: SearchApiAirportRoute[];
  airlines: {
    alliances: SearchApiCodeName[];
    airlines: SearchApiCodeName[];
    hubs: SearchApiCodeName[];
  };
  baggage_allowance_links: Array<{
    airline_code: string;
    airline: string;
    url: string;
  }>;
  passenger_assistance_links: Array<{
    airline_code: string;
    airline: string;
    url: string;
  }>;
  error?: string;
}

/** Lifecycle of a fare search within the UI. */
export type SearchStatus = "idle" | "loading" | "success" | "error";
