# pdf-merger

[![CI](https://github.com/dlepaux/pdf-merger/actions/workflows/ci.yml/badge.svg)](https://github.com/dlepaux/pdf-merger/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Merge PDFs in your browser — drop, reorder, download. Your files never leave your device.

**[pdf-merger.lepaux.com](https://pdf-merger.lepaux.com)**

## Develop

```sh
npm install
npm run dev      # http://localhost:3000
npm test
npm run build    # static export → out/
```

Next.js (static export) · React · Tailwind + DaisyUI · dnd-kit · [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib). Requires Node ≥ 18.18.

Push to `main` runs [`ci.yml`](.github/workflows/ci.yml): a quality gate (test, typecheck, build), then a [semantic-release](https://github.com/semantic-release/semantic-release) release and the GitHub Pages deploy in parallel. Set the repo variable `NEXT_PUBLIC_GA_ID` to enable cookieless page-view analytics (unset = none).

## More

[Contributing](contributing.md) · [Security](security.md) · [MIT](LICENSE) © David Lepaux
