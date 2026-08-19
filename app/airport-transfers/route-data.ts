export type AirportRoute = {
  slug: string;
  airport: string;
  shortName: string;
  price: number;
  miles: number;
  journeyTime: string;
  title: string;
  description: string;
  intro: string;
  routeHeading: string;
  routeCopy: string;
  airportHeading: string;
  airportCopy: string;
  usefulFor: string[];
  planningPoints: { title: string; copy: string }[];
};

export const airportRoutes: AirportRoute[] = [
  {
    slug: "hull-to-manchester-airport",
    airport: "Manchester Airport",
    shortName: "Manchester",
    price: 145,
    miles: 112,
    journeyTime: "around 2 hours 15 minutes",
    title: "Hull to Manchester Airport Transfer",
    description: "Pre-booked Hull to Manchester Airport transfers from £145, with one clear quote, flight-aware return planning and door-to-terminal travel.",
    intro: "Manchester is one of the main departure airports for Hull travellers. MF Travel provides a direct, pre-booked alternative to changing trains with cases or arranging separate transport for the final part of the journey.",
    routeHeading: "A cross-Pennine journey planned properly",
    routeCopy: "The usual journey runs west from Hull towards Manchester and is planned with extra time for the M62 and the airport approach. Your collection time is agreed from your flight departure, check-in guidance and pickup address—not from a generic timetable.",
    airportHeading: "Terminal details agreed before travel",
    airportCopy: "Manchester has three passenger terminals. Tell us the airline and flight number when requesting a quote so the correct terminal, outward drop-off and return collection plan can be confirmed in writing.",
    usefulFor: ["Long-haul and European departures", "Families travelling with several cases", "Early flights before practical rail connections"],
    planningPoints: [
      { title: "Guide fare from Hull", copy: "£145 for one pickup, one drop-off, normal luggage and the standard airport charge, subject to final journey details." },
      { title: "Return collection", copy: "Provide the flight number so the latest arrival information can be checked and the collection planned around it." },
      { title: "Traffic allowance", copy: "Cross-Pennine conditions can vary, so the recommended pickup time includes a sensible journey margin." },
    ],
  },
  {
    slug: "hull-to-leeds-bradford-airport",
    airport: "Leeds Bradford Airport",
    shortName: "Leeds Bradford",
    price: 100,
    miles: 72,
    journeyTime: "around 1 hour 40 minutes",
    title: "Hull to Leeds Bradford Airport Transfer",
    description: "Pre-booked Hull to Leeds Bradford Airport transfers from £100, including a clear guide fare and door-to-terminal collection from Hull.",
    intro: "Leeds Bradford is a useful regional airport for city breaks, holidays and business flights, but it has no direct railway station. A pre-booked car keeps the journey together from your Hull address to the terminal.",
    routeHeading: "Direct from Hull to the terminal",
    routeCopy: "The airport sits north-west of Leeds, so the final approach can take a meaningful part of the journey. MF Travel works backwards from the required terminal arrival time and agrees the pickup before travel day.",
    airportHeading: "No station change with luggage",
    airportCopy: "Travelling by rail normally means continuing by bus, taxi or another connection. The MF Travel journey is door-to-terminal, with passenger numbers and case sizes checked before the booking is accepted.",
    usefulFor: ["European and domestic routes", "Passengers avoiding a Leeds city-centre change", "Couples and families with checked luggage"],
    planningPoints: [
      { title: "Guide fare from Hull", copy: "£100 based on a direct Hull pickup, one terminal drop-off, normal luggage and the standard airport charge." },
      { title: "Pickup beyond Hull", copy: "Beverley, Cottingham, Hessle and other East Riding collections are available; the final quote reflects the exact address." },
      { title: "Flight-aware return", copy: "The flight number helps MF Travel plan the return collection using the latest published arrival information." },
    ],
  },
  {
    slug: "hull-to-humberside-airport",
    airport: "Humberside Airport",
    shortName: "Humberside",
    price: 50,
    miles: 22,
    journeyTime: "around 35 to 45 minutes",
    title: "Hull to Humberside Airport Transfer",
    description: "Pre-booked Hull to Humberside Airport transfers from £50, with direct collection, luggage confirmation and a clear written quote.",
    intro: "Humberside is the closest commercial airport to Hull and is especially convenient for selected European services, offshore connections and onward hub flights. MF Travel provides a straightforward pre-booked journey across the Humber.",
    routeHeading: "The closest airport transfer from Hull",
    routeCopy: "The journey is far shorter than the larger regional airports, but timing still matters for early departures and limited check-in windows. Collection is arranged around the flight rather than treated as an ordinary local taxi booking.",
    airportHeading: "Simple departures and planned returns",
    airportCopy: "Humberside has a compact terminal, making it a practical option when its timetable suits your trip. Share the airline, flight number and luggage details so both the outward and return arrangements can be confirmed together.",
    usefulFor: ["Selected leisure flights", "Offshore and business travel", "Passengers prioritising a shorter road journey"],
    planningPoints: [
      { title: "Guide fare from Hull", copy: "£50 for the standard direct journey described on your quote, based on one pickup and normal luggage." },
      { title: "Early departures", copy: "Pre-booked collections can be arranged at any hour, subject to availability, even when the enquiry line is closed." },
      { title: "Luggage checked first", copy: "Case and passenger numbers are confirmed before booking so the suitable MF Travel vehicle can be allocated." },
    ],
  },
  {
    slug: "hull-to-east-midlands-airport",
    airport: "East Midlands Airport",
    shortName: "East Midlands",
    price: 150,
    miles: 105,
    journeyTime: "around 2 hours 10 minutes",
    title: "Hull to East Midlands Airport Transfer",
    description: "Pre-booked Hull to East Midlands Airport transfers from £150, with direct door-to-terminal travel and return flight planning.",
    intro: "East Midlands can offer useful holiday routes that are not always available from the airports closer to Hull. MF Travel turns it into one planned door-to-terminal journey rather than a chain of rail and local connections.",
    routeHeading: "A longer journey with one clear plan",
    routeCopy: "The route heads south from Hull towards the East Midlands. Pickup timing is set from the required airport arrival, expected road conditions and the exact collection address, leaving an appropriate margin for a journey of this length.",
    airportHeading: "Useful for package-holiday departures",
    airportCopy: "East Midlands serves a wide selection of leisure destinations. Provide the airline and flight number so MF Travel can confirm the departure drop-off and create a practical return collection plan.",
    usefulFor: ["Package holidays and seasonal routes", "Groups sharing one direct journey", "Flights unavailable from nearer airports"],
    planningPoints: [
      { title: "Guide fare from Hull", copy: "£150 based on one Hull pickup, one airport drop-off, normal luggage and the standard airport charge." },
      { title: "Door-to-terminal", copy: "There is no need to transfer between trains, buses and a final taxi while travelling with luggage." },
      { title: "Both legs together", copy: "Request the outward and return journeys at the same time so the full holiday transport plan is recorded clearly." },
    ],
  },
  {
    slug: "hull-to-liverpool-airport",
    airport: "Liverpool John Lennon Airport",
    shortName: "Liverpool",
    price: 165,
    miles: 125,
    journeyTime: "around 2 hours 30 minutes",
    title: "Hull to Liverpool Airport Transfer",
    description: "Pre-booked Hull to Liverpool John Lennon Airport transfers from £165, with a clear guide fare and direct travel from your door.",
    intro: "Liverpool John Lennon Airport can be the best fit for particular low-cost and European routes. From Hull, the public-transport journey usually involves several stages; MF Travel provides one pre-booked car from home to the airport.",
    routeHeading: "One car across the M62 corridor",
    routeCopy: "Liverpool is the longest of MF Travel's five priority airport routes. The collection time is planned conservatively around the cross-Pennine journey, the airport arrival target and the possibility of slower traffic on the western approach.",
    airportHeading: "A practical option for route choice",
    airportCopy: "Choosing Liverpool can unlock a different flight time or destination. Share the booking details before confirming so the correct airport—not Manchester—and the agreed drop-off arrangements appear clearly on your quote.",
    usefulFor: ["Low-cost and European services", "Travellers choosing a better flight time", "Passengers who want to avoid several connections"],
    planningPoints: [
      { title: "Guide fare from Hull", copy: "£165 for the standard direct journey, with the exact pickup, passengers, luggage and included charges confirmed in writing." },
      { title: "Longer-distance comfort", copy: "Passenger and case numbers are checked in advance so everyone and everything fits the allocated vehicle." },
      { title: "Delayed return flights", copy: "Arrival information can be monitored using your flight number; any waiting or additional parking terms are stated before booking." },
    ],
  },
];

export const allAirportFares = [
  { airport: "Humberside Airport", price: 50, note: "Approx. 22 miles", slug: "hull-to-humberside-airport" },
  { airport: "Leeds Bradford Airport", price: 100, note: "Approx. 72 miles", slug: "hull-to-leeds-bradford-airport" },
  { airport: "Manchester Airport", price: 145, note: "Approx. 112 miles", slug: "hull-to-manchester-airport" },
  { airport: "East Midlands Airport", price: 150, note: "Approx. 105 miles", slug: "hull-to-east-midlands-airport" },
  { airport: "Liverpool John Lennon Airport", price: 165, note: "Approx. 125 miles", slug: "hull-to-liverpool-airport" },
  { airport: "Newcastle International Airport", price: 190, note: "Approx. 135 miles", slug: null },
  { airport: "Birmingham Airport", price: 195, note: "Approx. 135 miles", slug: null },
] as const;

export function getAirportRoute(slug: string) {
  return airportRoutes.find((route) => route.slug === slug);
}
