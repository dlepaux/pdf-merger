# Contributing

Thanks for your interest in contributing! pdf-merger is a small, fully
client-side web app — no backend, no build secrets — so it's quick to get
running locally.

## Getting started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feat/my-feature`
4. Make your changes

## Development

Requires Node >= 18.18.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest
npm run typecheck  # tsc --noEmit
npm run build      # static export to out/
npm run preview    # serve the built out/ locally
```

`npm test`, `npm run typecheck`, and `npm run build` must all pass before you
open a PR. CI runs them on every push, but local-green saves a round trip.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
— releases are cut automatically by semantic-release from your commit history:

- `feat:` — new feature (minor release)
- `fix:` — bug fix (patch release)
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
- `chore:` / `ci:` — maintenance (no release)

A `BREAKING CHANGE:` footer in the commit body triggers a major release.

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Add or update tests for behaviour changes (see the existing `*.test.ts(x)`)
- Include a clear description of what changed and why
- Ensure CI passes before requesting review

## Reporting issues

File issues via the [issue forms](https://github.com/dlepaux/pdf-merger/issues/new/choose).
Blank issues are disabled — pick the closest template and fill in what you can.

For security vulnerabilities, **do not** open a public issue. See
[security.md](security.md) for the private disclosure process.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](license.md).
