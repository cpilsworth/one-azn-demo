# Columns Block Template

## Description

Two-column layout for displaying image alongside text content. Ideal for feature highlights, product showcases, or side-by-side content presentation.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Two-Column Teaser
**Variants:** default (image-left), image-right

## Structure

Two-column layout with:
- Column 1: Image
- Column 2: Title, description, and CTA button

Layout can be reversed (image-right variant).

## Markdown Syntax

### Image Left (Default)

```markdown
| Columns |  |
|---------|------|
| ![Feature Image](./images/feature.jpg) | ### Teaser Title |
|  | Cras mattis iudicium purus sit amet fermentum. Petierunt uti sibi concilium totius Galliae in diem certam indicere. |
|  | [Button](#) |
```

### Image Right Variant

```markdown
| Columns |  |
|---------|------|
| ### Teaser Title | ![Feature Image](./images/feature.jpg) |
| Description text for the feature. |  |
| [Button](#) |  |
```

### Multi-row Format (Preferred)

```markdown
| Columns |  |
|---------|------|
| ![Image](./images/teaser.jpg) | ### Teaser Title |
| | Lorem ipsum dolor sit amet, consectetur adipiscing elit. |
| | [Button](#) |
```

## Content Guidelines

- **Title:** 2-5 words
- **Description:** 1-3 sentences, 20-40 words
- **Images:** Recommended 600x400px or similar landscape ratio
- **Button:** Clear call-to-action text

## CSS Tokens Used

```css
--columns-gap
--columns-padding
--columns-title-font-family
--columns-title-font-size
--columns-title-color
--columns-text-color
--columns-button-background
--columns-button-text
```

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (900px+) | Two columns side-by-side |
| Tablet (600-899px) | Two columns, reduced gap |
| Mobile (<600px) | Single column, stacked |

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.columns` | Image on left, content on right |
| Image Right | Content first, image second in table |

## Example Output

Columns render as a balanced two-column layout that stacks vertically on mobile devices.
