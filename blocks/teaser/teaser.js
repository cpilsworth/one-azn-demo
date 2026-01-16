/**
 * Decorates a teaser block
 * Structure (EDS table rows as direct children):
 * - Row 0: Image
 * - Row 1: Brand slot (optional)
 * - Row 2: Title
 * - Row 3: Description
 * - Row 4: Button
 * - For blocked variant: adds overlay with login prompt
 * @param {HTMLElement} block The teaser block element
 */
export default function decorate(block) {
  const isBlocked = block.classList.contains('blocked');

  // Get all direct child divs (EDS table rows)
  let rows = Array.from(block.querySelectorAll(':scope > div'));
  if (rows.length === 0) return;

  // Check if first row is a wrapper containing nested divs (common in AEM EDS)
  // If so, use the nested divs as rows instead
  if (rows.length === 1 && rows[0].querySelector(':scope > div')) {
    rows = Array.from(rows[0].querySelectorAll(':scope > div'));
  }

  if (rows.length === 0) return;

  // Create a grid container to hold image and content side by side
  const gridContainer = document.createElement('div');
  gridContainer.classList.add('teaser-grid');

  // Process image (first row)
  const imageRow = rows[0];
  imageRow.classList.add('teaser-image');
  gridContainer.appendChild(imageRow);

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('teaser-content');

  // Process remaining rows as content parts
  rows.slice(1).forEach((row, index) => {
    if (index === 0) {
      // First content row = brand slot
      row.classList.add('teaser-brand');
    } else if (index === 1) {
      // Second content row = title
      row.classList.add('teaser-title');
    } else if (index === 2) {
      // Third content row = description
      row.classList.add('teaser-description');
    } else if (index === 3) {
      // Fourth content row = button
      row.classList.add('teaser-button');
    }
    contentWrapper.appendChild(row);
  });

  // Add content wrapper to grid
  gridContainer.appendChild(contentWrapper);

  // Add grid container to block
  block.appendChild(gridContainer);

  // Add blocked overlay if this is a blocked variant
  if (isBlocked) {
    const overlay = document.createElement('div');
    overlay.classList.add('teaser-overlay');

    const overlayTitle = document.createElement('div');
    overlayTitle.classList.add('teaser-overlay-title');
    overlayTitle.textContent = 'Blocked Content';

    const overlaySubtitle = document.createElement('div');
    overlaySubtitle.classList.add('teaser-overlay-subtitle');
    overlaySubtitle.textContent = "Don't have an account? Register here";

    const overlayButton = document.createElement('button');
    overlayButton.classList.add('teaser-overlay-button');
    overlayButton.textContent = 'Login';
    overlayButton.addEventListener('click', () => {
      // Placeholder for login functionality
      // eslint-disable-next-line no-console
      console.log('Login button clicked');
    });

    overlay.appendChild(overlayTitle);
    overlay.appendChild(overlaySubtitle);
    overlay.appendChild(overlayButton);

    gridContainer.appendChild(overlay);
  }
}
