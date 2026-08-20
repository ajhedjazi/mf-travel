# MF Travel

The public website for MF Travel, a pre-booked airport-transfer and long-distance travel service based in Hull and the East Riding of Yorkshire.

## Local development

```bash
npm ci
npm run dev
```

## Production checks

```bash
npm run lint
npm run build
```

The project is a standard Next.js application configured for automatic deployment on Netlify from the `main` branch.

Copy `.env.example` to `.env.local` for local development and fill in the confirmed business details. Configure the same variables in Netlify for production. Do not commit private credentials.

## Netlify environment variables

- `NEXT_PUBLIC_SITE_URL=https://mftravel.co.uk`
- `NEXT_PUBLIC_BOOKING_PHONE`
- `NEXT_PUBLIC_BOOKING_EMAIL=bookings@mftravel.co.uk`
- `NEXT_PUBLIC_OPERATOR_LICENCE`
- `NEXT_PUBLIC_LICENSING_AUTHORITY=Kingston upon Hull City Council`
