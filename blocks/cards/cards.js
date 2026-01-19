import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DESCRIPTION_CHAR_LIMIT = 112;

/**
 * Truncates description text in card body to character limit
 * @param {Element} cardBody The cards-card-body element
 */
function truncateDescription(cardBody) {
  const p = cardBody.querySelector('p');
  if (!p) return;

  // Find text nodes that are the description (not inside strong or a)
  const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null, false);
  let node;
  let descriptionText = '';
  const textNodes = [];

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    // Skip text inside strong (title) or a (CTA)
    if (parent.tagName === 'STRONG' || parent.tagName === 'A') continue;
    // Skip empty or whitespace-only nodes
    const trimmed = node.textContent.trim();
    if (trimmed) {
      descriptionText += trimmed + ' ';
      textNodes.push(node);
    }
  }

  descriptionText = descriptionText.trim();

  // Truncate if exceeds limit
  if (descriptionText.length > DESCRIPTION_CHAR_LIMIT) {
    const truncated = descriptionText.substring(0, DESCRIPTION_CHAR_LIMIT).trim() + '...';

    // Clear existing text nodes and set truncated text on first one
    textNodes.forEach((textNode, index) => {
      if (index === 0) {
        textNode.textContent = ` ${truncated} `;
      } else {
        textNode.textContent = '';
      }
    });
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Truncate description text in therapeutic variant cards
  if (block.classList.contains('therapeutic')) {
    ul.querySelectorAll('.cards-card-body').forEach(truncateDescription);
  }

  block.textContent = '';
  block.append(ul);
}
