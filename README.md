# ✈️ Cheapest-Day-to-Fly Finder

A modern web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS v4** that finds the cheapest days to fly for flexible travelers. Powered by **SearchApi's Google Flights APIs**.

Instead of guessing return dates, users specify a **flexible departure window** and a **fixed trip duration** (e.g. _"I want a 7-day vacation departing anytime between Nov 1 and Nov 20"_). The engine queries Google Flights Calendar data, filters for the exact duration, ranks the cheapest options, and provides direct booking/inspection links.

---

## ⚡ 5-Minute Quickstart

### 1. Prerequisites

- **Node.js** 18.17+ or later
- **npm**, **pnpm**, or **yarn**
- A **[SearchApi](https://www.searchapi.io/)** API key

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` (or `.env`) file in the `frontend` folder:

```env
SEARCHAPI_API_KEY=your_searchapi_key_here
```

> **Security Note:** The API key is accessed exclusively on the server side inside Route Handlers (`/api/*`). It is never exposed to the client browser.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 How the Search Flow Works

```text
[ User Inputs ]
├── Origin & Destination (City / Airport Autocomplete)
├── Earliest Departure Date  (e.g. 2026-11-01)
├── Latest Departure Date    (e.g. 2026-11-20)
└── Length of Stay in Days   (e.g. 7 days)
       │
       ▼
[ Client Request: POST /api/calendar ]
       │
       ▼
[ Next.js Server Route Handler ]
├── Validates inputs (window ≤ 30 days to avoid API matrix limits)
├── Calculates UTC return bounds: [start + duration] to [end + duration]
└── Calls SearchApi (google_flights_calendar)
       │
       ▼
[ Response Filtering & Ranking ]
├── Discards entries with missing prices or `has_no_flights: true`
├── Filters combinations where (Return Date - Departure Date) === Length of Stay
├── Sorts matching flights ascending by price (cheapest first)
└── Generates direct Google Flights deep-links for inspection
       │
       ▼
[ Results UI ]
Displays ranked cards with lowest fare badge, dates, and "Inspect on Google Flights" CTA.
```

---

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── calendar/route.ts      # POST: Fetches & filters flexible calendar fares
│   │   │   ├── location/route.ts      # POST: SearchApi airport & city autocomplete
│   │   │   └── flight-data/route.ts   # GET: Individual flight lookup utility
│   │   ├── layout.tsx                 # Root layout & typography
│   │   ├── page.tsx                   # Main page rendering CheapestDayFinder
│   │   └── globals.css                # Tailwind CSS v4 design tokens & theme
│   ├── components/
│   │   ├── CheapestDayFinder.tsx      # Main controller (search lifecycle & state)
│   │   ├── SearchForm.tsx             # Origin, Destination, date window & duration inputs
│   │   ├── LocationAutocomplete.tsx   # Debounced autocomplete with city/airport hierarchy
│   │   ├── ResultsPanel.tsx           # Results list, loading skeletons, empty & error states
│   │   ├── FareRow.tsx                # Ranked flight card with dates, price & inspect link
│   │   ├── FareRowSkeleton.tsx        # Loading placeholder
│   │   ├── Field.tsx                  # Accessible text, date, and number inputs
│   │   └── Button.tsx                 # Primary & quiet action buttons
│   └── lib/
│       ├── types.ts                   # Domain types (FareSearchQuery, FlightFare, SearchStatus)
│       ├── format.ts                  # Pure UTC date math (addDays, dayDiff), formatting, airport parsing
│       └── cn.ts                      # Classnames utility
└── package.json
```

---

## 🔌 API Routes Reference

### 1. `POST /api/calendar`

Searches flexible round-trip fares matching a specific trip duration.

**Request Body:**

```json
{
  "origin": "JFK",
  "destination": "LHR",
  "departAfter": "2026-11-01",
  "departBefore": "2026-11-20",
  "durationDays": 7
}
```

**Response (200 OK):**

```json
{
  "fares": [
    {
      "id": "JFK-LHR-2026-11-03-2026-11-10-0",
      "fromCode": "JFK",
      "toCode": "LHR",
      "fromCity": "JFK",
      "toCity": "LHR",
      "date": "2026-11-03",
      "returnDate": "2026-11-10",
      "priceUsd": 642,
      "airline": null,
      "durationMinutes": null,
      "stops": null,
      "inspectUrl": "https://www.google.com/travel/flights?q=..."
    }
  ],
  "totalFound": 18,
  "requestedDuration": 7
}
```

---

### 2. `POST /api/location`

Provides type-ahead location suggestions (cities and airports with IATA codes).

**Request Body:**

```json
{
  "query": "London",
  "departure": false
}
```

---

## 🛠️ Key Implementation Notes & Gotchas

1. **"Latest Departure" vs. "Return Date":**
   - **Earliest / Latest departure** define the **outbound window** (when the traveler can leave).
   - **Return Date** is calculated automatically (`Departure Date + Length of Stay`).
2. **Calendar Combination Limits:**
   - Google Flights Calendar returns an outbound × return matrix. The server enforces a maximum **30-day outbound window** to prevent API timeouts and credit exhaustion.
3. **Pure UTC Date Arithmetic:**
   - All date operations in `src/lib/format.ts` (`addDays`, `dayDiff`) use UTC timestamps to avoid daylight savings time shifts or local timezone off-by-one errors.
4. **Airport Code Parsing:**
   - Locations can be selected as `"London (LHR)"` or typed directly as `"LHR"`. The helper `extractAirportCode()` automatically resolves both into the clean 3-letter IATA code.

---

## 📜 Available Scripts

| Command         | Action                                                             |
| :-------------- | :----------------------------------------------------------------- |
| `npm run dev`   | Starts local Next.js development server at `http://localhost:3000` |
| `npm run build` | Compiles production build                                          |
| `npm run start` | Starts production server                                           |
| `npm run lint`  | Runs ESLint and TypeScript code quality checks                     |
