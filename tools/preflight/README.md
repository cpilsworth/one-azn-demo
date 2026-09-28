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

## Files

| file            | role                                                       |
| --------------- | ---------------------------------------------------------- |
| `../preflight.html` | Plugin entry point; the URL used in the config.        |
| `preflight.js`  | DA SDK wiring, document fetch, rendering.                  |
| `checks.js`     | Document parsing (template, blocks) and check implementations. |
| `rules.js`      | **The rules — edit this to add checks.**                   |
| `preflight.css` | Styles.                                                    |

## Local development

The plugin is a DA micro-frontend, so it needs DA's `postMessage` handshake to
receive its context and token. Run `aem up` and register the plugin with a
`ref` of `local`, then open the document in DA.

Opened directly in a browser it will simply sit on "Running preflight checks…",
since no context ever arrives — that is expected.
