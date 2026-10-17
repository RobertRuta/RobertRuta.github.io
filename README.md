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

The ski trip page reads `public/ski-holiday-2026/prices.json`, keyed by participant and candidate trip (`startDate__endDate`). Price candidates are limited to February 1–28, 2027, start on Friday, Saturday or Sunday, and can return on any later February date. Each record includes holiday length, estimated weekdays off, an availability estimate, accommodation per candidate area, auxiliary cost fields, and flight average/best EUR fares by destination. The page shows one combined table after the visitor selects one or more location tiles; the complete per-person database is downloadable from the page as JSON.

The `Refresh ski trip flight prices` workflow runs weekly and can also be started manually. To enable live searches, add the repository Actions secrets `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET`. It refreshes up to four upcoming February trip windows, prioritizing longer holidays with fewer weekdays off, and searches each member's home airport against five candidate location gateways, with a hard limit of 150 searches per run. Amadeus provides a limited free monthly request quota; check the current quota in its developer console. The workflow itself runs on a GitHub-hosted runner. Without credentials, it seeds the committed February availability/accommodation data and leaves flight prices pending.

City/country home locations without a specific airport use proxies (Kuala Lumpur for Malaysia, Madrid for Spain, Warsaw for Poland). The five destination gateways are TBS (Gudauri), GYD (Shahdag), VCE (Dolomites), GVA (Tarentaise), and INN (Tyrol). This is the full current candidate set on the page, not a worldwide search of every holiday destination. Auxiliary costs remain pending until a resort is selected.
