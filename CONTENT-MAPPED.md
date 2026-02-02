# CONTENT-MAPPED.md

Project-specific content mapping patterns and learnings for EDS migrations.

---

## Project-Specific Block Patterns

### cards-therapeutic Block

**Location:** `blocks/cards/cards.css` (variant: therapeutic)

#### ⚠️ CRITICAL: Vertical Structure Only (cols-N is CSS, not table columns)

**The `cols-N` variant controls CSS grid display, NOT markdown table columns.**

```markdown
# ✅ CORRECT - 2-column vertical format (each row = one card)
| Cards (therapeutic, cols-3) |  |
|---|---|
| ![img1](url1) | **Title 1** <br><br> Description 1 |
| ![img2](url2) | **Title 2** <br><br> Description 2 |
| ![img3](url3) | **Title 3** <br><br> Description 3 |

# ❌ WRONG - Horizontal grid format (NEVER do this)
| Cards (therapeutic, cols-3) |   |   |
|---|---|---|
| ![img1] | ![img2] | ![img3] |
| **Title1** | **Title2** | **Title3** |
```

**Why horizontal grids break:**
- EDS Cards block JavaScript expects 2-column structure (image | content)
- It applies `cards-card-image` class to first column, `cards-card-body` to second
- 3+ column tables break decoration → no styling applied
- CSS grid with `cols-N` handles visual layout automatically

**Structure:**
- Each table row = one card (NOT each cell)
- 2-column format: `| image | content |`
- Column variants specified in block name: `Cards (therapeutic, cols-4)`

**Markdown Template:**
```markdown
| Cards (therapeutic, cols-4) |  |
|---|---|
| ![alt](/content/images/image.png) | **Card Title**<br><br>Description text here. |
```

**Key Rules:**
- **ALWAYS use 2-column vertical format** - regardless of cols-N variant
- **Do NOT include CTA links** - Cards should not have "Mehr erfahren" or similar call-to-action buttons
- Use `**bold**` for titles (NOT `###` markdown headings - they don't work in tables)
- Use `<br><br>` for line breaks between title and description
- Column options: `cols-2`, `cols-3`, `cols-4` (these control CSS grid, not table structure)

### accordion-section Block (PREFERRED)

**Location:** `blocks/accordion-section/accordion-section.css`

**⚠️ IMPORTANT:** Always use `accordion-section` for expandable content sections. This is the preferred accordion block.

**Styling:**
- Clean, minimal design with border separators
- Chevron rotation animation when expanded
- Responsive typography and spacing

**Markdown Template (Grid Table Format):**
```markdown
+---------------------------------------------------------------------------------------------------------------+
| **Accordion-Section**                                                                                         |
+-----------------------------------------------+---------------------------------------------------------------+
| Section Title                                 | Content text for this section goes here. Can be multiple      |
|                                               | lines of text describing the topic in detail.                 |
+-----------------------------------------------+---------------------------------------------------------------+
| Another Section Title                         | More content here with details about this topic.              |
+-----------------------------------------------+---------------------------------------------------------------+
```

**Key Rules:**
- Use grid table format with `+---+` borders
- First row contains block name: `**Accordion-Section**`
- Each subsequent row: `| Title | Content |` (2 columns)
- Title in left column, content in right column
- Each row creates one accordion item

---

## Block Variant Selection

### ⚠️ CRITICAL: Always Check for Branded Variants

**Problem:** Using generic blocks when branded variants exist leads to inconsistent design.

**Rule:** Before using a generic block, check if a branded variant exists:

| Generic Block | Preferred Variant | When to Use |
|---------------|-------------------|-------------|
| `accordion` | `accordion-section` | All expandable content sections |
| `cards` | `cards-therapeutic` | Medical/therapeutic content |
| `hero` | `hero` | All hero banners |

**How to Check:**
```bash
ls blocks/ | grep -i <name>   # Find all variants of a block
ls blocks/                    # List all available blocks
```

**Why It Matters:**
- Branded variants include design tokens (colors, shadows, typography)
- Ensures consistency with Figma design system
- Avoids rework when reviewer catches wrong block

---

## Layout Solutions

### Column Layouts
| Variant | Use Case |
|---------|----------|
| `cols-2` | Large cards with detailed content |
| `cols-3` | Standard card grids |
| `cols-4` | Compact cards, thumbnail galleries |

**Always ask user for column preference upfront** - default assumptions lead to rework.

---

## Troubleshooting Guide

### Cards Not Rendering / No Styling Applied

**Problem:** Cards block shows as plain unstyled list or table instead of styled card grid.

**Cause:** Horizontal grid table structure used instead of vertical 2-column format.

**Symptoms:**
- Cards appear as plain HTML table
- No card styling (shadows, borders, spacing)
- Images and text not properly aligned

**Wrong pattern to look for:**
```markdown
| Cards (therapeutic, cols-3) |   |   |
|---|---|---|
| ![img1] | ![img2] | ![img3] |
| **Title1** | **Title2** | **Title3** |
```

**Solution:**
1. Change to 2-column vertical format (each row = one card)
2. Keep `cols-N` in block name for CSS grid layout
3. Structure: `| image | content |` per row

```markdown
| Cards (therapeutic, cols-3) |  |
|---|---|
| ![img1] | **Title1** <br><br> Desc1 |
| ![img2] | **Title2** <br><br> Desc2 |
| ![img3] | **Title3** <br><br> Desc3 |
```

**Root cause:** Source websites display cards in horizontal grids visually. The agent incorrectly replicated this visual layout in markdown table structure instead of using EDS's 2-column vertical format.

---

### Images Not Rendering

**Problem:** External images from authenticated/protected sites show as broken.

**Cause:** Hotlinking protection blocks external image requests.

**Solution:**
1. Download images locally to `content/images/`
2. Update markdown to use local paths: `![alt](/content/images/filename.png)`
3. Note: CDN domains may differ from main site (e.g., `cms.example.com` vs `www.example.com`)

### Session Expiration

**Problem:** Authentication expires between operations.

**Solution:**
1. Handle cookie consent dialogs first
2. Re-authenticate if session expires
3. Consider downloading all assets in one batch after login

### Block Not Recognized

**Problem:** Content renders as plain list instead of styled block.

**Cause:** Incorrect table syntax or block name mismatch.

**Solution:**
1. Verify block name matches exactly (case-sensitive)
2. Check table has proper `|---|---|` separator row
3. Ensure each card is a complete row, not split across rows

---

## Code Templates

### Image Download Script (Bash)
```bash
# Download images from source site
curl -o content/images/image-name.png "https://source-cdn.com/path/to/image.png"
```

### Cards Row Template
```markdown
| ![Image Alt](/content/images/image.png) | **Title**<br><br>Description text. |
```
> **Note:** Do not include CTA links in cards - they should only have image, title, and description.

---

## Workflow Improvements

### Recommended Process Order

1. **Ask layout preference first** - Confirm cols-2/3/4 before mapping
2. **Handle authentication early** - Login and accept cookies immediately
3. **Download images in batch** - After login, download all images before session expires
4. **Verify block structure** - Read target block template before writing markdown
5. **Preview before completion** - Always screenshot to verify rendering

### Lessons Learned

| Issue | Learning |
|-------|----------|
| External images blocked | Always download to local `content/images/` |
| Wrong column count | Ask user for layout preference upfront |
| Markdown headings in tables | Use `**bold**` instead of `###` |
| Session timeout | Batch asset downloads after authentication |
| Generic teaser images | Note when multiple cards share same image for content authors |
| **Used generic block** | **Use preferred variants: `accordion-section` for accordions, `cards-therapeutic` for cards** |
| **CTA in cards** | **Do NOT migrate CTA links in cards blocks - cards should only have image, title, and description** |
| **⚠️ Horizontal card grid** | **NEVER use 3+ column tables for cards. `cols-N` is CSS-only. Always use 2-column vertical: `\| image \| content \|` per row** |

---

## Migration History

### sle.md (2025-01-19)

**Source:** `https://www.mein-medcampus.de/systemischer-lupus-erythematodes/deutsche-S3-Leitlinie-SLE-verof-fentlicht`

**Blocks Used:**
- `accordion-section` - For 5 expandable therapy sections (grid table format)
- Default content - For title, intro, image, footnotes, references

**Content Migrated:**
- Page title: "Deutsche S3-Leitlinie SLE veröffentlicht"
- Bold intro text and main paragraph with superscript references
- Treatment diagram image with caption (downloaded locally to `/content/images/sle-leitlinie-grafik.webp`)
- 5 accordion sections:
  1. Biologika als Standardtherapie bei SLE
  2. Übergeordnetes Therapieziel Remission
  3. Die Initialtherapie: Hydroxychloroquin als Basis
  4. Glucocorticoide als Überbrückungstherapie
  5. Fatigue bei SLE
- Footnotes (DORIS, ST definitions)
- 5 references with links
- External links (Pflichttext Saphnelo®, Fachinformation Saphnelo®)
- Document code: DE-81817/04-25

**Issues Resolved:**
1. Used grid table format for accordion-section (2-column: title | content)
2. Required authentication with cookie consent handling

**Key Learning:** Use `accordion-section` with grid table format for expandable content sections.

---

### lupus-test-2.md (2025-01-19)

**Source:** `https://www.mein-medcampus.de/systemischer-lupus-erythematodes`

**Block Used:** `cards-therapeutic` with `cols-4` layout

**Content Migrated:**
- 16 article cards about Systemischer Lupus Erythematodes (SLE)
- Each card: image, title, description (CTAs removed per design decision)

**Images Downloaded:**
- `teaser.png` - Generic Lupus Perspectives teaser
- `lupus-perspectives-teaser.png` - Branded image
- `real-world-study.png` - Real-world study
- `initiative-lupus.png` - Initiative image
- `eular-studienevidenz.png` - EULAR study
- `infusionsservice.webp` - Home infusion service
- `saphnelo-remission.jpg` - Saphnelo remission
- `anifrolumab-1jahr.png` - 1 Year Anifrolumab

**Issues Resolved:**
1. External images blocked → Downloaded locally
2. Initial 3-col layout → Changed to 4-col per user request
3. Session expiration → Re-authenticated mid-workflow
4. CTA links removed → Cards should not include "Mehr erfahren" CTAs per design decision

---

## Next Steps for Future Migrations

1. Reference this file before starting new content mapping tasks
2. Check if target block has documented patterns above
3. Follow workflow improvements to avoid common issues
4. Update this file with new learnings after each migration
