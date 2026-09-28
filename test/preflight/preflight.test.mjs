/*
 * Tests for the custom Preflight engine.
 *
 * Run: npm run test:preflight
 *
 * These cover the parts where a regression would be silent and damaging:
 * document parsing (both authored block shapes), template resolution, the check
 * implementations, Source API URL construction, and the --all tree walker.
 *
 * The engine is browser code, so DOMParser is polyfilled the same way cli.mjs
 * does it. Network access is stubbed - no test touches a real DA instance.
 *
 * Modules are loaded through load() rather than top-level await so the file also
 * runs under toolchains that transpile ESM to CommonJS.
 */

import { DOMParser } from 'linkedom';
import { assert, test } from './harness.mjs';

globalThis.DOMParser = DOMParser;

let mods;
async function load() {
  if (mods) return mods;
  const rulesMod = await import('../../tools/preflight/rules.js');
  const checksMod = await import('../../tools/preflight/checks.js');
  mods = {
    rules: rulesMod.default,
    NO_TEMPLATE: rulesMod.NO_TEMPLATE,
    runChecks: checksMod.default,
    parseDoc: checksMod.parseDoc,
    getTemplate: checksMod.getTemplate,
    getBlocks: checksMod.getBlocks,
    getMetadata: checksMod.getMetadata,
    toClassName: checksMod.toClassName,
    sourceUrl: checksMod.sourceUrl,
  };
  return mods;
}

const META = (tpl) => (tpl
  ? `<table><tr><th>Metadata</th></tr><tr><td>template</td><td>${tpl}</td></tr></table>`
  : '');
const EMBED_TABLE = '<table><tr><th>Embed</th></tr>'
  + '<tr><td><a href="https://youtu.be/x">v</a></td></tr></table>';
const page = (inner) => `<body><main><div>${inner}</div></main></body>`;
const META_DIV = '<div class="metadata"><div><div>template</div><div>t</div></div></div>';
const SECTION_META = '<table><tr><th>Section Metadata</th></tr>'
  + '<tr><td>style</td><td>dark</td></tr></table>';

async function evaluate(html) {
  const {
    rules, runChecks, parseDoc, getTemplate,
  } = await load();
  const doc = parseDoc(html);
  const template = getTemplate(doc);
  const applicable = [...(rules['*'] || []), ...(rules[template] || [])];
  return { doc, template, results: runChecks(doc, applicable) };
}

/* ------------------------------------------------------------------ */
test('toClassName normalises authored names', async () => {
  const { toClassName } = await load();
  assert.equal(toClassName('Embed'), 'embed');
  assert.equal(toClassName('Video Page'), 'video-page');
  assert.equal(toClassName('Embed (Auto Play)'), 'embed-auto-play');
  assert.equal(toClassName(undefined), '');
});

test('template is read from the Metadata block and normalised', async () => {
  const { parseDoc, getTemplate } = await load();
  assert.equal(getTemplate(parseDoc(page(META('video-page')))), 'video-page');
  assert.equal(getTemplate(parseDoc(page(META('Video Page')))), 'video-page');
});

test('a page with no Metadata block reports NO_TEMPLATE', async () => {
  const { parseDoc, getTemplate, NO_TEMPLATE } = await load();
  assert.equal(getTemplate(parseDoc(page('<h1>Plain</h1>'))), NO_TEMPLATE);
});

test('metadata rows are readable as a lowercase-keyed map', async () => {
  const { parseDoc, getMetadata } = await load();
  const doc = parseDoc(page('<table><tr><th>Metadata</th></tr>'
    + '<tr><td>template</td><td>video-page</td></tr>'
    + '<tr><td>Title</td><td>Hello</td></tr></table>'));
  const meta = getMetadata(doc);
  assert.equal(meta.template, 'video-page');
  assert.equal(meta.title, 'Hello');
});

/* ------------------------------------------------------------------ */
test('blocks are detected in authored table form', async () => {
  const { parseDoc, getBlocks } = await load();
  assert.deepEqual(getBlocks(parseDoc(page(EMBED_TABLE))).map((b) => b.name), ['embed']);
});

test('blocks are detected in normalised div form, with variants', async () => {
  const { parseDoc, getBlocks } = await load();
  const doc = parseDoc(page('<div class="embed full-bleed"><div><div>x</div></div></div>'));
  const [block] = getBlocks(doc);
  assert.equal(block.name, 'embed');
  assert.deepEqual(block.variants, ['full-bleed']);
});

test('variants are parsed from an authored label', async () => {
  const { parseDoc, getBlocks } = await load();
  const label = '<table><tr><th>Embed (autoplay, dark)</th></tr><tr><td>x</td></tr></table>';
  const doc = parseDoc(page(label));
  const [block] = getBlocks(doc);
  assert.equal(block.name, 'embed');
  assert.deepEqual(block.variants, ['autoplay', 'dark']);
});

test('metadata blocks are never counted as content blocks', async () => {
  // Regression guard: a "| Metadata |" table once parsed as a block named
  // "metadata", which let a rule match page configuration.
  const { parseDoc, getBlocks } = await load();
  assert.deepEqual(
    getBlocks(parseDoc(page(`${EMBED_TABLE}${META('video-page')}`))).map((b) => b.name),
    ['embed'],
  );
  assert.deepEqual(
    getBlocks(parseDoc(page(META_DIV))),
    [],
  );
  assert.deepEqual(
    getBlocks(parseDoc(page(SECTION_META))),
    [],
  );
});

/* ------------------------------------------------------------------ */
test('block-present passes when the block is there', async () => {
  const { results } = await evaluate(page(`${EMBED_TABLE}${META('video-page')}`));
  assert.equal(results.length, 1);
  assert.equal(results[0].passed, true);
  assert.match(results[0].detail, /Found 1 "embed"/);
});

test('block-present fails, as an error, when the block is missing', async () => {
  const { results } = await evaluate(page(META('video-page')));
  assert.equal(results[0].passed, false);
  assert.equal(results[0].severity, 'error');
  assert.match(results[0].detail, /No "embed" block found/);
});

test('block-present honours max', async () => {
  const { results } = await evaluate(page(`${EMBED_TABLE}${EMBED_TABLE}${META('campaign-page')}`));
  assert.equal(results[0].passed, false);
  assert.match(results[0].detail, /at most 1/);
});

test('block-absent fails, as a warning, when the block is present', async () => {
  const { results } = await evaluate(page(`${EMBED_TABLE}${META('print-page')}`));
  assert.equal(results[0].passed, false);
  assert.equal(results[0].severity, 'warning');
});

test('block-absent passes when the block is gone', async () => {
  const { results } = await evaluate(page(META('print-page')));
  assert.equal(results[0].passed, true);
});

test('a template with no rules runs no checks', async () => {
  const { NO_TEMPLATE } = await load();
  const { template, results } = await evaluate(page('<h1>Plain</h1>'));
  assert.equal(template, NO_TEMPLATE);
  assert.equal(results.length, 0);
});

test('variant-scoped rules only match that variant', async () => {
  const { parseDoc, runChecks } = await load();
  const rule = {
    type: 'block-present', name: 'embed', variants: ['autoplay'], severity: 'error', title: 'v',
  };
  const plain = parseDoc(page('<div class="embed"><div><div>x</div></div></div>'));
  assert.equal(runChecks(plain, [rule])[0].passed, false);

  const variant = parseDoc(page('<div class="embed autoplay"><div><div>x</div></div></div>'));
  assert.equal(runChecks(variant, [rule])[0].passed, true);
});

test('an unknown check type is reported, not thrown', async () => {
  const { parseDoc, runChecks } = await load();
  const [result] = runChecks(parseDoc(page('<h1>x</h1>')), [{ type: 'no-such-check', title: 'x' }]);
  assert.equal(result.severity, 'info');
  assert.equal(result.passed, true);
});

/* ------------------------------------------------------------------ */
test('Source API URLs are built from the DA context', async () => {
  const { sourceUrl } = await load();
  const base = 'https://admin.da.live/source';
  // Prepare menu context: site + repo both set, path site-relative, no extension
  assert.equal(sourceUrl({
    org: 'o', site: 's', repo: 's', path: '/drafts/x',
  }), `${base}/o/s/drafts/x.html`);
  // Library SDK context: repo only
  assert.equal(sourceUrl({ org: 'o', repo: 's', path: '/i' }), `${base}/o/s/i.html`);
  // Already suffixed, root, empty, no leading slash
  assert.equal(sourceUrl({ org: 'o', site: 's', path: '/x.html' }), `${base}/o/s/x.html`);
  assert.equal(sourceUrl({ org: 'o', site: 's', path: '/' }), `${base}/o/s/index.html`);
  assert.equal(sourceUrl({ org: 'o', site: 's', path: '' }), `${base}/o/s/index.html`);
  assert.equal(sourceUrl({ org: 'o', site: 's', path: 'a/b/c' }), `${base}/o/s/a/b/c.html`);
});

/* ------------------------------------------------------------------ */
test('the CLI tree walker flattens a site to html paths', async () => {
  const { listPages } = await import('../../tools/preflight/cli.mjs');

  const TREE = {
    '': [
      { name: 'index', ext: 'html', path: '/o/s/index.html' },
      { name: 'drafts' },
      { name: '.da' },
      { name: 'hero.png', ext: 'png', path: '/o/s/hero.png' },
    ],
    '/drafts': [
      { name: 'launch', ext: 'html', path: '/o/s/drafts/launch.html' },
      { name: 'deep' },
    ],
    '/drafts/deep': [
      { name: 'page', ext: 'html', path: '/o/s/drafts/deep/page.html' },
    ],
  };

  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const m = String(url).match(/\/list\/[^/]+\/[^/]+(.*)$/);
    const key = m ? m[1] : '';
    if (!(key in TREE)) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => TREE[key] };
  };

  try {
    const pages = await listPages({ org: 'o', site: 's', token: 't' });
    assert.deepEqual(
      pages.sort(),
      ['/drafts/deep/page', '/drafts/launch', '/index'],
      'html pages only, recursed, hidden dirs and media skipped',
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('the CLI normalises page paths', async () => {
  const { normalisePath } = await import('../../tools/preflight/cli.mjs');
  assert.equal(normalisePath('/index'), '/index');
  assert.equal(normalisePath('index'), '/index');
  assert.equal(normalisePath('/drafts/x.html'), '/drafts/x');
});
