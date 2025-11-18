# slidev-theme-foamscience

[![NPM version](https://img.shields.io/npm/v/slidev-theme-foamscience?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-foamscience)

A [Slidev](https://github.com/slidevjs/slidev) theme for academic/technical presentations; themed in Catppuccin colors.

## Install

Add the following frontmatter to your `slides.md`. Start Slidev then it will prompt you to install the theme automatically.

<pre><code>---
theme: <b>foamscience</b>
---</code></pre>

## Configuration

### Header Numbering

By default, this theme automatically numbers h1 and h2 headers throughout your presentation:
- h1 headers are numbered globally: 1❯, 2❯, 3❯, 4❯...
- h2 headers are numbered within their h1 section: 1.1❯, 1.2❯, 2.1❯, 2.2❯...

Headers in `cover` and `intro` layouts are excluded from numbering.

To disable header numbering globally, add the following to your main frontmatter:

```yaml
---
theme: foamscience
headerNumbering: false
---
```

To disable header numbering for a specific slide, add it to that slide's frontmatter:

```markdown
---
headerNumbering: false
---
```

Identical consecutive headings won't count towards a new heading label; for example,
"Heading 1" will only numbered once; and hiding it from the ToC keeps the numbering
consistent:

```markdown
---

# Heading 1

---
hideInToc: true
---

# Heading 1

```

### Converting BibTeX to JSON

The References component uses JSON format for bibliographies. To convert your BibTeX file to JSON:

```bash
# Install bib2json (if using uvx - no installation needed)
uvx bib2json -i public/references.bib -o public/references.json
```

Then use the JSON file in your slides:

```vue
<References bibFile="/references.json" />
```
