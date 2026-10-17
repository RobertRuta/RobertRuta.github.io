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

The `Refresh ski trip flight prices` workflow runs weekly and can also be started manually. To enable live searches, add the repository Actions secrets `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET`. It refreshes up to four upcoming February trip windows, prioritizing longer holidays with fewer weekdays off, and searches each member's home airport against the five gateways already listed in the JSON database, with a hard limit of 150 searches per run. Amadeus provides a limited free monthly request quota; check the current quota in its developer console. The workflow runs on a GitHub-hosted runner and updates the same committed JSON database read by the page. Without credentials, existing database values are preserved and flight fares remain pending.

City/country home locations without a specific airport use proxies (Kuala Lumpur for Malaysia, Madrid for Spain, Warsaw for Poland). The five destination gateways are TBS (Gudauri), GYD (Shahdag), VCE (Dolomites), GVA (Tarentaise), and INN (Tyrol). This is the full current candidate set on the page, not a worldwide search of every holiday destination. Auxiliary costs remain pending until a resort is selected.
