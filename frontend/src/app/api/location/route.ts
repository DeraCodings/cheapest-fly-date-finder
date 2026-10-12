import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
	const { query, departure } = await request.json();
	if (!query) {
		return NextResponse.json({ error: "No query provided" }, { status: 400 });
	}
	const url = "https://www.searchapi.org/api/v1/search";
	const params = new URLSearchParams({
		"engine": "google_flights_location_search",
		"q": query,
		"api_key": process.env.SEARCHAPI_API_KEY!,
		"search_type": departure ? "departure" : "arrival",
	});

	try {
		const response = await fetch(`${url}?${params}`);
		const data = await response.json();
		console.dir(data, { depth: null });
		if (!data) {
			return NextResponse.json({ error: "No location data found" }, { status: 404 });
		}
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error is: ", error);
		return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 });
	}
}