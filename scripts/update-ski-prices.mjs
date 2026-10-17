import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = resolve(root, 'public/ski-holiday-2026/prices.json');
const db = JSON.parse(await readFile(databasePath, 'utf8'));

if (db.schemaVersion !== 3 || !db.participants || !db.destinations || !db.dateRange) {
  throw new Error('prices.json is missing the expected February trip database structure.');
}

const token = process.env.DUFFEL_ACCESS_TOKEN;
if (!token) throw new Error('DUFFEL_ACCESS_TOKEN is required to collect live Duffel flight offers.');

const batchSize = Math.min(350, Math.max(1, Number.parseInt(process.env.DUFFEL_SEARCH_BATCH_SIZE || '325', 10)));
const concurrency = Math.min(6, Math.max(1, Number.parseInt(process.env.DUFFEL_SEARCH_CONCURRENCY || '4', 10)));
const observedAt = new Date().toISOString();
const offersEndpoint = new URL('https://api.duffel.com/air/offer_requests');
offersEndpoint.searchParams.set('return_offers', 'true');
offersEndpoint.searchParams.set('supplier_timeout', '10000');

const entries = [];
for (const [name, participant] of Object.entries(db.participants)) {
  const origin = participant.homeAirport?.code;
  if (!origin) continue;
  for (const trip of Object.values(participant.trips || {})) {
    for (const [location, destination] of Object.entries(db.destinations)) {
      const flight = trip.flights?.[location];
      if (flight && destination.airportCode) {
        entries.push({ name, origin, trip, location, destination: destination.airportCode, flight });
      }
    }
  }
}

if (!entries.length) throw new Error('No person/date/location flight rows were found in prices.json.');

const state = db.flightCollector || {};
if (state.provider !== 'Duffel' && String(db.flightDataSource || '').startsWith('Aviasales')) {
  for (const participant of Object.values(db.participants)) {
    for (const trip of Object.values(participant.trips || {})) {
      for (const flight of Object.values(trip.flights || {})) {
        flight.averageEur = null;
        flight.bestEur = null;
        flight.offersCount = 0;
        flight.sampledAt = null;
        delete flight.priceBasis;
        delete flight.sourceCurrencies;
        delete flight.fxRatesToEur;
      }
    }
  }
  console.log('Cleared legacy Aviasales samples before beginning Duffel collection.');
}

const startCursor = Number.isInteger(state.nextSearchIndex)
  ? ((state.nextSearchIndex % entries.length) + entries.length) % entries.length
  : 0;
const retryQueue = [...new Set((state.retryIndices || []).filter((index) => Number.isInteger(index) && index >= 0 && index < entries.length))];
const selected = [];
const selectedSet = new Set();

for (const index of retryQueue) {
  if (selected.length >= batchSize) break;
  selected.push(index);
  selectedSet.add(index);
}

let cursorScanned = 0;
while (selected.length < Math.min(batchSize, entries.length) && cursorScanned < entries.length) {
  const index = (startCursor + cursorScanned) % entries.length;
  cursorScanned += 1;
  if (selectedSet.has(index)) continue;
  selected.push(index);
  selectedSet.add(index);
}

const nextRetryIndices = retryQueue.filter((index) => !selectedSet.has(index));
const failedIndices = [];
const ratePromises = new Map();
let completed = 0;
let offersFound = 0;

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function fetchJson(url, options, label) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { ...options, signal: AbortSignal.timeout(25_000) });
    } catch (error) {
      if (attempt === 3) throw new Error(`${label}: ${error.message}`);
      await wait(1000 * (attempt + 1));
      continue;
    }

    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      const retryAfter = Number(response.headers.get('retry-after'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 60_000)
        : 1000 * (2 ** attempt);
      await wait(delay);
      continue;
    }
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 400);
      throw new Error(`${label}: HTTP ${response.status}${detail ? ` — ${detail}` : ''}`);
    }
    return response.json();
  }
  throw new Error(`${label}: retries exhausted.`);
}

async function getRateToEur(currency) {
  const code = currency.toUpperCase();
  if (code === 'EUR') return 1;
  if (!ratePromises.has(code)) {
    const url = `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(code)}/EUR`;
    ratePromises.set(code, fetchJson(url, { headers: { Accept: 'application/json' } }, `FX ${code}/EUR`)
      .then((result) => {
        const rate = Number(result.rate);
        if (!Number.isFinite(rate) || rate <= 0) throw new Error(`FX ${code}/EUR returned an invalid rate.`);
        return rate;
      }));
  }
  return ratePromises.get(code);
}

async function search(entry) {
  const body = {
    data: {
      slices: [
        { origin: entry.origin, destination: entry.destination, departure_date: entry.trip.startDate },
        { origin: entry.destination, destination: entry.origin, departure_date: entry.trip.endDate },
      ],
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy',
      max_connections: 1,
    },
  };
  const result = await fetchJson(offersEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Duffel-Version': 'v2',
    },
    body: JSON.stringify(body),
  }, `${entry.origin}-${entry.destination} ${entry.trip.startDate}–${entry.trip.endDate}`);

  if (!result.data || !Array.isArray(result.data.offers)) {
    throw new Error(`${entry.origin}-${entry.destination} returned an unexpected Duffel offer response.`);
  }

  const euroPrices = [];
  const currencies = new Set();
  const rates = {};
  for (const offer of result.data.offers) {
    const amount = Number(offer.total_amount);
    const currency = String(offer.total_currency || '').toUpperCase();
    if (!Number.isFinite(amount) || amount <= 0 || !currency) continue;
    currencies.add(currency);
    const rate = await getRateToEur(currency);
    rates[currency] = rate;
    euroPrices.push(Math.round((amount * rate + Number.EPSILON) * 100) / 100);
  }

  return { euroPrices, currencies: [...currencies], rates };
}

async function worker(queue) {
  while (queue.length) {
    const index = queue.shift();
    const entry = entries[index];
    try {
      const result = await search(entry);
      const prices = result.euroPrices;
      entry.flight.sampledAt = observedAt;
      entry.flight.offersCount = prices.length;
      entry.flight.averageEur = prices.length
        ? Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length + Number.EPSILON) * 100) / 100
        : null;
      entry.flight.bestEur = prices.length ? Math.min(...prices) : null;
      entry.flight.priceBasis = 'Duffel live round-trip offers for one adult; EUR-converted reference prices';
      entry.flight.sourceCurrencies = result.currencies;
      entry.flight.fxRatesToEur = result.rates;
      offersFound += prices.length;
      completed += 1;
      if (completed % 25 === 0 || completed === selected.length) {
        console.log(`Duffel searches completed: ${completed}/${selected.length}; offers received: ${offersFound}.`);
      }
    } catch (error) {
      failedIndices.push(index);
      console.warn(`Search ${index + 1}/${entries.length} (${entry.name}, ${entry.origin}-${entry.destination}, ${entry.trip.startDate}–${entry.trip.endDate}) failed: ${error.message}`);
    }
  }
}

const queue = [...selected];
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker(queue)));

db.flightCollector = {
  provider: 'Duffel',
  batchSize,
  nextSearchIndex: (startCursor + cursorScanned) % entries.length,
  retryIndices: [...new Set([...nextRetryIndices, ...failedIndices])],
  totalSearchRows: entries.length,
  lastRunAt: observedAt,
};
db.flightDataSource = 'Duffel Flights API live searches; one-adult round-trip offer snapshots, converted to EUR using Frankfurter reference rates.';
db.updatedAt = observedAt;
await writeFile(databasePath, `${JSON.stringify(db, null, 2)}\n`);

console.log(`Updated ${completed}/${selected.length} Duffel searches (${offersFound} offers); ${failedIndices.length} searches queued for retry.`);
console.log(`Database coverage: ${entries.length} person/date/location combinations; next rotating index ${db.flightCollector.nextSearchIndex}.`);

if (failedIndices.length) process.exitCode = 1;
