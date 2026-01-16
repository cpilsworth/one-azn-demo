# Teaser Block Template

## Description

Promotional teaser component with image, brand label, title, description, and call-to-action button. Used for featured content, product highlights, or promotional sections.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Teaser Block
**Variants:** default (image-left), image-right, blocked

## Structure

Teaser contains:
- Featured image (large, prominent)
- Brand label (optional, e.g., "AstraZeneca")
- Title (h4)
- Description paragraph
- CTA button

## Markdown Syntax

### Default Teaser (Image Left)

```markdown
| Teaser |
|--------|
| ![Teaser Image](./images/teaser.jpg) |
|  |
| #### Teaser Title |
| Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. |
| [Button](#) |
```

### Teaser with Brand Label

```markdown
| Teaser |
|--------|
| ![Teaser Image](./images/teaser.jpg) |
| AstraZeneca |
| #### Teaser Title |
| Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. |
| [Button](#) |
```

### Image Right Variant

```markdown
| Teaser (image-right) |
|----------------------|
| ![Teaser Image](./images/teaser.jpg) |
| AstraZeneca |
| #### Teaser Title |
| Description text for the teaser component. |
| [Button](#) |
```

### Blocked Variant (Login Required)

```markdown
| Teaser (blocked) |
|------------------|
| ![Teaser Image](./images/teaser.jpg) |
| AstraZeneca |
| #### Blocked Content Title |
| This content requires authentication to view. |
| [Login](#) |
```

## Content Guidelines

- **Brand Label:** Company name or category (optional)
- **Title:** 2-6 words, compelling and descriptive
- **Description:** 2-4 sentences, 30-60 words
- **Images:** Recommended 800x500px or similar
- **Button:** Clear action (Learn More, Read More, etc.)

## CSS Tokens Used

```css
--teaser-background-color
--teaser-image-width
--teaser-content-padding
--teaser-brand-font-size
--teaser-brand-color
--teaser-title-font-family
--teaser-title-font-size
--teaser-title-color
--teaser-desc-font-size
--teaser-desc-color
--teaser-button-background
--teaser-button-text
--teaser-button-border-radius
```

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.teaser` | Image left, content right |
| Image Right | `.teaser.image-right` | Content left, image right |
| Blocked | `.teaser.blocked` | Shows login overlay |

## JavaScript Decoration

The teaser block JavaScript:
1. Identifies image and content sections
2. Applies semantic class names
3. Creates blocked overlay for authenticated content

## Example Output

Teaser renders as a horizontal card with large image and content side-by-side. On mobile, it stacks vertically.
