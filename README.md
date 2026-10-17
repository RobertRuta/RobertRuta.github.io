# RobertRuta.github.io

Terminal-themed personal site powered by Next.js static export.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deployment (GitHub Pages)

This repository is configured to deploy automatically on pushes to `main` using GitHub Actions.

Requirements:
- In repository Settings → Pages, set Source to "GitHub Actions".
- Ensure the default branch is `main` or `master`.

The workflow builds with `next build` (configured with `output: 'export'`) and publishes the `out/` directory to Pages.

## Ski holiday prices

`public/ski-holiday-2026/prices.json` is the canonical ski-trip database and the only source used by the page for participants, availability, locations, trip dates and prices. Candidate trips are limited to February 1–28, 2027, start on Friday, Saturday or Sunday, and can return on any later February date. `weekdaysOff` counts Monday–Friday calendar dates from departure through return, inclusive. The page starts with all locations selected and shows a timeline or a paginated combined cost table; the complete database is downloadable from the page as JSON. The static HTML contains only the view layout and filtering logic.

The `Refresh ski trip flight prices` workflow runs weekly and can also be started manually. The JavaScript updater in `scripts/update-ski-prices.mjs` reads and writes the canonical JSON database. Amadeus' self-service developer portal was decommissioned, so this uses the Aviasales Data API through Travelpayouts instead. Create a Travelpayouts account, obtain the API token from the profile, and add it to repository Actions secrets as `AVIASALES_API_TOKEN`; then manually run the workflow. Each run makes one monthly round-trip cache query per participant origin and destination gateway (35 routes), matching returned records to the February trip dates already in the database. The updater computes average and best prices from the observations returned for each exact itinerary. Aviasales serves cached prices from recent user searches, not live bookable inventory; a route/date with no recent searches remains blank, and averages are over observed results rather than the whole market. Cached data is retained in the committed JSON database, which is what the static page reads. Without a token, existing database values are preserved and flight fares remain pending.

The Aviasales Data API requires an access token and applies request rate limits. Travelpayouts documents that the Data API returns cached user-search results retained for seven days and recommends it for static pages. See the [API documentation](https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API) and [rate limits](https://support.travelpayouts.com/hc/en-us/articles/4402565416594-API-rate-limits). For broader live quote coverage, Duffel offers a paid-as-you-go Flights API, but its search-volume pricing makes it a separate cost decision.

City/country home locations without a specific airport use proxies (Kuala Lumpur for Malaysia, Madrid for Spain, Warsaw for Poland). The five destination gateways are TBS (Gudauri), GYD (Shahdag), VCE (Dolomites), GVA (Tarentaise), and INN (Tyrol). This is the full current candidate set on the page, not a worldwide search of every holiday destination. Auxiliary costs remain pending until a resort is selected.
