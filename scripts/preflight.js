/*
 * Template checks for Experience Governance. Reuse the DA Prepare plugin's
 * rules and engine without importing its SDK, authentication, or report UI.
 */
import { getTemplate, runChecks } from '../tools/preflight/checks.js';
import { rulesFor } from '../tools/preflight/rules.js';

const registeredHooks = new WeakSet();

/** Run template checks against the current rendered page on every invocation. */
export function preflight(doc = document) {
  const template = getTemplate(doc);
  const rules = rulesFor(template);
  return runChecks(doc, rules, { rendered: true }).map((result, index) => {
    // Warnings still fail the check; alignment has no separate warning state.
    let alignment = result.passed ? 'YES' : 'NO';
    if (result.skipped) alignment = 'NA';
    return {
      id: rules[index].id || `template-${template}-${rules[index].type}-${rules[index].name || 'check'}-${index + 1}`,
      title: result.title,
      alignment,
      reasoning: [result.description, result.detail].filter(Boolean).join(' '),
      ...(!result.passed && result.hint ? { suggestions: result.hint } : {}),
    };
  });
}

/** Append our checks to any existing hook without duplicating registration. */
export default function registerPreflightChecks() {
  window.aem = window.aem || {};
  const previous = window.aem.preflight;
  if (registeredHooks.has(previous)) return;

  window.aem.preflight = function combinedPreflight(...args) {
    const existing = typeof previous === 'function' ? previous.apply(this, args) : previous;
    const appendChecks = (checks) => [...(checks || []), ...preflight()];
    // Preserve synchronous arrays, but also compose hooks that return a Promise.
    return typeof existing?.then === 'function'
      ? Promise.resolve(existing).then(appendChecks)
      : appendChecks(existing);
  };
  registeredHooks.add(window.aem.preflight);
}
