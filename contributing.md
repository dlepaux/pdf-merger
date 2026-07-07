# Contributing

Issues and PRs welcome.

```sh
npm install
npm test
npm run typecheck
npm run build
```

All four must pass before a PR. Keep it fully client-side — no uploads, no server.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/); releases are cut automatically by semantic-release (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` → major).

Security issues: see [security.md](security.md) — not a public issue.
