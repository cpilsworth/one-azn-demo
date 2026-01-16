# Introduction Block Template

## Description

Section introduction with a prominent title and body text. Used for introducing page sections, providing context, or displaying key messaging.

## Figma Source

**Design URL:** Figma MyAstrazeneca Design
**Component:** Introduction Section
**Node ID:** 3970:58659

## Structure

Simple two-part structure:
- Title (h2 styled with display font)
- Body text (paragraph with standard text styling)

## Markdown Syntax

### Basic Introduction

```markdown
| Introduction |
|--------------|
| ## Introduction |
| Quis aute iure reprehenderit in voluptate velit esse. Quo usque tandem abutere, Catilina, patientia nostra? A communi observantia non est recedendum. Plura mihi bona sunt, inclinet, amari petere vellent. |
```

### Alternative with H3 Title

```markdown
| Introduction |
|--------------|
| ### Section Title |
| Body text describing the section content. This can span multiple sentences to provide comprehensive context for the following content. |
```

## Content Guidelines

- **Title:** 1-3 words, typically "Introduction" or section name
- **Body text:** 2-4 sentences, 40-80 words
- **Alignment:** Left-aligned by default
- **Max width:** Content constrained to 1180px for readability

## CSS Tokens Used

```css
--introduction-background-color
--introduction-title-font-family
--introduction-title-font-size
--introduction-title-font-weight
--introduction-title-color
--introduction-title-line-height
--introduction-body-font-family
--introduction-body-font-size
--introduction-body-line-height
--introduction-text-color
--introduction-padding-x
--introduction-padding-y
--introduction-max-width
```

## Typography Specs

| Element | Desktop | Mobile |
|---------|---------|--------|
| Title | 56px / Lexia | 46px / Lexia |
| Body | 16px / Inter | 16px / Inter |

## Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Default | `.introduction` | Standard introduction with left-aligned text |

## Example Output

The introduction renders as a centered section with large title and readable body text, providing context for the content that follows.
