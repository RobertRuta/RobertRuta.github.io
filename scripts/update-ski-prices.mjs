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

const destinations = {
  'Gudauri, Georgia': { airportCode: 'TBS', region: 'Georgia · Gudauri' },
  'Shahdag, Azerbaijan': { airportCode: 'GYD', region: 'Azerbaijan · Shahdag' },
  'Dolomites, Italy': { airportCode: 'VCE', region: 'Italy · Dolomites' },
  'Tarentaise, France': { airportCode: 'GVA', region: 'France · Tarentaise' },
  'Tyrol, Austria': { airportCode: 'INN', region: 'Austria · Tyrol' },
};
const destinationList = Object.entries(destinations).map(([label, value]) => ({ label, ...value }));
const accommodationAnchors = [
  { date: '2027-02-01', group7NightEur: [2550, 2750, 3500, 3800, 3700] },
  { date: '2027-02-08', group7NightEur: [2550, 2800, 3700, 4000, 3900] },
  { date: '2027-02-15', group7NightEur: [2550, 2900, 4100, 4500, 4300] },
  { date: '2027-02-22', group7NightEur: [2550, 3000, 4300, 4700, 4500] },
];
const februaryDates = Array.from({ length: 28 }, (_, i) => `2027-02-${String(i + 1).padStart(2, '0')}`);
const dateAtUtc = (isoDate) => new Date(`${isoDate}T00:00:00Z`);
const formatUtc = (date) => date.toISOString().slice(0, 10);
const tripKey = (startDate, endDate) => `${startDate}__${endDate}`;
const dateOffset = (date) => Math.round((dateAtUtc(date) - dateAtUtc('2026-12-01')) / 86400000);
const weekday = (date) => dateAtUtc(date).getUTCDay();
const countWeekdaysOff = (startDate, endDate) => {
  let count = 0;
  for (let date = dateAtUtc(startDate); date <= dateAtUtc(endDate); date.setUTCDate(date.getUTCDate() + 1)) {
    if (formatUtc(date) === startDate) continue; // Friday evening/Saturday/Sunday departure does not use a workday.
    if (date.getUTCDay() >= 1 && date.getUTCDay() <= 5) count += 1;
  }
  return count;
};
const candidateTrips = [];
for (const startDate of februaryDates) {
  if (![0, 5, 6].includes(weekday(startDate))) continue; // Friday, Saturday, Sunday departures.
  for (let end = dateAtUtc(startDate); ; end.setUTCDate(end.getUTCDate() + 1)) {
    end.setUTCHours(0, 0, 0, 0);
    const endDate = formatUtc(end);
    if (endDate > '2027-02-28') break;
    if (endDate <= startDate) continue;
    candidateTrips.push({
      key: tripKey(startDate, endDate), startDate, endDate,
      nights: Math.round((dateAtUtc(endDate) - dateAtUtc(startDate)) / 86400000),
      holidayDays: Math.round((dateAtUtc(endDate) - dateAtUtc(startDate)) / 86400000) + 1,
      weekdaysOff: countWeekdaysOff(startDate, endDate),
    });
    if (endDate === '2027-02-28') break;
  }
}

const availabilityForDay = (segments, date) => {
  const offset = dateOffset(date);
  const segment = segments.find(([from, to]) => offset >= from && offset < to);
  return segment
    ? { probability: segment[2], inferred: segment[3], sourceNote: segment[4] }
    : { probability: 50, inferred: true, sourceNote: 'No date-specific availability statement; unknown, so 50/50.' };
};
const availabilityForTrip = (segments, startDate, endDate) => {
  let score = 0;
  let inferred = false;
  const notes = new Set();
  for (let date = dateAtUtc(startDate); date <= dateAtUtc(endDate); date.setUTCDate(date.getUTCDate() + 1)) {
    const daily = availabilityForDay(segments, formatUtc(date));
    score += daily.probability;
    inferred ||= daily.inferred;
    notes.add(daily.sourceNote);
  }
  return { probability: Math.round(score / (Math.round((dateAtUtc(endDate) - dateAtUtc(startDate)) / 86400000) + 1)), inferred, sourceNote: [...notes].join(' ') };
};
const accommodationForTrip = (startDate, nights) => {
  const anchor = [...accommodationAnchors].reverse().find((item) => item.date <= startDate) || accommodationAnchors[0];
  return Object.fromEntries(destinationList.map((destination, i) => [
    destination.label,
    Math.round(anchor.group7NightEur[i] * nights / 49), // group estimate × nights ÷ 7 nights ÷ 7 people
  ]));
};

let db;
try {
  db = JSON.parse(await readFile(databasePath, 'utf8'));
} catch {
  db = { schemaVersion: 3, currency: 'EUR', updatedAt: null, participants: {} };
}
db.schemaVersion = 3;
db.currency = 'EUR';
db.updatedAt ??= null;
db.flightDataSource = 'Amadeus Flight Offers Search; round-trip offers by candidate trip and destination gateway';
db.dateRange = { start: '2027-02-01', end: '2027-02-28' };
db.departureDays = ['Friday evening', 'Saturday', 'Sunday'];
db.destinations = destinations;
db.tripSelection = { minimumNights: 1, maximumNights: 27, returnDay: 'any day through February 28' };

for (const [name, member] of Object.entries(participants)) {
  db.participants[name] ??= { homeAirport: member.homeAirport, availabilityByDate: {}, trips: {} };
  const person = db.participants[name];
  person.homeAirport = member.homeAirport;
  delete person.origin;
  delete person.dates;
  person.availabilityByDate = Object.fromEntries(februaryDates.map((date) => [date, availabilityForDay(member.availability, date)]));
  person.trips ??= {};
  const candidateKeys = new Set(candidateTrips.map((trip) => trip.key));
  for (const oldKey of Object.keys(person.trips)) if (!candidateKeys.has(oldKey)) delete person.trips[oldKey];
  for (const trip of candidateTrips) {
    const record = person.trips[trip.key] ??= {
      ...trip,
      availability: availabilityForTrip(member.availability, trip.startDate, trip.endDate),
      flights: {},
      accommodation: {},
      auxiliary: { resortTransferPerPersonEur: null, skiPassPerPersonEur: null, equipmentRentalPerPersonEur: null, totalPerPersonEur: null },
    };
    Object.assign(record, trip, { availability: availabilityForTrip(member.availability, trip.startDate, trip.endDate) });
    record.accommodation = {
      perPersonEur: accommodationForTrip(trip.startDate, trip.nights),
      groupSize: 7,
      modeledFrom: 'February weekly accommodation estimate shown on the page, prorated by trip nights',
    };
    record.flights ??= {};
    for (const destination of destinationList) {
      record.flights[destination.label] ??= { averageEur: null, bestEur: null, offersCount: 0, airportCode: destination.airportCode, sampledAt: null };
    }
  }
}

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  await writeDatabase();
  console.log(`Seeded ${candidateTrips.length} February weekend-start trip options; Amadeus credentials are not configured, so live fares remain pending.`);
  process.exit(0);
}

const apiBase = process.env.AMADEUS_API_BASE || 'https://api.amadeus.com';
const tokenResponse = await fetch(`${apiBase}/v1/security/oauth2/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.AMADEUS_CLIENT_ID, client_secret: process.env.AMADEUS_CLIENT_SECRET }),
});
if (!tokenResponse.ok) throw new Error(`Amadeus token request failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
const { access_token: token } = await tokenResponse.json();

const today = new Date();
const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
const byKey = new Map(candidateTrips.map((trip) => [trip.key, trip]));
const futureTrips = [...new Set(Object.values(db.participants).flatMap((person) => Object.keys(person.trips)))].map((key) => byKey.get(key))
  .filter((trip) => trip && dateAtUtc(trip.endDate) >= todayUtc)
  .sort((a, b) => b.holidayDays - a.holidayDays || a.weekdaysOff - b.weekdaysOff || a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
const unsampled = futureTrips.filter((trip) => Object.values(db.participants).some((person) =>
  Object.values(person.trips[trip.key].flights).some((flight) => flight.sampledAt == null)));
const tripsToRefresh = unsampled.slice(0, 4);
let requestCount = 0;
for (const trip of tripsToRefresh) {
  for (const [name, member] of Object.entries(participants)) {
    for (const destination of destinationList) {
      const flight = db.participants[name].trips[trip.key].flights[destination.label];
      if (flight.sampledAt) continue;
      const query = new URLSearchParams({
        originLocationCode: member.homeAirport.code,
        destinationLocationCode: destination.airportCode,
        departureDate: trip.startDate,
        returnDate: trip.endDate,
        adults: '1', currencyCode: 'EUR', max: '20',
      });
      requestCount += 1;
      if (requestCount > 150) throw new Error('Search budget exceeded; refusing to make more than 150 flight calls in one run.');
      const response = await fetch(`${apiBase}/v2/shopping/flight-offers?${query}`, { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok) {
        console.warn(`${name} ${trip.key} ${destination.airportCode}: Amadeus returned ${response.status}; preserving previous data.`);
        continue;
      }
      const result = await response.json();
      const prices = (result.data || []).map((offer) => Number(offer.price?.grandTotal)).filter(Number.isFinite);
      flight.sampledAt = new Date().toISOString();
      if (prices.length) {
        flight.averageEur = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
        flight.bestEur = Math.round(Math.min(...prices));
        flight.offersCount = prices.length;
      }
    }
  }
}
db.updatedAt = new Date().toISOString();
await writeDatabase();
console.log(`Updated ${tripsToRefresh.length} trip options with at most ${requestCount} searches.`);

async function writeDatabase() {
  const orderedParticipants = Object.fromEntries(Object.entries(db.participants).map(([name, person]) => [name, {
    homeAirport: person.homeAirport,
    availabilityByDate: person.availabilityByDate,
    trips: person.trips,
  }]));
  const orderedDatabase = {
    schemaVersion: db.schemaVersion,
    currency: db.currency,
    dateRange: db.dateRange,
    departureDays: db.departureDays,
    tripSelection: db.tripSelection,
    destinations: db.destinations,
    updatedAt: db.updatedAt,
    flightDataSource: db.flightDataSource,
    participants: orderedParticipants,
  };
  await writeFile(databasePath, `${JSON.stringify(orderedDatabase, null, 2)}\n`);
}
