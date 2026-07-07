# pdf-merger

Merge PDF files entirely in your browser — drop them in, drag to reorder, click Merge, and your combined `merged.pdf` downloads. **Nothing is uploaded: your files never leave the page.** Handy for stitching together sensitive documents (payroll slips, bank statements) without trusting a server.

Live at **https://pdf-merger.lepaux.com**.

## How it works

- Drop PDFs onto the page (or click to pick them).
- Drag the rows to set the merge order.
- Click **Merge** — the combined PDF downloads automatically.
- Owner-password-only PDFs (openable without a password) are decrypted automatically. Files locked with a real user password, and corrupt files, are skipped with an inline warning; the rest still merge.

All processing runs client-side via [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib). There is no backend and no network request after the page loads.

## Development

```sh
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run typecheck
npm run build    # static export to out/
npm run preview  # serve the built out/ locally
```

Requires Node >= 18.18. Stack: Next.js (App Router, static export), React, Tailwind CSS v4 + DaisyUI, dnd-kit.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static export and deploys it to GitHub Pages.

One-time setup (outside this repo):
- Repo **Settings → Pages → Source: GitHub Actions**.
- DNS: add a `CNAME` record `pdf-merger` → `<your-gh-user>.github.io`.
- The `public/CNAME` file binds the custom domain; GitHub auto-issues the HTTPS certificate.
