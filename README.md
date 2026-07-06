# pdf-merger

Watch-folder PDF merge service. Drop PDFs into `inbox/`, get one combined `dist/merged.pdf`. The service re-merges automatically on every add, change, or delete.

## Usage

```sh
npm install
npm start
```

Then drop `.pdf` files into `inbox/`. About a second after the last file settles, `dist/merged.pdf` is (re)written.

## Behavior

- **Order**: files merge in lexicographic filename order. Prefix to control it: `01-cover.pdf`, `02-report.pdf`, `03-annex.pdf`.
- **Full re-merge**: every pass merges the *current* content of `inbox/`. Deleting a file from `inbox/` removes its pages on the next pass.
- **Encrypted PDFs**: owner-password-only files (openable without a password — typical for payroll slips and bank statements) are decrypted automatically via the empty user password. Files locked with a real user password are skipped with a warning.
- **Corrupt files**: skipped with a warning in the log; the rest still merge.
- **Half-copied files**: the watcher waits until a file's size is stable (~400 ms) before merging, so large copies don't produce broken output.
- **Empty inbox**: nothing is written; the previous `dist/merged.pdf` is kept.
- **Atomic output**: `merged.pdf` is written to a temp file and renamed, so it is never observable half-written.
- **Known limitation**: embedded raster images inside *encrypted* PDFs can come out with wrong colors in rare cases ([upstream issue](https://github.com/cantoo-scribe/pdf-lib/issues/69)) — eyeball the output once if an encrypted source is image-heavy.

## Configuration

Environment variables (no `.env` loading — plain process env):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PDF_MERGER_INBOX` | `inbox` | Folder watched for PDFs |
| `PDF_MERGER_DIST` | `dist` | Folder receiving `merged.pdf` |

## Development

Requires Node >= 22.18 (runs TypeScript directly via native type stripping — no build step).

```sh
npm test           # node --test
npm run typecheck  # tsc --noEmit
```
