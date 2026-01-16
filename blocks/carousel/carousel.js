import { fetchPlaceholders } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  // Check if row has 'blocked' class and transfer it to slide
  if (row.classList.contains('blocked')) {
    slide.classList.add('blocked');
  }

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // Add blocked overlay if slide has 'blocked' class
  if (slide.classList.contains('blocked')) {
    const overlay = document.createElement('div');
    overlay.classList.add('carousel-overlay');

    const overlayTitle = document.createElement('div');
    overlayTitle.classList.add('carousel-overlay-title');
    overlayTitle.textContent = 'Blocked Content';

    const overlaySubtitle = document.createElement('div');
    overlaySubtitle.classList.add('carousel-overlay-subtitle');
    overlaySubtitle.textContent = "Don't have an account? Register here";

    const overlayButton = document.createElement('button');
    overlayButton.classList.add('carousel-overlay-button');
    overlayButton.textContent = 'Login';
    overlayButton.addEventListener('click', () => {
      // Placeholder for login functionality
      // eslint-disable-next-line no-console
      console.log('Login button clicked from carousel');
    });

    overlay.appendChild(overlayTitle);
    overlay.appendChild(overlaySubtitle);
    overlay.appendChild(overlayButton);

    slide.appendChild(overlay);
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');

  // Pre-process rows to handle 'blocked' markers
  rows.forEach((row, index) => {
    const firstCell = row.querySelector(':scope > div:first-child');
    const secondCell = row.querySelector(':scope > div:nth-child(2)');

    // Check if this row is a 'blocked' marker (first cell contains only 'blocked' text)
    if (firstCell && firstCell.textContent.trim().toLowerCase() === 'blocked'
        && secondCell && secondCell.textContent.trim() === '') {
      // Mark this row as a marker
      row.classList.add('blocked-marker');

      // Apply 'blocked' class to the next row
      const nextRow = rows[index + 1];
      if (nextRow) {
        nextRow.classList.add('blocked');
      }
    }
  });

  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    // Create navigation buttons OUTSIDE the container
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    // Append buttons to block (outside container) instead of inside container
    block.append(slideNavButtons);
  }

  let slideIndex = 0;
  rows.forEach((row) => {
    // Skip blocked-marker rows (they shouldn't become slides)
    if (row.classList.contains('blocked-marker')) {
      row.remove();
      return;
    }

    const slide = createSlide(row, slideIndex, carouselId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = slideIndex;
      const totalSlides = Array.from(rows).filter((r) => !r.classList.contains('blocked-marker')).length;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${slideIndex + 1} ${placeholders.of || 'of'} ${totalSlides}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
    slideIndex += 1;
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
