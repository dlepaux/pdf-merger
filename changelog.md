# 1.0.0 (2026-07-07)


### Bug Fixes

* **a11y:** keyboard-operable DropZone; defer blob URL revoke; clear stale skip warnings ([7ab214b](https://github.com/dlepaux/pdf-merger/commit/7ab214b0f18903dcf2c498ae8ae2ff30c6dd8f85))
* decrypt owner-password-only PDFs instead of skipping them ([62975d3](https://github.com/dlepaux/pdf-merger/commit/62975d3ef473cdf59264926c39b10065770c0c8a))
* MergeButton surfaces merge failure and all-skipped cases to the user ([c60043f](https://github.com/dlepaux/pdf-merger/commit/c60043f1859cf1e38540e3dca36a97af8665acb8))
* **security:** re-ignore leftover inbox/ and dist/ personal-doc dirs ([6cb3cfa](https://github.com/dlepaux/pdf-merger/commit/6cb3cfa378f7884632dd4ee246c43ddf8da12686))


### Features

* add PdfItem type and format/reorder/skip-reason/download helpers ([effe58e](https://github.com/dlepaux/pdf-merger/commit/effe58e0022f21e01fa3941b7b1a78328820bbef))
* **analytics:** cookieless GA4 page views, gated on NEXT_PUBLIC_GA_ID ([681df6a](https://github.com/dlepaux/pdf-merger/commit/681df6aa3fbd142b0857edde7c2215b2c44bb964))
* browser-side PDF merge core (bytes in, bytes out) ([36aa414](https://github.com/dlepaux/pdf-merger/commit/36aa414e3b197f818029427eda29438ca04bc9cf))
* compose the merge app in the page ([90e22da](https://github.com/dlepaux/pdf-merger/commit/90e22daaa0ec02b090c1cca5e2ac1432753c30a4))
* DropZone — read dropped/picked PDFs into items ([8878b76](https://github.com/dlepaux/pdf-merger/commit/8878b7658b3f0dec4dceb95ec61c777f1952b71e))
* **logs:** smoother console output ([e6522df](https://github.com/dlepaux/pdf-merger/commit/e6522dfb9d90921b7a65885b5e74d76976778c0d))
* MergeButton — merge in-browser and auto-download ([ee34140](https://github.com/dlepaux/pdf-merger/commit/ee3414044450637adee7c8236c3dd894e87828c0))
* SkippedList — inline warnings for skipped files ([9d010dd](https://github.com/dlepaux/pdf-merger/commit/9d010dd8910923bc7ad0553eec32eec92e7568ed))
* sortable FileList with drag-reorder and remove ([6cb7931](https://github.com/dlepaux/pdf-merger/commit/6cb7931c048867a657d72b5abd7ab7d4b3507a51))
* watch-folder PDF merge service (inbox/ -> dist/merged.pdf) ([c6a1df6](https://github.com/dlepaux/pdf-merger/commit/c6a1df6c2c183d74a88c87bfc885e477ab74de77))

# Changelog

Maintained automatically by [semantic-release](https://github.com/semantic-release/semantic-release) from [Conventional Commit](https://www.conventionalcommits.org/) messages — each release appends its notes above.
