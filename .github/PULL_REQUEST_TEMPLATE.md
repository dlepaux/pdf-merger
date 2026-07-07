<!--
Thanks for the PR. A few quick checks help me get this merged faster:

- Conventional Commits — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
  `chore:`, `ci:`, `perf:`. Scopes welcome (`fix(merge): ...`).
- Quality gate — `npm test`, `npm run typecheck`, `npm run build`. CI runs
  these on push, but local-green saves a round trip.
- See contributing.md for the longer version.
-->

## What changes

<!-- One or two sentences. What does this PR do? -->

## Why

<!-- The motivation. What problem does it solve, what use case does it enable? -->

## How tested

<!-- New tests added? Manual browser verification steps? -->

## Breaking change?

<!-- semantic-release uses the conventional-commit footer (`BREAKING CHANGE: ...`)
     to bump the major version, so include it in the commit body if applicable. -->

- [ ] No
- [ ] Yes (describe migration above)

## Checklist

- [ ] Tests added or updated
- [ ] readme.md updated if behaviour or surface changed
- [ ] Stays fully client-side (no upload / no server)
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
