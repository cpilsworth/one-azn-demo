# Hero Block Template

## Description

Full-width hero banner with background image, heading, and description text. Used for page headers and prominent section introductions.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Hero Banner
**Variants:** default, dark, no-image

## Structure

The hero block creates a full-width banner with:
- Background image (full bleed)
- Headline text (h1-h6)
- Description paragraph
- Optional gradient overlay for text readability

## Markdown Syntax

### Default Hero (with background image)

```markdown
| Hero |
|------|
| ![Hero Background](./images/hero-background.png) |
| Welcome to MyAstrazeneca |
| Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et aliqua. |
```

### Dark Variant

```markdown
| Hero (dark) |
|-------------|
| ![Dark Background](./images/dark-bg.jpg) |
| Teaser Title |
| Lorem ipsum dolor sit amet, consectetur adipiscing elit. |
| [Button](#) |
```

### No Image Variant

When no image is provided, the block automatically applies the `no-image` class with a fallback background color.

```markdown
| Hero |
|------|
| Page Title |
| Description text for the hero section. |
```

## Content Guidelines

- **Headline:** Keep to 3-7 words for maximum impact
- **Description:** 1-2 sentences, 15-30 words
- **Background Image:** Recommended size: 1920x600px minimum
- **Image format:** JPG for photos, PNG for graphics with transparency

## CSS Tokens Used

```css
--hero-background-color
--hero-heading-font-family
--hero-heading-font-size
--hero-heading-color
--hero-body-font-family
--hero-body-font-size
--hero-description-color
--hero-min-height
--hero-padding-x
--hero-padding-y
```

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.hero` | Standard hero with image overlay |
| Dark | `.hero.dark` | Dark theme with light text |
| No Image | `.hero.no-image` | Fallback when no image provided |

## Example Output

The hero renders as a full-width section with the background image behind centered text content.
