import registerPreflightChecks, { preflight } from '../scripts/preflight.js';
import {
  getBlocks, getTemplate, parseDoc, runChecks,
} from '../tools/preflight/checks.js';
import rules, { rulesFor } from '../tools/preflight/rules.js';

const results = [];

function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
  }
}

function page(template, content = '', extra = '') {
  return parseDoc(`<html><head>${template ? `<meta name="template" content="${template}">` : ''}</head>
    <body><main>${content}</main>${extra}</body></html>`);
}

function embed(variants = '') {
  return `<div class="embed ${variants} block" data-block-name="embed" data-block-status="loaded"></div>`;
}

test('Video page requires an Embed and returns a repair suggestion', () => {
  const [result] = preflight(page('Video Page'));
  assert(result.alignment === 'NO');
  assert(result.title === 'Embed block required');
  assert(result.suggestions === rules['video-page'][0].hint);
  assert(result.reasoning.includes('No "embed" block'));
});

test('Video page accepts one or more Embeds', () => {
  [embed(), embed() + embed()].forEach((content) => {
    const [result] = preflight(page('video-page', content));
    assert(result.alignment === 'YES');
    assert(!('suggestions' in result));
  });
});

test('Campaign page requires exactly one Embed', () => {
  ['', embed(), embed() + embed()].forEach((content, index) => {
    const [result] = preflight(page('campaign-page', content));
    assert(result.alignment === (index === 1 ? 'YES' : 'NO'));
  });
});

test('Print page forbids Embeds, including its advisory warning', () => {
  assert(preflight(page('print-page'))[0].alignment === 'YES');
  assert(preflight(page('print-page', embed()))[0].alignment === 'NO');
});

test('Unknown and missing templates return no checks', () => {
  assert(preflight(page('other')).length === 0);
  assert(preflight(page()).length === 0);
});

test('Rendered detection ignores wrappers, internal divs/tables, header and footer', () => {
  const content = `<div class="section embed-container"><div class="embed-wrapper">
    <div class="block embed" data-block-name="embed">
      <div class="embed"><table><tr><td>Embed</td></tr></table></div>
    </div></div></div>`;
  const doc = page('campaign-page', content, `<header>${embed()}</header><footer>${embed()}</footer>`);
  assert(getBlocks(doc, { rendered: true }).length === 1);
  assert(preflight(doc)[0].alignment === 'YES');
});

test('Rendered detection excludes configuration blocks and matches variants', () => {
  const doc = page('video-page', `${embed('autoplay dark')}
    <div data-block-name="metadata"></div><div data-block-name="section-metadata"></div>`);
  assert(getBlocks(doc, { rendered: true }).length === 1);
  const [result] = runChecks(doc, [{ type: 'block-present', name: 'embed', variants: ['AutoPlay', 'dark'] }], { rendered: true });
  assert(result.passed);
  assert(!runChecks(doc, [{ type: 'block-present', name: 'embed', variants: ['missing'] }], { rendered: true })[0].passed);
});

test('Authored DA tables and normalized divs still use the same rules', () => {
  const metadata = '<div class="metadata"><div><div>Template</div><div>Video Page</div></div></div>';
  ['<table><tr><th>Embed (autoplay)</th></tr></table>', '<div class="embed autoplay"></div>'].forEach((content) => {
    const doc = parseDoc(metadata + content);
    assert(getTemplate(doc) === 'video-page');
    assert(runChecks(doc, rulesFor(getTemplate(doc)))[0].passed);
  });
  const doc = parseDoc('<table><tr><th>Metadata</th></tr><tr><td>Template</td><td>Campaign Page</td></tr></table>');
  assert(getTemplate(doc) === 'campaign-page');
  assert(!runChecks(doc, rulesFor(getTemplate(doc)))[0].passed);
});

test('Head metadata takes precedence over authored fallback metadata', () => {
  const doc = page('print-page', '<div class="metadata"><div><div>Template</div><div>Video Page</div></div></div>');
  assert(getTemplate(doc) === 'print-page');
});

test('Global checks are resolved first and unsupported types return NA', () => {
  rules['*'].push({ type: 'future-check', id: 'global-test', title: 'Future check' });
  try {
    const output = preflight(page('video-page', embed()));
    assert(output.length === 2);
    assert(output[0].id === 'global-test');
    assert(output[0].alignment === 'NA');
    assert(output[1].alignment === 'YES');
  } finally {
    rules['*'].pop();
  }
});

test('Result IDs are stable and distinct across templates', () => {
  const { id } = preflight(page('video-page'))[0];
  assert(preflight(page('video-page', embed()))[0].id === id);
  assert(preflight(page('campaign-page'))[0].id !== id);
});

test('Registration preserves aem properties and evaluates current DOM each time', () => {
  window.aem = { existing: true };
  registerPreflightChecks();
  assert(window.aem.existing);
  const meta = document.createElement('meta');
  meta.name = 'template';
  meta.content = 'video-page';
  document.head.append(meta);
  const main = document.querySelector('main');
  assert(window.aem.preflight()[0].alignment === 'NO');
  main.innerHTML = embed();
  assert(window.aem.preflight()[0].alignment === 'YES');
  meta.content = 'print-page';
  assert(window.aem.preflight()[0].alignment === 'NO');
  meta.remove();
  main.textContent = '';
});

window.preflightTestResults = results;
document.getElementById('results').textContent = results
  .map((result) => `${result.passed ? 'PASS' : 'FAIL'}: ${result.name}${result.error ? ` — ${result.error}` : ''}`)
  .join('\n');
