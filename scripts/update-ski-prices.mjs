import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = resolve(root, 'public/ski-holiday-2026/prices.json');
const db = JSON.parse(await readFile(databasePath, 'utf8'));

if (db.schemaVersion !== 3 || !db.participants || !db.destinations || !db.dateRange) {
  throw new Error('prices.json is missing the expected February trip database structure.');
}

const participants = Object.entries(db.participants);
const destinations = Object.entries(db.destinations);
const trips = new Map();
for (const [, participant] of participants) {
  for (const [key, trip] of Object.entries(participant.trips || {})) trips.set(key, trip);
}

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  console.log('Amadeus credentials are not configured; prices.json remains the source database and flight fares stay as currently recorded.');
  process.exit(0);
}

const apiBase = process.env.AMADEUS_API_BASE || 'https://api.amadeus.com';
const tokenResponse = await fetch(`${apiBase}/v1/security/oauth2/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.AMADEUS_CLIENT_ID,
    client_secret: process.env.AMADEUS_CLIENT_SECRET,
  }),
});
if (!tokenResponse.ok) throw new Error(`Amadeus token request failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
const { access_token: token } = await tokenResponse.json();

const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const date = (value) => new Date(`${value}T00:00:00Z`);
const upcomingTrips = [...trips.entries()]
  .map(([key, trip]) => ({ key, trip }))
  .filter(({ trip }) => date(trip.endDate) >= today)
  .sort((a, b) => b.trip.holidayDays - a.trip.holidayDays
    || a.trip.weekdaysOff - b.trip.weekdaysOff
    || a.trip.startDate.localeCompare(b.trip.startDate)
    || a.trip.endDate.localeCompare(b.trip.endDate));
const tripsToRefresh = upcomingTrips.filter(({ key }) => participants.some(([, participant]) =>
  destinations.some(([location]) => participant.trips[key]?.flights?.[location]?.sampledAt == null)))
  .slice(0, 4);

let requestCount = 0;
for (const { key, trip } of tripsToRefresh) {
  for (const [name, participant] of participants) {
    for (const [location, destination] of destinations) {
      const flight = participant.trips[key]?.flights?.[location];
      if (!flight || flight.sampledAt) continue;

      const query = new URLSearchParams({
        originLocationCode: participant.homeAirport.code,
        destinationLocationCode: destination.airportCode,
        departureDate: trip.startDate,
        returnDate: trip.endDate,
        adults: '1', currencyCode: db.currency || 'EUR', max: '20',
      });
      requestCount += 1;
      if (requestCount > 150) throw new Error('Search budget exceeded; refusing to make more than 150 flight calls in one run.');

      const response = await fetch(`${apiBase}/v2/shopping/flight-offers?${query}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.warn(`${name} ${key} ${destination.airportCode}: Amadeus returned ${response.status}; preserving previous data.`);
        continue;
      }

      const result = await response.json();
      const prices = (result.data || []).map((offer) => Number(offer.price?.grandTotal)).filter(Number.isFinite);
      flight.sampledAt = new Date().toISOString();
      flight.offersCount = prices.length;
      flight.averageEur = prices.length ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) : null;
      flight.bestEur = prices.length ? Math.round(Math.min(...prices)) : null;
    }
  }
}

db.updatedAt = new Date().toISOString();
await writeFile(databasePath, `${JSON.stringify(db, null, 2)}\n`);
console.log(`Updated ${tripsToRefresh.length} February trip options with at most ${requestCount} searches in prices.json.`);
