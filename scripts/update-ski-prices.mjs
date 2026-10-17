import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = resolve(root, 'public/ski-holiday-2026/prices.json');
const participants = {
  Jack: { homeAirport: { label: 'Cardiff, Wales', code: 'CWL' }, availability: [[0, 62, 100, false, 'Flexible for the dates discussed through January.'], [62, 90, 100, true, 'No direct February confirmation; prior flexible estimate carried forward.']] },
  Philippe: { homeAirport: { label: 'Abu Dhabi, UAE', code: 'AUH' }, availability: [[0, 62, 100, false, 'Confirmed flexible for the dates discussed through January.'], [62, 90, 100, true, 'No direct February confirmation; prior flexible estimate carried forward.']] },
  Nazhan: { homeAirport: { label: 'Malaysia (Kuala Lumpur proxy)', code: 'KUL', isProxy: true }, availability: [[0, 6, 55, true, 'No direct statement for Dec 1–6; prefers before Christmas.'], [6, 13, 85, false, 'Dec 7–14 looks good; prefers this week.'], [13, 20, 60, false, 'Dec 14–20 possible, subject to ticket prices.'], [20, 25, 50, true, 'No direct statement for Dec 21–25.'], [25, 32, 30, false, 'Price concerns and NYE plans.'], [32, 40, 45, false, 'Jan 2–10 not confirmed; work calendar pending.'], [40, 54, 50, false, 'Proposed mid-January, work calendar unconfirmed.'], [54, 62, 50, true, 'No direct late-January statement.'], [62, 90, 50, true, 'No direct February statement.']] },
  Balint: { homeAirport: { label: 'Frankfurt, Germany', code: 'FRA' }, availability: [[0, 62, 100, false, 'Confirmed flexible for dates discussed through January.'], [62, 90, 100, true, 'No direct February confirmation; prior flexible estimate carried forward.']] },
  Misha: { homeAirport: { label: 'Spain (Madrid proxy)', code: 'MAD', isProxy: true }, availability: [[0, 16, 90, false, 'Likely available Dec 1–17; reconfirmed before Dec 17.'], [16, 25, 20, false, 'Must be back home from Dec 17.'], [25, 32, 5, false, 'In Japan over New Year.'], [32, 40, 5, false, 'Do not count on Jan 2–10.'], [40, 54, 30, false, 'Asked the group not to book until late January.'], [54, 62, 45, false, 'Said end of January; low commitment.'], [62, 90, 45, true, 'No direct February statement; late-January estimate carried forward.']] },
  Jesus: { homeAirport: { label: 'Calgary, Canada', code: 'YYC' }, availability: [[0, 13, 5, false, 'Very low probability in the first two weeks of December.'], [13, 21, 30, false, 'Robert estimated 30% for the week before Christmas.'], [21, 32, 10, false, 'Around Christmas estimated at 10%; family plans in Spain.'], [32, 46, 70, false, 'Robert estimated 70% for the first two weeks of January.'], [46, 62, 20, true, 'Carried forward from the early-January estimate.'], [62, 90, 20, true, 'No direct February statement; January estimate carried forward.']] },
  Robert: { homeAirport: { label: 'Poland (Warsaw proxy)', code: 'WAW', isProxy: true }, availability: [[0, 62, 100, false, 'Flexible on all proposed dates through mid-January.'], [62, 90, 100, true, 'No direct February confirmation; prior flexible estimate carried forward.']] },
};

// The candidate holiday locations currently compared on the page, with one representative gateway each.
const destinations = {
  'Gudauri, Georgia': { airportCode: 'TBS', region: 'Georgia · Gudauri' },
  'Shahdag, Azerbaijan': { airportCode: 'GYD', region: 'Azerbaijan · Shahdag' },
  'Dolomites, Italy': { airportCode: 'VCE', region: 'Italy · Dolomites' },
  'Tarentaise, France': { airportCode: 'GVA', region: 'France · Tarentaise' },
  'Tyrol, Austria': { airportCode: 'INN', region: 'Austria · Tyrol' },
};
const destinationList = Object.entries(destinations).map(([label, value]) => ({ label, ...value }));

// Modeled group accommodation values from the location series shown on the page.
const accommodationByWindow = [
  [1400, 1600, 1800, 2000, 2100], [1845, 2000, 2100, 2300, 2300],
  [1900, 2200, 2400, 2600, 2500], [3200, 3400, 4500, 4900, 4700],
  [4600, 4900, 5500, 5900, 5600], [4070, 4300, 3100, 3300, 3200],
  [2900, 3100, 2800, 3000, 2950], [2600, 2800, 2900, 3100, 3050],
  [2550, 2750, 3300, 3600, 3500], [2550, 2750, 3500, 3800, 3700],
  [2550, 2800, 3700, 4000, 3900], [2550, 2900, 4100, 4500, 4300],
  [2550, 3000, 4300, 4700, 4500],
];
const starts = [
  '2026-12-01', '2026-12-07', '2026-12-14', '2026-12-21', '2026-12-26',
  '2027-01-02', '2027-01-09', '2027-01-16', '2027-01-23', '2027-02-01',
  '2027-02-08', '2027-02-15', '2027-02-22',
];
const endOfStay = (date) => {
  const end = new Date(`${date}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 7);
  return end.toISOString().slice(0, 10);
};
const startOffset = (date) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse('2026-12-01T00:00:00Z')) / 86400000);
const availabilityForStay = (segments, start) => {
  let weightedProbability = 0;
  let inferredDays = 0;
  const notes = new Set();
  for (let day = start; day < start + 7; day += 1) {
    const segment = segments.find(([from, to]) => day >= from && day < to);
    if (!segment) continue;
    weightedProbability += segment[2];
    if (segment[3]) inferredDays += 1;
    notes.add(segment[4]);
  }
  return {
    probability: Math.round(weightedProbability / 7),
    inferred: inferredDays > 0,
    inferredDays,
    sourceNote: [...notes].join(' '),
  };
};
const availabilityForDay = (segments, day) => {
  const segment = segments.find(([from, to]) => day >= from && day < to);
  return segment
    ? { probability: segment[2], inferred: segment[3], sourceNote: segment[4] }
    : { probability: 50, inferred: true, sourceNote: 'No date-specific availability statement; unknown, so 50/50.' };
};

let db;
try {
  db = JSON.parse(await readFile(databasePath, 'utf8'));
} catch {
  db = { schemaVersion: 2, currency: 'EUR', updatedAt: null, participants: {} };
}
db.schemaVersion = 2;
db.currency = 'EUR';
db.destinations = destinations;

for (const [name, member] of Object.entries(participants)) {
  db.participants[name] ??= { homeAirport: member.homeAirport, dates: {} };
  db.participants[name].homeAirport = member.homeAirport;
  delete db.participants[name].origin;
  db.participants[name].availabilityByDate = Object.fromEntries(
    Array.from({ length: 28 }, (_, index) => {
      const day = index + 1;
      const date = `2027-02-${String(day).padStart(2, '0')}`;
      return [date, availabilityForDay(member.availability, 61 + day)];
    }),
  );
  for (let index = 0; index < starts.length; index += 1) {
    const startDate = starts[index];
    const endDate = endOfStay(startDate);
    const dateRecord = db.participants[name].dates[startDate] ??= {
      startDate,
      endDate,
      flights: {},
      accommodation: {},
      auxiliary: {
        resortTransferPerPersonEur: null,
        skiPassPerPersonEur: null,
        equipmentRentalPerPersonEur: null,
        totalPerPersonEur: null,
      },
    };
    dateRecord.startDate = startDate;
    dateRecord.endDate = endDate;
    dateRecord.availability = availabilityForStay(member.availability, startOffset(startDate));
    dateRecord.flights ??= {};
    // Migrate legacy aggregate data only as an explicitly non-location-specific value.
    if (dateRecord.flight?.averageEur != null) dateRecord.legacyFlightAverageEur = dateRecord.flight.averageEur;
    delete dateRecord.flight;
    for (const destination of destinationList) {
      dateRecord.flights[destination.label] ??= {
        averageEur: null,
        bestEur: null,
        offersCount: 0,
        airportCode: destination.airportCode,
        sampledAt: null,
      };
    }
    const groupPrices = accommodationByWindow[index];
    dateRecord.accommodation = {
      averagePerPersonEur: Math.round(groupPrices.reduce((sum, price) => sum + price, 0) / groupPrices.length / 7),
      byLocationPerPersonEur: Object.fromEntries(destinationList.map((destination, i) => [destination.label, Math.round(groupPrices[i] / 7)])),
      groupSize: 7,
      source: 'Modeled estimate already shown on the ski holiday page; mean of five candidate areas',
    };
    dateRecord.auxiliary ??= {
      resortTransferPerPersonEur: null,
      skiPassPerPersonEur: null,
      equipmentRentalPerPersonEur: null,
      totalPerPersonEur: null,
    };
  }
}

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  await writeDatabase();
  console.log('Amadeus credentials are not configured; stored availability/accommodation and skipped live flight search.');
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

// Four upcoming dates × seven members × five candidate locations = 140 requests/run.
const today = new Date();
const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
const futureDates = starts.filter((date) => Date.parse(`${date}T00:00:00Z`) >= todayUtc.getTime()).slice(0, 4);
let requestCount = 0;
for (const date of futureDates) {
  for (const [name, member] of Object.entries(participants)) {
    for (const destination of destinationList) {
      const query = new URLSearchParams({
        originLocationCode: member.homeAirport.code,
        destinationLocationCode: destination.airportCode,
        departureDate: date,
        returnDate: endOfStay(date),
        adults: '1',
        currencyCode: 'EUR',
        max: '20',
      });
      requestCount += 1;
      if (requestCount > 150) throw new Error('Search budget exceeded; refusing to make more than 150 flight calls in one run.');
      const response = await fetch(`${apiBase}/v2/shopping/flight-offers?${query}`, { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok) {
        console.warn(`${name} ${date} ${destination.airportCode}: Amadeus returned ${response.status}; preserving previous data.`);
        continue;
      }
      const result = await response.json();
      const prices = (result.data || []).map((offer) => Number(offer.price?.grandTotal)).filter(Number.isFinite);
      if (prices.length) {
        dateFor(name, date).flights[destination.label] = {
          averageEur: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
          bestEur: Math.round(Math.min(...prices)),
          offersCount: prices.length,
          airportCode: destination.airportCode,
          sampledAt: new Date().toISOString(),
        };
      }
    }
  }
}
db.updatedAt = new Date().toISOString();
db.flightDataSource = 'Amadeus Flight Offers Search; round-trip offers for each candidate location gateway';
await writeDatabase();
console.log(`Updated ${futureDates.length} upcoming departure windows with at most ${requestCount} searches.`);

function dateFor(name, date) {
  return db.participants[name].dates[date];
}
async function writeDatabase() {
  const orderedParticipants = Object.fromEntries(Object.entries(db.participants).map(([name, member]) => [name, {
    homeAirport: member.homeAirport,
    availabilityByDate: member.availabilityByDate,
    dates: member.dates,
  }]));
  const orderedDatabase = {
    schemaVersion: db.schemaVersion,
    currency: db.currency,
    updatedAt: db.updatedAt,
    flightDataSource: db.flightDataSource,
    destinations: db.destinations,
    participants: orderedParticipants,
  };
  await writeFile(databasePath, `${JSON.stringify(orderedDatabase, null, 2)}\n`);
}
