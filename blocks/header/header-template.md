# Header Block Template

## Description

The Header block provides a responsive navigation structure with a top utility bar, main navigation with dropdown menus, and tools section. It's designed to match the AstraZeneca brand guidelines.

## Figma Source

**Design URL:** https://www.figma.com/design/zaeVL96YxqSeMWcicZPtmj/One-AZ-3.1-%E2%80%93-Market-Master?node-id=3973-34623
**Component:** Header
**Node ID:** 3973-34623

## Structure

The header consists of three main areas:

1. **Top Utility Bar** (optional): Contains utility links and language switcher
2. **Main Navigation**: Logo, navigation menu items with optional dropdowns
3. **Tools Section**: Search icon and action buttons (e.g., Login)

## Navigation File Structure (nav.md)

The header loads content from `/nav.md` (or a custom path specified in page metadata). The nav.md file should follow this structure:

```markdown
[Contact Us](#) | [AZ Employee Login](#) | [EN](#) | [FR](#)

| Section Metadata |  |
|------------------|---|
| Style            | top |

---

[![AstraZeneca](/icons/astrazeneca-logo.svg)](/)

---

- Products Translation
  - [Product 1](#)
  - [Product 2](#)
  - [Product 3](#)
- Therapies Translation
  - [Therapy 1](#)
  - [Therapy 2](#)
  - [Therapy 3](#)
- [News Translation](#)

---

[![Search](/icons/search.svg)](#) **[Login](#)**
```

## Section Breakdown

### Top Utility Bar
- First section with `Style: top` metadata
- Contains utility links separated by `|`
- Language switcher (EN | FR)

### Brand Section
- Contains the logo as an image link
- Logo should link to homepage (`/`)

### Navigation Sections
- Unordered list with top-level navigation items
- Nested lists create dropdown menus
- Items without nested lists are direct links

### Tools Section
- Search icon (linked image)
- Primary action button (Login) - wrapped in `**bold**` for primary styling

## CSS Classes Applied

| Element | Class | Description |
|---------|-------|-------------|
| Wrapper | `.nav-wrapper` | Contains all header elements |
| Top Bar | `.nav-top-container` | Utility bar container |
| Main Nav | `nav` | Main navigation element |
| Brand | `.nav-brand` | Logo container |
| Sections | `.nav-sections` | Navigation menu container |
| Tools | `.nav-tools` | Right-side tools container |
| Dropdown | `.nav-drop` | Navigation items with submenus |
| Hamburger | `.nav-hamburger` | Mobile menu toggle |

## CSS Variables Used

```css
/* Colors */
--color-primary: #d0006f;
--color-text-primary: #363b3b;
--color-background-white: #fff;
--color-border-light: #ebefee;

/* Typography */
--font-size-sm: 14px;
--font-size-md: 16px;
--font-weight-medium: 500;

/* Layout */
--nav-height: 64px;
--nav-top-height: 40px;
```

## Responsive Behavior

- **Desktop (900px+)**: Full horizontal navigation with dropdown menus
- **Mobile (<900px)**: Hamburger menu, top bar hidden, stacked navigation

## Content Guidelines

- **Logo**: SVG format recommended, max-height 40px
- **Navigation Items**: Keep to 3-5 main items for best UX
- **Dropdown Items**: Limit to 5-7 items per dropdown
- **Utility Links**: Keep text short and concise

## Example Output

The header renders as a fixed position element at the top of the page with:
- White background
- Subtle box shadow
- Responsive layout adapting to screen size
