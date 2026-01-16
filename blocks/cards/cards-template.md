# Cards Block Template

## Description

Grid of cards displaying content with images, titles, descriptions, and call-to-action buttons. Used for therapeutic areas, services, features, or any repeating content items.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Therapeutic Area Cards
**Node ID:** 3970:58662
**Variants:** default, therapeutic

## Structure

Each card contains:
- Image (square aspect ratio for therapeutic variant)
- Title (h3)
- Description paragraph
- Button/CTA link

## Markdown Syntax

### Therapeutic Variant (3 cards)

```markdown
| Cards (therapeutic) |
|---------------------|
| ![Card Image](./images/therapeutic-card.jpg) |
| ### Teaser Title |
| Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et aliqua. |
| [Button](#) |
```

Repeat the row pattern for each card:

```markdown
| Cards (therapeutic) |
|---------------------|
| ![Card 1](./images/card1.jpg) |
| ### Card Title 1 |
| Description text for card 1. |
| [Learn More](#) |
| ![Card 2](./images/card2.jpg) |
| ### Card Title 2 |
| Description text for card 2. |
| [Learn More](#) |
| ![Card 3](./images/card3.jpg) |
| ### Card Title 3 |
| Description text for card 3. |
| [Learn More](#) |
```

### Default Cards (2 columns)

```markdown
| Cards |  |
|-------|-------|
| ![Image 1](./images/card1.jpg) | **Card Title 1**<br>Card description text. |
| ![Image 2](./images/card2.jpg) | **Card Title 2**<br>Card description text. |
```

## Content Guidelines

- **Title:** 2-5 words, concise and descriptive
- **Description:** 1-2 sentences, 15-25 words
- **Images:**
  - Therapeutic variant: Square (1:1 aspect ratio), recommended 400x400px
  - Default variant: 4:3 aspect ratio, recommended 400x300px
- **Number of cards:** 3-6 cards work best for therapeutic variant

## CSS Tokens Used

```css
/* Therapeutic Variant Tokens */
--cards-therapeutic-background-color
--cards-therapeutic-card-background
--cards-therapeutic-title-font-family
--cards-therapeutic-title-font-size
--cards-therapeutic-title-color
--cards-therapeutic-desc-font-family
--cards-therapeutic-desc-font-size
--cards-therapeutic-text-color
--cards-therapeutic-button-background
--cards-therapeutic-button-text
--cards-therapeutic-card-gap
--cards-therapeutic-card-padding-x
--cards-therapeutic-card-padding-y
--cards-therapeutic-card-border-radius
--cards-therapeutic-container-gap
```

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.cards` | Standard card grid with 4:3 images |
| Therapeutic | `.cards.therapeutic` | Square images, enhanced styling, AstraZeneca branding |

## Container Styling

For therapeutic variant, the container gets special styling:

```markdown
---
Section Metadata
Style: therapeutic-container
---
```

## Example Output

Cards render as a responsive grid that adjusts from 1 column on mobile to 3 columns on desktop for therapeutic variant.
