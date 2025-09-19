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
