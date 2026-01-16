export default function decorate(block) {
  // Columns Image Top block - adds specific classes for card-style layout
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    row.classList.add('columns-imagetop-card');
    const cols = row.querySelectorAll(':scope > div');
    cols.forEach((col) => {
      // Find image and wrap it
      const img = col.querySelector('picture');
      if (img) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'columns-imagetop-image';
        img.parentElement.insertBefore(imageWrapper, img);
        imageWrapper.appendChild(img);
      }
      // Wrap remaining content
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'columns-imagetop-content';
      const children = [...col.children].filter((child) => !child.classList.contains('columns-imagetop-image'));
      children.forEach((child) => contentWrapper.appendChild(child));
      col.appendChild(contentWrapper);
    });
  });
}
