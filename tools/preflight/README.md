# Custom Preflight (DA Prepare menu)

A template-aware replacement for DA's built-in Preflight check. It reads the
document under edit, works out which **template** the page declares, and runs
only the checks configured for that template.

Out of the box it enforces that an **Embed block** is present on the templates
that need one.

## How menu registration works

DA merges Prepare menu entries by `title`, in the order:

```
built-in  →  org config  →  site config      (later wins)
```

The `title` therefore decides whether this plugin sits **beside** Adobe's
Preflight or **replaces** it:

| title in config    | Result                                                        |
| ------------------ | ------------------------------------------------------------- |
| `Template checks`  | Runs alongside; Adobe's Preflight stays (**current setup**)   |
| `Preflight`        | Shadows and replaces Adobe's Preflight entirely               |

Running alongside is the default choice here: Adobe's References / Content / SEO
checks keep working and keep improving, and template rules are additive. There is
no supported way to inject a check *into* Adobe's report — its categories are
hardcoded in DA's own bundle — so a single merged report would mean forking all
of the built-in checks.

## Install

Add a `prepare` tab to the DA site config
(<https://da.live/config#/cpilsworth/one-azn-demo/>) containing:

| title           | path                                                                    | experience       |
| --------------- | ----------------------------------------------------------------------- | ---------------- |
| Template checks | `https://main--one-azn-demo--cpilsworth.aem.live/tools/preflight.html`  | fullsize-dialog  |

The author then sees **Prepare → Preflight** (Adobe's) and
**Prepare → Template checks** (this plugin) as separate entries.

Notes:

- Rename the row to `Preflight` to replace Adobe's plugin instead of
  supplementing it.
- `experience` is optional. `fullsize-dialog` gives the report room to breathe;
  omit it for DA's smaller default dialog.
- To trial it on a branch first, add a `ref` column (e.g. `uat`) and open DA with
  `?ref=uat`. `ref=local` points DA at `http://localhost:3000` for development.
- The org in the config URL is the **DA org of the site you are authoring in**
  (`cpilsworth`). Note `fstab.yaml` mounts content from a *different* DA org
  (`polizzigaetano/one-azn-demo`) — that is the upstream template source, not
  where this plugin gets configured. The plugin itself is org-agnostic: it reads
  `org`/`site` from the context DA posts at runtime, so the same code works in
  whichever DA org loads it.

## Configuring checks

All rules live in [`rules.js`](./rules.js), keyed by template name. Adding a
check is a config edit — no plumbing changes:

```js
const rules = {
  '*': [],                       // runs on every page
  'video-page': [
    {
      type: 'block-present',     // block must appear
      name: 'embed',
      min: 1,
      severity: 'error',         // 'error' | 'warning' | 'info'
      title: 'Embed block required',
      description: 'A "video-page" must contain at least one Embed block.',
      hint: 'Add an Embed block and give it the video URL.',
    },
  ],
};
```

Rules for a page are the `'*'` entries plus the entries for its template. A
template with no entry runs only the `'*'` checks.

### Check types

| type            | options                          | passes when                          |
| --------------- | -------------------------------- | ------------------------------------ |
| `block-present` | `name`, `min` (1), `max`, `variants` | count is within `min`..`max`      |
| `block-absent`  | `name`, `variants`               | the block does not appear            |

`variants` matches EDS block variants, so `{ name: 'embed', variants: ['autoplay'] }`
only counts `Embed (autoplay)`.

Only unpassed **`error`** results are reported as blocking; warnings and info are
advisory.

## Rendered-page extension

The site also registers `window.aem.preflight()` from
[`/scripts/preflight.js`](../../scripts/preflight.js). Experience Governance can
call this hook to run the same global and template-specific rules on the current
page, without the DA SDK or a source API request. Registration preserves any
existing preflight checks and appends the template results to their array. It
supports both synchronous and asynchronous hooks, and registering again does
not duplicate the custom checks.

The hook reads `<meta name="template" content="…">` (falling back to an authored
Metadata block) and counts EDS `data-block-name` markers inside `main`. Wrappers,
block-internal markup, headers, and footers are not counted. It re-evaluates the
DOM on every call, including after DA preview updates.

Results have `{ id, title, alignment, reasoning, suggestions }`, where alignment
is `YES` for passing checks, `NO` for failures (including advisory warnings), and
`NA` for unsupported check types. Suggestions are included for failures with a
configured hint. Pages without applicable rules add no template results, leaving
any existing checks intact.

To inspect the results in the browser console:

```js
await window.aem.preflight();
```

Browser regression tests are in `/test/preflight.html`. Serve the repository
with a static server (for example `python3 -m http.server 8765`) and open
`http://localhost:8765/test/preflight.html` to run them. Test files are excluded
from EDS delivery by `.hlxignore`.

## How the template is resolved

From the `template` row of the page's **Metadata** block — the same value EDS
turns into a `<body>` class via `decorateTemplateAndTheme()`. Names are
normalised (`Video Page` → `video-page`), and a page with no template reports
`(none)`.

## Block detection

Both authored shapes are recognised, so checks work whichever way the source is
stored:

- a table whose first cell is the block name (`| Embed |`)
- a normalised `div` carrying the name as a class (`<div class="embed">`)

The `metadata` and `section-metadata` blocks are never counted as content blocks.

## Running the checks as an HTTP API

`preflight-rules.json` in this folder is the machine-readable copy of
[`rules.js`](./rules.js), published so the hosted API can read it:

    https://main--one-azn-demo--cpilsworth.aem.live/tools/preflight/preflight-rules.json

The API service lives in
[cpilsworth/da-preflight-checks](https://github.com/cpilsworth/da-preflight-checks)
and takes the org and site in its path, so it serves any repo:

    GET  https://<worker>/cpilsworth/one-azn-demo/index
    POST https://<worker>/cpilsworth/one-azn-demo   { "paths": ["/a", "/b"] }
    GET  https://<worker>/cpilsworth/one-azn-demo/_rules

That is the route to use from Workfront Fusion or any other automation - it
returns a top-level `status` of `pass`/`fail` to branch on.

> Keep `rules.js` and `preflight-rules.json` in step. The plugin reads the
> `.js`; the API reads the `.json`. They are separate files because a browser
> plugin wants an ES module and a remote service must never import remote code.

## Running the checks headlessly (CLI / CI)

The same checks run outside the browser, so they can gate a build or sweep the
whole site. The CLI imports `rules.js` and `checks.js` **unmodified** — one
engine, so the CLI and the plugin can never disagree.

`linkedom` is a **dev**-only dependency that supplies `DOMParser` in Node; the
browser plugin has no dependencies at all. It was added to `package.json` but
not to `package-lock.json`, so run `npm install` once (not `npm ci`) to record
it before using the CLI or the tests — both exit with instructions if it is
missing.

```sh
npm install                                   # records linkedom in the lockfile

# one page
DA_TOKEN=... npm run preflight -- --org <org> /index

# whole site, failures only
DA_TOKEN=... npm run preflight -- --org <org> --all --quiet

# machine-readable
DA_TOKEN=... npm run preflight -- --org <org> --json /index > report.json
```

`--help` lists every option. Exit codes make it usable as a gate: **0** clean,
**1** blocking failure, **2** could not run (bad auth, unreadable page). Add
`--strict` to count warnings as blocking.

`--org` is required and is the org the pages are **authored** in — deliberately
not read from `fstab.yaml`, whose mountpoint may be an upstream template org.

The token needs DA read access. Note `--all` additionally needs permission on the
Source **list** endpoint, which some tokens that can read `/source` still lack.

### CI example

```yaml
- run: npm ci
- run: npm run preflight -- --org <org> --all --quiet
  env:
    DA_TOKEN: ${{ secrets.DA_TOKEN }}
```

> **Do this first:** run `npm install` locally once and commit the updated
> `package-lock.json`. `linkedom` was added to `package.json` without a lockfile
> entry (the environment it was authored in had no registry access), and `npm ci`
> fails whenever the two disagree — which means the repo's existing `Build`
> workflow will fail at its `npm ci` step until the lockfile is regenerated,
> whether or not anything calls the CLI.

## Tests

```sh
npm run test:preflight
```

19 tests covering document parsing (both authored shapes), template resolution,
every check type, Source API URL construction, and the `--all` tree walker.
Network calls are stubbed, so no test touches a real DA instance.

## Files

| file            | role                                                       |
| --------------- | ---------------------------------------------------------- |
| `../preflight.html` | Plugin entry point; the URL used in the config.        |
| `preflight.js`  | DA SDK wiring, document fetch, rendering.                  |
| `checks.js`     | Document parsing (template, blocks), check implementations, Source API URLs. Browser-API free apart from `DOMParser`. |
| `rules.js`      | **The rules — edit this to add checks.**                   |
| `cli.mjs`       | Headless runner for CI and site sweeps.                    |
| `preflight.css` | Styles.                                                    |

Tests live in [`test/preflight/`](../../test/preflight/), which `.hlxignore`
keeps out of the published site.

## Local development

The plugin is a DA micro-frontend, so it needs DA's `postMessage` handshake to
receive its context and token. Run `aem up` and register the plugin with a
`ref` of `local`, then open the document in DA.

Opened directly in a browser it will simply sit on "Running preflight checks…",
since no context ever arrives — that is expected.
