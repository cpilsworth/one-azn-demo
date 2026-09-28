#!/usr/bin/env node
/*
 * Headless preflight - runs the same template checks as the DA plugin, outside
 * the browser, so they can gate CI or sweep a whole site.
 *
 * It imports rules.js and checks.js unmodified: the only thing the browser
 * provides that Node does not is DOMParser, which is polyfilled below. Keeping
 * one engine means the CLI and the plugin can never disagree.
 *
 * Usage
 *   node tools/preflight/cli.mjs [options] [paths...]
 *
 *   --org <org>      DA org   (default: $DA_ORG)
 *   --site <site>    DA site  (default: $DA_SITE, else the GitHub repo name)
 *   --token <token>  IMS token for the DA Source API (default: $DA_TOKEN)
 *   --all            Check every .html page in the site (walks the Source API)
 *   --json           Emit machine-readable JSON instead of a text report
 *   --quiet          Only report pages that fail
 *   --strict         Treat warnings as blocking too
 *
 * Paths are site-relative, with or without a leading slash or .html suffix:
 *   node tools/preflight/cli.mjs /index drafts/launch
 *
 * Exit codes
 *   0  no blocking failures
 *   1  at least one blocking failure  (errors; +warnings under --strict)
 *   2  could not run (bad auth, unreadable page, no paths)
 *
 * Examples
 *   DA_TOKEN=... node tools/preflight/cli.mjs --all --quiet
 *   DA_TOKEN=... node tools/preflight/cli.mjs --json /index > report.json
 */

import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DA_ADMIN = 'https://admin.da.live';

/* ---------------------------------------------------------------- *
 * DOMParser polyfill. checks.js needs only querySelector(All),
 * textContent, children and classList, all of which linkedom covers.
 * ---------------------------------------------------------------- */
async function installDomParser() {
  if (globalThis.DOMParser) return;
  try {
    const { DOMParser } = await import('linkedom');
    globalThis.DOMParser = DOMParser;
  } catch {
    throw new Error(
      'Missing DOM implementation. Install the dev dependency first:\n'
      + '  npm install --save-dev linkedom',
    );
  }
}

/* ---------------------------------------------------------------- *
 * Args
 * ---------------------------------------------------------------- */
function parseArgs(argv) {
  const opts = {
    paths: [], all: false, json: false, quiet: false, strict: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--quiet') opts.quiet = true;
    else if (arg === '--strict') opts.strict = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--org') { i += 1; opts.org = argv[i]; }
    else if (arg === '--site') { i += 1; opts.site = argv[i]; }
    else if (arg === '--token') { i += 1; opts.token = argv[i]; }
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else opts.paths.push(arg);
  }
  return opts;
}

/*
 * Deliberately NOT derived from fstab.yaml.
 *
 * fstab's mountpoint is the DA org the site *reads content from*, which for a
 * site built off a shared template is the upstream template org - not the org
 * the pages are authored in. Defaulting to it sends every request to the wrong
 * org (401s at best, someone else's content at worst), so org must be explicit.
 *
 * The site name is safe to guess from the repo folder, which matches the DA
 * site name by EDS convention.
 */
function defaultSite() {
  try {
    const pkgDir = join(HERE, '..', '..');
    return { site: basename(pkgDir) };
  } catch { /* optional */ }
  return {};
}

/* ---------------------------------------------------------------- *
 * DA Source API
 * ---------------------------------------------------------------- */
const normalisePath = (p) => `/${String(p || '')
  .replace(/^\/+/, '')
  .replace(/\.html$/, '')}`;

async function daFetch(url, token) {
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return resp;
}

async function fetchSource({ org, site, token }, path) {
  const clean = normalisePath(path).slice(1) || 'index';
  const resp = await daFetch(`${DA_ADMIN}/source/${org}/${site}/${clean}.html`, token);
  if (!resp.ok) {
    const why = resp.status === 404 ? 'not found' : `HTTP ${resp.status}`;
    throw new Error(`could not read /${clean}.html (${why})`);
  }
  return resp.text();
}

/** Walk the Source API listing to find every .html page in the site. */
async function listPages({ org, site, token }, prefix = '') {
  const resp = await daFetch(`${DA_ADMIN}/list/${org}/${site}${prefix}`, token);
  if (!resp.ok) throw new Error(`could not list ${prefix || '/'} (HTTP ${resp.status})`);
  const entries = await resp.json();
  const pages = [];
  for (const entry of Array.isArray(entries) ? entries : []) {
    const name = entry.name ?? '';
    const entryPath = entry.path ?? `${prefix}/${name}`;
    if (entry.ext === 'html') {
      pages.push(entryPath.replace(/^\/[^/]+\/[^/]+/, '').replace(/\.html$/, ''));
    } else if (!entry.ext && name && !name.startsWith('.')) {
      // Directory - recurse. Sequential on purpose: keeps the API load gentle.
      // eslint-disable-next-line no-await-in-loop
      pages.push(...await listPages({ org, site, token }, `${prefix}/${name}`));
    }
  }
  return pages;
}

/* ---------------------------------------------------------------- *
 * Reporting
 * ---------------------------------------------------------------- */
const BADGE = {
  error: 'ERROR', warning: 'WARN', info: 'INFO', pass: 'PASS',
};

function printReport(report, opts) {
  const { path, template, results, error } = report;
  if (error) {
    process.stderr.write(`FAIL  ${path}\n        ${error}\n`);
    return;
  }
  const failed = results.filter((r) => !r.passed);
  if (opts.quiet && !failed.length) return;

  const head = failed.length ? 'FAIL' : 'OK  ';
  process.stdout.write(`${head}  ${path}  [template: ${template}]  ${results.length} check(s)\n`);
  results.forEach((r) => {
    if (opts.quiet && r.passed) return;
    const badge = r.passed ? BADGE.pass : (BADGE[r.severity] || r.severity.toUpperCase());
    process.stdout.write(`        ${badge.padEnd(5)}  ${r.title} - ${r.detail}\n`);
    if (!r.passed && r.hint) process.stdout.write(`               hint: ${r.hint}\n`);
  });
}

/* ---------------------------------------------------------------- *
 * Main
 * ---------------------------------------------------------------- */
async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    const usage = readFileSync(fileURLToPath(import.meta.url), 'utf8')
      .split('\n')
      .filter((l) => l.startsWith(' *'))
      .map((l) => l.replace(/^ \* ?/, ''))
      .join('\n');
    process.stdout.write(`${usage}\n`);
    return 0;
  }

  await installDomParser();

  // Import the engine only after the polyfill is in place.
  const { default: rules } = await import('./rules.js');
  const checks = await import('./checks.js');
  const runChecks = checks.default;

  const fallback = defaultSite();
  const ctx = {
    org: opts.org || process.env.DA_ORG,
    site: opts.site || process.env.DA_SITE || fallback.site,
    token: opts.token || process.env.DA_TOKEN,
  };

  if (!ctx.org) {
    process.stderr.write(
      'No DA org. Pass --org or set DA_ORG.\n'
      + 'Note this is the org the pages are AUTHORED in, which may differ from\n'
      + 'the mountpoint in fstab.yaml if this site is built off a shared template.\n',
    );
    return 2;
  }
  if (!ctx.site) {
    process.stderr.write('No DA site. Pass --site or set DA_SITE.\n');
    return 2;
  }
  if (!ctx.token) {
    process.stderr.write('No DA token. Pass --token or set DA_TOKEN.\n');
    return 2;
  }

  let { paths } = opts;
  if (opts.all) {
    try {
      paths = await listPages(ctx);
    } catch (e) {
      process.stderr.write(`${e.message}\n`);
      return 2;
    }
  }
  if (!paths.length) {
    process.stderr.write('No paths given. Pass page paths or --all.\n');
    return 2;
  }

  const reports = [];
  for (const path of paths) {
    const normalised = normalisePath(path);
    try {
      // Sequential by design - a site sweep should not hammer the Source API.
      // eslint-disable-next-line no-await-in-loop
      const html = await fetchSource(ctx, normalised);
      const doc = checks.parseDoc(html);
      const template = checks.getTemplate(doc);
      const applicable = [...(rules['*'] || []), ...(rules[template] || [])];
      const results = runChecks(doc, applicable);
      reports.push({
        path: normalised,
        template,
        blocks: [...new Set(checks.getBlocks(doc).map((b) => b.name))].sort(),
        results: results.map((r) => ({
          severity: r.severity,
          passed: r.passed,
          title: r.title,
          detail: r.detail,
          hint: r.hint,
        })),
      });
    } catch (e) {
      reports.push({ path: normalised, error: e.message, results: [] });
    }
  }

  const isBlocking = (r) => !r.passed
    && (r.severity === 'error' || (opts.strict && r.severity === 'warning'));
  const blocking = reports.filter((rep) => rep.error || rep.results.some(isBlocking));

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({
      org: ctx.org,
      site: ctx.site,
      pages: reports.length,
      blocking: blocking.length,
      status: blocking.length ? 'fail' : 'pass',
      reports,
    }, null, 2)}\n`);
  } else {
    reports.forEach((rep) => printReport(rep, opts));
    process.stdout.write(`\n${reports.length} page(s), ${blocking.length} blocking\n`);
  }

  return blocking.length ? 1 : 0;
}

/* Exported for tests; the CLI only self-runs when invoked directly. */
export {
  listPages, normalisePath, parseArgs, main,
};

const invokedDirectly = process.argv[1]
  && fileURLToPath(import.meta.url) === process.argv[1];

if (invokedDirectly) {
  main()
    .then((code) => { process.exitCode = code; })
    .catch((e) => {
      process.stderr.write(`${e.message}\n`);
      process.exitCode = 2;
    });
}
