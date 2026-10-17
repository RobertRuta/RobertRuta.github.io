import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = resolve(root, 'public/ski-holiday-2026/prices.json');
const db = JSON.parse(await readFile(databasePath, 'utf8'));

if (db.schemaVersion !== 3 || !db.participants || !db.destinations || !db.dateRange) {
  throw new Error('prices.json is missing the expected February trip database structure.');
}

const token = process.env.AVIASALES_API_TOKEN;
if (!token) {
  console.log('AVIASALES_API_TOKEN is not configured; no external flight data was fetched and existing prices.json values were preserved.');
  process.exit(0);
}

const endpoint = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const observedAt = new Date().toISOString();
const rowsByRoute = new Map();
let requestCount = 0;
let successfulRoutes = 0;

async function fetchRoute(origin, destination) {
  const rows = [];
  const limit = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const query = new URLSearchParams({
      origin,
      destination,
      departure_at: db.dateRange.start.slice(0, 7),
      return_at: db.dateRange.start.slice(0, 7),
      one_way: 'false',
      direct: 'false',
      sorting: 'price',
      unique: 'false',
      currency: db.currency || 'EUR',
      limit: String(limit),
      page: String(page),
    });
    requestCount += 1;
    if (requestCount > 350) throw new Error('Request guard exceeded; refusing to make more than 350 API calls in one run.');

    const response = await fetch(`${endpoint}?${query}`, {
      headers: { 'X-Access-Token': token, 'Accept-Encoding': 'gzip, deflate' },
    });
    if (response.status === 429) {
      const reset = Number(response.headers.get('x-rate-limit-reset'));
      const waitMs = Number.isFinite(reset) && reset > 0 ? reset * 1000 + 250 : 60_000;
      console.warn(`Rate limited on ${origin}-${destination}; waiting ${Math.ceil(waitMs / 1000)}s once.`);
      await new Promise((resolveWait) => setTimeout(resolveWait, waitMs));
      page -= 1;
      continue;
    }
    if (!response.ok) throw new Error(`Aviasales request for ${origin}-${destination} failed: ${response.status} ${await response.text()}`);

    const result = await response.json();
    if (result.success !== true || !Array.isArray(result.data)) {
      throw new Error(`Aviasales returned an invalid response for ${origin}-${destination}: ${result.error || 'unexpected response shape'}`);
    }
    rows.push(...result.data);
    if (page === 10 && result.data.length === limit) {
      throw new Error(`Aviasales returned at least ${limit * 10} rows for ${origin}-${destination}; refusing to save a truncated sample.`);
    }
    if (result.data.length < limit) break;
  }

  return rows;
}

for (const [name, participant] of Object.entries(db.participants)) {
  const origin = participant.homeAirport?.code;
  if (!origin) continue;

  for (const [location, destination] of Object.entries(db.destinations)) {
    const airport = destination.airportCode;
    const routeKey = `${origin}:${airport}`;
    if (!rowsByRoute.has(routeKey)) {
      try {
        rowsByRoute.set(routeKey, await fetchRoute(origin, airport));
        successfulRoutes += 1;
        console.log(`${origin}-${airport}: received ${rowsByRoute.get(routeKey).length} cached round-trip observations.`);
      } catch (error) {
        console.warn(`${name} / ${location}: ${error.message}; preserving previous route prices.`);
        rowsByRoute.set(routeKey, null);
      }
    }

    const rows = rowsByRoute.get(routeKey);
    if (!rows) continue;

    for (const trip of Object.values(participant.trips || {})) {
      const flight = trip.flights?.[location];
      if (!flight) continue;
      const matches = rows.filter((row) => {
        const departure = String(row.departure_at || '').slice(0, 10);
        const returning = String(row.return_at || '').slice(0, 10);
        const price = Number(row.price);
        const rowCurrency = String(row.currency || db.currency || '').toUpperCase();
        return departure === trip.startDate
          && returning === trip.endDate
          && (!row.origin_airport || row.origin_airport === origin)
          && (!row.destination_airport || row.destination_airport === airport)
          && rowCurrency === String(db.currency || 'EUR').toUpperCase()
          && Number.isFinite(price)
          && price > 0
          && (!row.expires_at || Date.parse(row.expires_at) > Date.now());
      });
      const prices = matches.map((row) => Number(row.price));
      flight.sampledAt = observedAt;
      flight.offersCount = prices.length;
      flight.averageEur = prices.length ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) : null;
      flight.bestEur = prices.length ? Math.round(Math.min(...prices)) : null;
      flight.priceBasis = 'Aviasales cached user-search observations';
    }
  }
}

if (successfulRoutes === 0) throw new Error('No route request succeeded; prices.json was not changed. Check the Travelpayouts API token and API access.');

db.updatedAt = observedAt;
db.flightDataSource = 'Aviasales Data API (Travelpayouts), cached round-trip prices recently found in user searches; not live bookable quotes';
await writeFile(databasePath, `${JSON.stringify(db, null, 2)}\n`);
console.log(`Refreshed ${rowsByRoute.size} origin/gateway routes with ${requestCount} API requests in prices.json.`);
