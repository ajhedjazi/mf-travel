# MF Travel TomTom driver map

The driver prototype now supports an embedded TomTom-powered map and traffic-aware route calculation.

## Required configuration

Set this environment variable in the deployment environment:

`NEXT_PUBLIC_TOMTOM_API_KEY`

Use a TomTom browser API key and restrict it to the MF Travel web origins in the TomTom developer portal.

## Current V1 behaviour

- Uses the driver's phone location as the route origin.
- Geocodes the booking destination with TomTom Search.
- Calculates the fastest car route with traffic enabled.
- Draws the route inside the MF Travel driver screen.
- Shows estimated journey time, mileage and traffic delay.
- Keeps Apple Maps as a fallback while the embedded navigation matures.

## Next steps

1. Add a real TomTom key to the deployment environment.
2. Test Hull to Leeds Bradford Airport on an iPhone.
3. Add recommended departure time / GO NOW logic.
4. Add route refresh while the driver is moving.
5. Move bookings from localStorage to Supabase.
6. Evaluate native TomTom Navigation SDK for full turn-by-turn guidance later.
