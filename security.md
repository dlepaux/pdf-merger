# Security policy

pdf-merger is a fully client-side static web app: your PDFs are read, merged,
and downloaded entirely in the browser, and the app makes no network requests
after the page loads. There is no server, no account, and no data leaves the
page. That design removes most of the usual attack surface — but the client
code and its dependencies still matter.

## Reporting a vulnerability

If you believe you've found a security issue, please report it privately.
**Do not** open a public GitHub issue.

Two channels, in order of preference:

1. **GitHub Security Advisories** — open a draft advisory on this repo:
   <https://github.com/dlepaux/pdf-merger/security/advisories/new>. This keeps
   the report private until a fix is coordinated and ships you a CVE if one is
   warranted.
2. **Email** — `d.lepaux@gmail.com`. Use a subject prefix like
   `[security][pdf-merger]` so it doesn't drown in the inbox.

## What to expect

- **Acknowledgment within 72 hours.** If you don't hear back, please re-send —
  a missed mail is more likely than a deliberate ignore.
- **Coordinated disclosure.** No public disclosure until a fix is available;
  once it ships, the advisory is published and (if you consent) you're credited.

## In scope

- The client-side application code (the merge engine, file handling, and UI).
- Anything that could break the "your files never leave the browser" guarantee
  — e.g. an unexpected network request, or data leaking out of the page.
- The dependency supply chain and the deployed static artifact on GitHub Pages.

## Out of scope

- Vulnerabilities in your own browser or operating system.
- Bugs in a source PDF's own content or encryption (pdf-merger only reads and
  concatenates pages; it does not vouch for the safety of arbitrary PDFs).
- Denial of service from feeding the app extremely large or malformed files —
  processing happens locally in your own tab.
