/*
 * Accordion Section Block
 * Custom accordion variant styled after One-AZ Figma design (Accordion Section)
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Create wrapper for max-width constraint
  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-section-wrapper';

  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-item';
    details.append(summary, body);
    wrapper.append(details);
  });

  block.textContent = '';
  block.append(wrapper);
}
