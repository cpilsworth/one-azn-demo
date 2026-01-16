# Carousel Block Template

## Description

Interactive slideshow component for displaying multiple content slides with navigation controls. Each slide contains an image and content section with brand, title, description, and button.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Carousel/Slideshow
**Variants:** default, blocked (individual slides)

## Structure

Carousel contains:
- Multiple slides (each as a table row)
- Each slide has:
  - Image (left column)
  - Content (right column): brand, title, description, button
- Navigation: Previous/Next buttons + dot indicators
- Smooth scroll animation between slides

## Markdown Syntax

### Basic Carousel (3 slides)

```markdown
| Carousel |  |
|----------|------|
| ![Slide 1](./images/slide1.jpg) | **AstraZeneca**<br>#### Teaser Title<br>Cras mattis iudicium purus sit amet fermentum. Petierunt uti sibi concilium totius Galliae in diem certam indicere.<br>[Button](#) |
| ![Slide 2](./images/slide2.jpg) | **AstraZeneca**<br>#### Teaser Title<br>Etiam habebis sem dicantur magna mollis euismod.<br>[Button](#) |
| ![Slide 3](./images/slide3.jpg) | **AstraZeneca**<br>#### Teaser Title<br>Nihil hic munitissimus habendi senatus locus, nihil horum.<br>[Button](#) |
```

### Carousel with Blocked Slide

```markdown
| Carousel |  |
|----------|------|
| blocked | |
| ![Blocked Slide](./images/blocked.jpg) | **AstraZeneca**<br>#### Premium Content<br>This content requires login to view.<br>[Login](#) |
| ![Slide 2](./images/slide2.jpg) | **AstraZeneca**<br>#### Free Content<br>Description text.<br>[Button](#) |
```

### Multi-line Format (Alternative)

```markdown
| Carousel |  |
|----------|------|
| ![Slide 1](./images/slide1.jpg) | **AstraZeneca** |
| | #### Slide Title 1 |
| | Description for slide 1. |
| | [Learn More](#) |
| ![Slide 2](./images/slide2.jpg) | **AstraZeneca** |
| | #### Slide Title 2 |
| | Description for slide 2. |
| | [Learn More](#) |
```

### Carousel with Image Left

```markdown
| Carousel (image-left) |  |
|----------|------|
| ![Slide 1](./images/slide1.jpg) | **Teaser Title**<br>Cras mattis iudicium purus sit amet fermentum. Petierunt uti sibi concilium totius Galliae in diem certam indicere.<br>[Button](#) |
| ![Slide 2](./images/slide2.jpg) | **Teaser Title 2**<br>Etiam habebis sem dicantur magna mollis euismod. Morbi fringilla convallis sapien.<br>[Button](#) |
| ![Slide 3](./images/slide3.jpg) | **Teaser Title 3**<br>Cum sociis natoque penatibus et magnis dis parturient montes.<br>[Button](#) |
```

### Carousel Hero (Centre Aligned)

```markdown
| Carousel (hero) |  |
|----------|------|
| ![Hero 1](./images/hero1.jpg) | **Teaser Title**<br>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et aliqua.<br>[Button](#) |
| ![Hero 2](./images/hero2.jpg) | **Teaser Title 2**<br>Etiam habebis sem dicantur magna mollis euismod.<br>[Button](#) |
| ![Hero 3](./images/hero3.jpg) | **Teaser Title 3**<br>Cum sociis natoque penatibus et magnis dis parturient.<br>[Button](#) |
```

### Carousel Image Only (16:9 Ratio)

```markdown
| Carousel (image-only) |  |
|----------|------|
| ![Image 1](./images/image1.jpg) |  |
| ![Image 2](./images/image2.jpg) |  |
| ![Image 3](./images/image3.jpg) |  |
```

## Content Guidelines

- **Number of slides:** 2-5 slides recommended
- **Brand:** Company or category name
- **Title:** 2-5 words per slide
- **Description:** 1-2 sentences, 15-30 words
- **Images:** Consistent size across slides, recommended 800x450px
- **Button:** Clear call-to-action

## CSS Tokens Used

```css
--carousel-background-color
--carousel-slide-gap
--carousel-content-padding
--carousel-brand-font-size
--carousel-brand-color
--carousel-title-font-family
--carousel-title-font-size
--carousel-title-color
--carousel-desc-font-size
--carousel-desc-color
--carousel-button-background
--carousel-button-text
--carousel-nav-button-size
--carousel-indicator-size
--carousel-indicator-active-color
```

## JavaScript Features

The carousel JavaScript provides:
1. Smooth scroll between slides
2. Previous/Next navigation buttons
3. Dot indicator navigation
4. Intersection Observer for active slide detection
5. Keyboard accessibility (tabindex management)
6. ARIA attributes for screen readers
7. Blocked slide overlay support

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.carousel` | Standard carousel with navigation, image right |
| Image Left | `.carousel.image-left` | Carousel with image positioned on the left |
| Hero | `.carousel.hero` | Hero-style carousel with centre-aligned content |
| Image Only | `.carousel.image-only` | Image carousel without text content (16:9 ratio) |
| Blocked Slide | `.blocked` (on row) | Individual slide shows login overlay |

## Accessibility

- `role="region"` on carousel container
- `aria-roledescription="Carousel"`
- `aria-hidden` on inactive slides
- `aria-label` on navigation buttons
- Keyboard navigation support

## Example Output

Carousel renders as a full-width slideshow with smooth horizontal scrolling and bottom dot navigation.
