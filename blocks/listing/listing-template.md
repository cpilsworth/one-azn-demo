# Listing Block Template

## Description

Vertical list component displaying content items with images, titles, descriptions, and optional action buttons. Used for saved content, bookmarks, search results, or any repeated list items with dividers.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Section: Listing
**Node ID:** 3970:58630
**Variants:** default

## Structure

Each listing item contains:
- Image (left, 343x194px)
- Content (right): title (h3), description, optional button
- Divider between items

## Markdown Syntax

### Basic Listing (Single Item)

```markdown
| Listing |
|---------|
| ![Item Image](./images/listing-image.png) |
| ### Listing item here |
| Cras mattis iudicium purus sit amet fermentum at nos amice. |
| [Save](#) |
```

### Multiple Items

```markdown
| Listing |
|---------|
| ![Item 1](./images/listing-image.png) |
| ### Listing item here |
| Cras mattis iudicium purus sit amet fermentum at nos amice. |
| [Save](#) |
| ![Item 2](./images/listing-image.png) |
| ### Listing item here |
| Cras mattis iudicium purus sit amet fermentum at nos amice. |
| [Save](#) |
| ![Item 3](./images/listing-image.png) |
| ### Listing item here |
| Cras mattis iudicium purus sit amet fermentum at nos amice. |
| [Save](#) |
```

## Content Guidelines

- **Title:** 2-5 words, descriptive
- **Description:** 1-2 sentences, 15-25 words
- **Images:** 343x194px recommended, consistent across items
- **Number of items:** Any number, typically 5-20 items per page

## CSS Tokens Used

```css
--listing-max-width
--listing-padding-x
--listing-padding-y
--listing-background-color
--listing-card-gap
--listing-card-padding
--listing-image-width
--listing-image-height
--listing-image-border-radius
--listing-title-font-family
--listing-title-font-size
--listing-title-font-weight
--listing-title-line-height
--listing-title-color
--listing-desc-font-family
--listing-desc-font-size
--listing-desc-line-height
--listing-desc-color
--listing-button-color
--listing-divider-color
--listing-divider-height
```

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.listing` | Vertical list with dividers |

## JavaScript Decoration

The listing block JavaScript:
1. Converts rows to `<ul>` / `<li>` structure
2. Identifies image and content sections
3. Applies semantic class names
4. Optimizes images for delivery

## Example Output

Listing renders as a vertical stack of items with horizontal layout (image left, content right) and divider lines between items. On mobile, it stacks vertically.
