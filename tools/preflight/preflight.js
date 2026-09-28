/*
 * Custom Preflight plugin for DA's Prepare menu.
 *
 * Registered by adding a row to the `prepare` tab of the DA site (or org) config,
 * pointing at this page:
 *
 *   title            | path
 *   Template checks  | https://main--one-azn-demo--cpilsworth.aem.live/tools/preflight.html
 *
 * DA merges Prepare entries by title, so the title decides the relationship to
 * Adobe's built-in Preflight: a distinct title (as above) adds this plugin
 * alongside it; titling the row "Preflight" shadows and replaces it instead.
 *
 * The plugin reads the current document's source from the DA Source API, works
 * out which template the page declares, then runs the template's checks from
 * rules.js. Adding a check is a rules.js edit - no changes needed here.
 */

import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import rules, { NO_TEMPLATE } from './rules.js';
import runChecks, { parseDoc, getTemplate, getBlocks } from './checks.js';

const DA_ADMIN = 'https://admin.da.live';
const SEVERITY_ORDER = { error: 0, warning: 1, info: 2, success: 3 };

/**
 * Build the DA Source API URL for the document under edit.
 *
 * The Prepare menu posts a context of { view, org, site, repo, ref, path } where
 * `path` is site-relative and normally carries no extension (e.g. `/drafts/foo`).
 * `site` and `repo` are the same value; `repo` is accepted for parity with the
 * Library SDK context. Folder-ish and already-suffixed paths are tolerated.
 */
export function sourceUrl({ org, site, repo, path }) {
  const owner = org;
  const project = site || repo;
  const clean = `${path || ''}`
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\.html$/, '');
  const doc = clean || 'index';
  return `${DA_ADMIN}/source/${owner}/${project}/${doc}.html`;
}

/** Fetch the saved source of the current document. */
async function fetchSource(context, token) {
  const resp = await fetch(sourceUrl(context), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const reason = resp.status === 404
      ? 'the document has not been saved yet'
      : `status ${resp.status}`;
    throw new Error(`Could not read the document source (${reason}).`);
  }
  return resp.text();
}

/** Collect the rules that apply to a template: global first, then specific. */
function rulesFor(template) {
  return [...(rules['*'] || []), ...(rules[template] || [])];
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderSummary(template, results) {
  const failures = results.filter((r) => !r.passed);
  const errors = failures.filter((r) => r.severity === 'error').length;
  const warnings = failures.filter((r) => r.severity === 'warning').length;

  const wrap = el('div', 'pf-summary');
  let state = 'success';
  if (errors) state = 'error';
  else if (warnings) state = 'warning';
  wrap.classList.add(`pf-summary-${state}`);

  let headline;
  if (!results.length) {
    headline = 'No checks configured for this template.';
  } else if (errors) {
    headline = `${errors} blocking issue${errors === 1 ? '' : 's'} found.`;
  } else if (warnings) {
    headline = `${warnings} warning${warnings === 1 ? '' : 's'} to review.`;
  } else {
    headline = 'All template checks passed.';
  }

  wrap.append(el('p', 'pf-headline', headline));

  const label = template === NO_TEMPLATE
    ? 'No template set on this page'
    : `Template: ${template}`;
  wrap.append(el('p', 'pf-template', label));

  return wrap;
}

function renderResult(result) {
  const state = result.passed ? 'success' : result.severity;
  const item = el('li', `pf-item pf-${state}`);

  const head = el('div', 'pf-item-head');
  head.append(el('span', 'pf-badge', result.passed ? 'Pass' : result.severity));
  head.append(el('span', 'pf-title', result.title));
  item.append(head);

  if (result.description) item.append(el('p', 'pf-desc', result.description));
  if (result.detail) item.append(el('p', 'pf-detail', result.detail));
  if (!result.passed && result.hint) item.append(el('p', 'pf-hint', result.hint));

  return item;
}

function renderBlocks(doc) {
  const names = [...new Set(getBlocks(doc).map((b) => b.name))].sort();
  const wrap = el('details', 'pf-blocks');
  wrap.append(el('summary', null, `Block types detected (${names.length})`));
  wrap.append(el('p', 'pf-block-list', names.length ? names.join(', ') : 'None'));
  return wrap;
}

function renderError(message) {
  const main = document.getElementById('preflight');
  main.textContent = '';
  const wrap = el('div', 'pf-summary pf-summary-error');
  wrap.append(el('p', 'pf-headline', 'Preflight could not run'));
  wrap.append(el('p', 'pf-detail', message));
  main.append(wrap);
}

export function render({
  template, results, doc, onRerun, target = 'preflight',
}) {
  const main = typeof target === 'string' ? document.getElementById(target) : target;
  main.textContent = '';

  main.append(renderSummary(template, results));

  if (results.length) {
    const sorted = [...results].sort((a, b) => {
      const aKey = a.passed ? 'success' : a.severity;
      const bKey = b.passed ? 'success' : b.severity;
      return SEVERITY_ORDER[aKey] - SEVERITY_ORDER[bKey];
    });
    const list = el('ul', 'pf-list');
    sorted.forEach((r) => list.append(renderResult(r)));
    main.append(list);
  } else {
    main.append(el('p', 'pf-empty', 'Add rules for this template in /tools/preflight/rules.js.'));
  }

  main.append(renderBlocks(doc));

  if (onRerun) {
    const actions = el('div', 'pf-actions');
    const rerun = el('sl-button', 'pf-rerun', 'Run again');
    rerun.addEventListener('click', onRerun);
    actions.append(rerun);
    main.append(actions);
  }
}

/** Resolve + run every rule for a document's template. Exported for testing. */
export function evaluate(html) {
  const doc = parseDoc(html);
  const template = getTemplate(doc);
  return { doc, template, results: runChecks(doc, rulesFor(template)) };
}

async function init() {
  const { context, token } = await DA_SDK;

  const run = async () => {
    const main = document.getElementById('preflight');
    main.textContent = '';
    main.append(el('div', 'pf-loading', 'Running preflight checks…'));

    try {
      const { doc, template, results } = evaluate(await fetchSource(context, token));
      render({ template, results, doc, onRerun: run });
    } catch (e) {
      renderError(e.message);
    }
  };

  await run();
}

// Auto-start inside DA. A test harness sets `window.DA_PREFLIGHT_NO_AUTORUN`
// beforehand to import the render/evaluate helpers without waiting on the SDK.
if (!window.DA_PREFLIGHT_NO_AUTORUN) init();
