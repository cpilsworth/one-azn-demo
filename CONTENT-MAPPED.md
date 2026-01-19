# CONTENT-MAPPED.md

Project-specific content mapping patterns and learnings for EDS migrations.

---

## Project-Specific Block Patterns

### cards-therapeutic Block

**Location:** `blocks/cards/cards.css` (variant: therapeutic)

**Structure:**
- Each table row = one card (NOT each cell)
- 2-column format: `| image | content |`
- Column variants specified in block name: `Cards (therapeutic, cols-4)`

**Markdown Template:**
```markdown
| Cards (therapeutic, cols-4) |  |
|---|---|
| ![alt](/content/images/image.png) | **Card Title**<br><br>Description text here.<br><br>[Call to Action](https://link-url) |
```

**Key Rules:**
- Use `**bold**` for titles (NOT `###` markdown headings - they don't work in tables)
- Use `<br><br>` for line breaks between title, description, and CTA
- Column options: `cols-2`, `cols-3`, `cols-4`

### accordion-oneaz Block (PREFERRED over accordion)

**Location:** `blocks/accordion-oneaz/accordion-oneaz.css`

**⚠️ IMPORTANT:** Always use `accordion-oneaz` instead of generic `accordion` for AstraZeneca/MeinMedcampus projects.

**Brand Styling:**
- Card-style items with shadows and rounded corners
- Teal/cyan left border on expanded content (AstraZeneca brand color)
- Magenta text for accordion labels
- Chevron rotation animation when expanded
- One-AZ typography and spacing from Figma design system

**Markdown Template:**
```markdown
| Accordion-Oneaz |
|---|
| **Section Title** |
| Content paragraph with details... |
| **Another Section** |
| More content here... |
```

**Key Rules:**
- Use `**bold**` for section titles (clickable headers)
- Plain text or HTML for content (follows the title row)
- Each title + content pair creates one accordion item

---

## Block Variant Selection

### ⚠️ CRITICAL: Always Check for Branded Variants

**Problem:** Using generic blocks when branded variants exist leads to inconsistent design.

**Rule:** Before using a generic block, check if a branded variant exists:

| Generic Block | Branded Variant | When to Use Branded |
|---------------|-----------------|---------------------|
| `accordion` | `accordion-oneaz` | All AstraZeneca/MeinMedcampus projects |
| `cards` | `cards-therapeutic` | Medical/therapeutic content |
| `hero` | `hero-oneaz` | AstraZeneca branded pages |

**How to Check:**
```bash
ls blocks/ | grep -i oneaz    # Find AstraZeneca branded blocks
ls blocks/ | grep -i <name>   # Find all variants of a block
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
| ![Image Alt](/content/images/image.png) | **Title**<br><br>Description text.<br><br>[CTA Text](https://url) |
```

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
| **Used generic block** | **Always check for branded variants (`-oneaz`, `-therapeutic`) before using generic blocks** |

---

## Migration History

### test-1.md (2025-01-19)

**Source:** `https://www.mein-medcampus.de/systemischer-lupus-erythematodes/deutsche-S3-Leitlinie-SLE-verof-fentlicht`

**Blocks Used:**
- `accordion-oneaz` - For 5 expandable therapy sections
- Default content - For title, intro, footnotes, references

**Content Migrated:**
- Page title: "Deutsche S3-Leitlinie SLE veröffentlicht"
- Bold intro text and main paragraph
- Treatment diagram image with caption
- 5 accordion sections (Biologika, Remission, Hydroxychloroquin, Glucocorticoide, Fatigue)
- Footnotes (DORIS, ST definitions)
- 5 references with links
- External links (Pflichttext, Fachinformation)

**Issues Resolved:**
1. Initially used generic `accordion` → Changed to `accordion-oneaz` for brand consistency
2. Required authentication with cookie consent handling

**Key Learning:** Always check for branded block variants (`-oneaz`) before using generic blocks on AstraZeneca projects.

---

### test-1.md (2025-01-19)

**Source:** `https://www.mein-medcampus.de/systemischer-lupus-erythematodes/deutsche-S3-Leitlinie-SLE-verof-fentlicht`

**Blocks Used:**
- `accordion-oneaz` - For 5 expandable therapy sections
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
1. Initially used incorrect accordion format (single column) → Fixed to 2-column format (label | content)
2. Required authentication with cookie consent handling

---

### lupus-test-2.md (2025-01-19)

**Source:** `https://www.mein-medcampus.de/systemischer-lupus-erythematodes`

**Block Used:** `cards-therapeutic` with `cols-4` layout

**Content Migrated:**
- 16 article cards about Systemischer Lupus Erythematodes (SLE)
- Each card: image, title, description, "Mehr erfahren" CTA

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

---

## Next Steps for Future Migrations

1. Reference this file before starting new content mapping tasks
2. Check if target block has documented patterns above
3. Follow workflow improvements to avoid common issues
4. Update this file with new learnings after each migration
