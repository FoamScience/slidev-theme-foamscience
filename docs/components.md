# Slidev Theme FoamScience - Component Documentation

## Overview

This Slidev theme provides a Catppuccin-themed presentation framework with advanced components for scientific and technical presentations.

### Theme Features

- **Color Schemes**: Catppuccin Latte (light) and Mocha (dark) variants
- **Typography**: Nunito Sans (sans-serif), Fira Code (monospace)
- **Syntax Highlighting**: Catppuccin themes for Shiki
- **Automatic Theme Switching**: All components adapt to light/dark mode

---

## Components

### SlideCounter

A compact slide counter that displays the current slide number and total slides.

#### Usage

```vue
<SlideCounter />
```

#### Props

- `position` (optional): Position of the counter
  - Options: `'bottom-right'` | `'bottom-left'` | `'top-right'` | `'top-left'`
  - Default: `'bottom-right'`
- `separator` (optional): Text between current and total
  - Default: `' / '`

#### Examples

```vue
<!-- Default bottom-right position -->
<SlideCounter />

<!-- Top-left position with custom separator -->
<SlideCounter position="top-left" separator=" of " />
```

#### Styling

The slide counter features:
- Compact size with minimal padding (`px-1.5 py-0.5`)
- Small font size (`text-xs`)
- Positioned 0.5rem from edges
- Backdrop blur with semi-transparent background
- Hover effect with color change

---

## References & Citations

A complete bibliography system supporting JSON bibliography files with clickable citations and beamer-style footnotes.

### Components

#### References

Displays a formatted list of references from a JSON file.

##### Usage

```vue
<References bibFile="/references.json" />
```

##### Props

- `bibFile` (optional): Path or URL to JSON file
- `showAll` (optional): Show all references or only cited ones
  - Default: `false` (only cited)
- `title` (optional): Section title
  - Default: `'References'`

##### Examples

```vue
<!-- Show only cited references -->
<References bibFile="/references.json" />

<!-- Show all references -->
<References bibFile="/references.json" showAll />

<!-- Custom title -->
<References bibFile="/references.json" title="Bibliography" />

<!-- Load from URL -->
<References bibFile="https://example.com/refs.json" />
```

##### Styling

The References component features:
- Compact spacing (0.5rem between items)
- Reduced vertical padding (0.25rem)
- Hover effects on reference items
- Clickable DOI/URL links
- Highlight animation when scrolled to

#### Citation

Inline citation component with multiple display modes including beamer-style footnotes.

##### Usage

```vue
<Citation id="einstein1905" />
```

##### Props

- `id` (required): Citation key from the JSON file
- `style` (optional): Citation style
  - Options: `'numeric'` | `'author-year'`
  - Default: `'numeric'`
- `format` (optional): Display format
  - Options: `'brackets'` | `'parentheses'` | `'superscript'`
  - Default: `'brackets'`
- `showAsFootnote` (optional): Display as beamer-style footnote
  - Default: `false`

##### Examples

```vue
<!-- Numeric citation with brackets [1] -->
<Citation id="einstein1905" />

<!-- Author-year with parentheses (Einstein, 1905) -->
<Citation id="einstein1905" style="author-year" format="parentheses" />

<!-- Superscript style¹ -->
<Citation id="einstein1905" format="superscript" />

<!-- Beamer-style footnote (click to toggle) -->
<Citation id="einstein1905" showAsFootnote />
```

##### Beamer-Style Footnotes

When `showAsFootnote` is enabled:
- Clicking the citation toggles a footnote popup
- Footnote appears bottom-right, above the slide counter
- Shows full reference with DOI/URL links
- Automatic dismiss after 5 seconds (or toggle by clicking again)
- Positioned at `bottom: 3rem, right: 1rem`
- Width: `max-width: 45%, min-width: 30%`

##### Click Behavior

- **Without `showAsFootnote`**: Attempts to scroll to reference on References slide
- **With `showAsFootnote`**: Toggles footnote display
- **If reference not found**: Shows temporary footnote for 5 seconds

### Complete Example

```markdown
---
theme: foamscience
---

# My Research

<script setup>
import { onMounted } from 'vue'
import { useBibliography } from './composables/useBibliography'

const { loadJsonFromUrl } = useBibliography()

onMounted(async () => {
  await loadJsonFromUrl('/references.json')
})
</script>

Recent studies <Citation id="smith2023" /> have shown that...

For quick reference <Citation id="doe2022" showAsFootnote />.

Multiple citations: <Citation id="jones2024" style="author-year" format="parentheses" />.

---

# References

<References bibFile="/references.json" />
```

### JSON File Format

Create a `references.json` file. You can convert from BibTeX using:

```bash
uvx bib2json -i public/references.bib -o public/references.json
```

The tool outputs JSON in this format (note uppercase "ID"):

```json
[
  {
    "ID": "smith2023",
    "ENTRYTYPE": "article",
    "title": "Advances in Machine Learning",
    "author": "Smith, John and Doe, Jane",
    "journal": "Journal of AI Research",
    "year": "2023",
    "doi": "10.1234/jair.2023.001"
  },
  {
    "ID": "doe2022",
    "ENTRYTYPE": "inproceedings",
    "title": "Deep Learning Architectures",
    "author": "Doe, Jane",
    "booktitle": "Proceedings of ICML",
    "year": "2022"
  }
]
```

**Note**: The composable handles both `"id"` and `"ID"` fields automatically.

---

## Chart

A D3.js-based chart component with automatic Catppuccin theming and component-based rendering.

### Usage

```vue
<Chart :data="chartData" :height="400" />
```

### Props

- `data` (required): Chart data object or path to JSON file
- `height` (optional): Chart height in pixels or CSS string
  - Default: `400`
- `legendPosition` (optional): Legend placement
  - Options: `'top-left'` | `'top-center'` | `'top-right'` | `'center-left'` | `'center'` | `'center-right'` | `'bottom-left'` | `'bottom-center'` | `'bottom-right'` | `'left'` | `'right'` | `'top'` | `'bottom'` | `'none'` | `'outside-top-left'` | `'outside-top'` | `'outside-top-right'` | `'outside-bottom-left'` | `'outside-bottom'` | `'outside-bottom-right'` | `'outside-left'` | `'outside-right'`
  - Default: `'top-right'`
- `animationDuration` (optional): Animation duration in ms
  - Default: `1000`

### Data Format

The Chart component uses a component-based data format:

```typescript
{
  components: [
    {
      id: string,           // Unique identifier
      type: string,         // 'line' | 'scatter' | 'bar' | 'area' | etc.
      label: string,        // Legend label
      data: Array,          // Data points
      color: string,        // Hex color
      lifetimeStart: number // Animation state when component appears
    }
  ],
  currentState: number,     // Current animation state (optional)
  xRange: [min, max],       // X-axis range (optional)
  yRange: [min, max],       // Y-axis range (optional)
  xAxisLabel: string,       // X-axis label (optional)
  yAxisLabel: string        // Y-axis label (optional)
}
```

### Supported Chart Types

- **Line charts**: Continuous data with optional fills
- **Scatter plots**: Point-based data with customizable radius
- **Bar charts**: Vertical and horizontal bars
- **Area charts**: Filled line charts
- **Stacked area charts**: Multiple datasets stacked
- **Error bars**: Data with uncertainty
- **Box plots**: Statistical distributions
- **Violin plots**: Kernel density estimates
- **Histograms**: Binned distributions
- **Heatmaps**: 2D color-coded matrices
- **Bubble charts**: Scatter with variable-sized bubbles
- **Grouped bar charts**: Side-by-side bars

### Examples

#### Inline Data - Line Chart

```vue
<script setup>
const lineData = {
  labels: [0, 1, 2, 3, 4],
  components: [
    {
      id: 'dataset-1',
      type: 'line',
      label: 'Series A',
      data: [10, 20, 15, 25, 20],
      color: '#89b4fa',
      strokeWidth: 2,
      lifetimeStart: 0
    }
  ],
  xRange: [0, 4],
  yRange: [0, 30],
  xAxisLabel: 'Time',
  yAxisLabel: 'Value'
}
</script>

<Chart :data="lineData" :height="350" />
```

#### Scatter Plot

```vue
<script setup>
const scatterData = {
  components: [
    {
      id: 'points',
      type: 'scatter',
      label: 'Data Points',
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 3 }
      ],
      color: '#a6e3a1',
      radius: 5,
      lifetimeStart: 0
    }
  ],
  xRange: [0, 4],
  yRange: [0, 5]
}
</script>

<Chart :data="scatterData" />
```

#### Bar Chart (Horizontal)

```vue
<script setup>
const barData = {
  labels: [0, 1, 2, 3],
  components: [
    {
      id: 'bars',
      type: 'bar',
      label: 'Performance',
      data: [65, 59, 90, 81],
      color: '#f5c2e7',
      orientation: 'horizontal',
      lifetimeStart: 0
    }
  ],
  xRange: [0, 100],
  yRange: [0, 3],
  xAxisLabel: 'Score',
  yAxisLabel: 'Test ID'
}
</script>

<Chart :data="barData" :height="300" />
```

#### Load from JSON File

```vue
<Chart data="/chart-data.json" :height="400" legendPosition="outside-top" />
```

### Legend Positioning

#### Inside Positions
Place legend inside the plot area:
- `top-left`, `top-center`, `top-right`
- `center-left`, `center`, `center-right`
- `bottom-left`, `bottom-center`, `bottom-right`
- `left`, `right`, `top`, `bottom`

#### Outside Positions
Place legend outside the plot area (margins automatically adjusted):
- `outside-top-left`, `outside-top`, `outside-top-right`
- `outside-bottom-left`, `outside-bottom`, `outside-bottom-right`
- `outside-left`, `outside-right`

```vue
<!-- Legend on top, outside plot area -->
<Chart :data="data" legendPosition="outside-top" />

<!-- Legend on right, outside plot area -->
<Chart :data="data" legendPosition="outside-right" />

<!-- No legend -->
<Chart :data="data" legendPosition="none" />
```

---

## AnimatedChart

An animated chart component with smooth transitions between states and control buttons.

### Usage

```vue
<AnimatedChart :states="chartStates" :height="350" />
```

### Props

- `states` (required): Array of chart states
  - Each state: `{ data: ChartData | string, label?: string }`
- `height` (optional): Chart height
  - Default: `400`
- `autoPlay` (optional): Auto-play states
  - Default: `false`
- `autoPlayInterval` (optional): Delay between states (ms)
  - Default: `3000`
- `transitionDuration` (optional): Transition animation duration (ms)
  - Default: `1000`
- `legendPosition` (optional): Same options as Chart component
  - Default: `'right'`

### Controls

The AnimatedChart features Carbon Design icons:
- **Previous**: `i-carbon:chevron-left`
- **Play/Pause**: `i-carbon:play` / `i-carbon:pause`
- **Next**: `i-carbon:chevron-right`
- **State counter**: Shows current/total states

#### Keyboard Shortcuts
- **Arrow Keys / N/P**: Navigate between states
- **Space / Enter**: Play/Pause animation

### Examples

#### Load States from JSON Files

```vue
<script setup>
const scatterStates = [
  { label: 'Initial Clusters', data: '/scatter-state1.json' },
  { label: 'Clusters Moving', data: '/scatter-state2.json' },
  { label: 'Clusters Merged', data: '/scatter-state3.json' }
]
</script>

<AnimatedChart
  :states="scatterStates"
  :height="350"
  :transitionDuration="1200"
  legendPosition="top-center"
/>
```

#### Auto-Play with Inline Data

```vue
<script setup>
const lineStates = [
  {
    label: 'Week 1',
    data: {
      labels: [0, 1, 2, 3, 4],
      components: [{
        id: 'line-1',
        type: 'line',
        label: 'Visitors',
        data: [120, 190, 150, 220, 180],
        color: '#89b4fa',
        strokeWidth: 2,
        lifetimeStart: 0
      }],
      xRange: [0, 4],
      yRange: [0, 300]
    }
  },
  {
    label: 'Week 2',
    data: {
      labels: [0, 1, 2, 3, 4],
      components: [{
        id: 'line-1',
        type: 'line',
        label: 'Visitors',
        data: [150, 230, 180, 280, 240],
        color: '#89b4fa',
        strokeWidth: 2,
        lifetimeStart: 0
      }],
      xRange: [0, 4],
      yRange: [0, 300]
    }
  }
]
</script>

<AnimatedChart
  :states="lineStates"
  :height="300"
  :autoPlay="true"
  :autoPlayInterval="2500"
/>
```

### Python Example: Generate JSON States

```python
import json
import numpy as np

# Generate scatter plot states
for i, offset in enumerate([0, 1, 2]):
    cluster_a = np.random.randn(5, 2) + [2 + offset, 3 + offset]
    cluster_b = np.random.randn(5, 2) + [7 - offset, 5]

    data = {
        "components": [
            {
                "id": "cluster-a",
                "type": "scatter",
                "label": "Cluster A",
                "data": [{"x": float(x), "y": float(y)} for x, y in cluster_a],
                "color": "#89b4fa",
                "radius": 5,
                "lifetimeStart": 0
            },
            {
                "id": "cluster-b",
                "type": "scatter",
                "label": "Cluster B",
                "data": [{"x": float(x), "y": float(y)} for x, y in cluster_b],
                "color": "#a6e3a1",
                "radius": 5,
                "lifetimeStart": 0
            }
        ],
        "currentState": i,
        "xRange": [0, 10],
        "yRange": [0, 8],
        "xAxisLabel": "X Axis",
        "yAxisLabel": "Y Axis"
    }

    with open(f'public/scatter-state{i+1}.json', 'w') as f:
        json.dump(data, f, indent=2)
```

---

## PlotlyChart

A Plotly.js-based chart component for displaying interactive plots with automatic Catppuccin theming. Load Plotly figures from JSON files exported from Python.

### Usage

```vue
<PlotlyChart data="/my-plot.json" :height="400" :layout="{xaxis: { showgrid: false, zerolines: false }, xaxis: { showgrid: false }}" />
```

### Props

- `data` (required): Plotly data object or path to JSON file
  - String: Path to JSON file (e.g., `"/my-plot.json"`)
  - Object: Inline Plotly data object
- `layout` (optional): Layout overrides to merge with themed layout
  - Type: `Partial<Plotly.Layout>`
- `height` (optional): Chart height in pixels or CSS string
  - Default: `400`
- `width` (optional): Chart width in pixels or CSS string
  - Default: `'100%'`
- `config` (optional): Plotly config overrides
  - Type: `Partial<Plotly.Config>`

### Data Format

PlotlyChart expects JSON files with Plotly's standard format:

```json
{
  "data": [
    {
      "x": [1, 2, 3, 4, 5],
      "y": [2, 4, 3, 5, 4],
      "type": "scatter",
      "mode": "markers",
      "name": "Series 1"
    }
  ],
  "layout": {
    "title": "My Plot",
    "xaxis": {"title": "X Axis"},
    "yaxis": {"title": "Y Axis"}
  }
}
```

### Python Export Workflow

Use the included `plotly_to_json.py` helper script to export Plotly figures from Python:

#### Step 1: Import the Helper

```python
from plotly_to_json import save_plotly_json
import plotly.graph_objects as go
```

#### Step 2: Create Your Figure

```python
fig = go.Figure(data=go.Scatter(
    x=[1, 2, 3, 4, 5],
    y=[2, 4, 3, 5, 4],
    mode='markers',
    name='My Data'
))

fig.update_layout(
    title='Scatter Plot',
    xaxis_title='X Axis',
    yaxis_title='Y Axis'
)
```

#### Step 3: Export as JSON

```python
save_plotly_json(fig, 'public/scatter.json')
```

#### Step 4: Use in Slidev

```markdown
<PlotlyChart data="/scatter.json" :height="500" />
```

### Examples

#### Example 1: Load from JSON File

```vue
<PlotlyChart data="/scatter-plot.json" :height="400" />
```

#### Example 2: Custom Height and Width

```vue
<PlotlyChart
  data="/bar-chart.json"
  :height="600"
  width="80%"
/>
```

#### Example 3: Layout Overrides

```vue
<PlotlyChart
  data="/line-plot.json"
  :layout="{ title: 'Custom Title', showlegend: false }"
/>
```

#### Example 4: Inline Data

```vue
<script setup>
const plotData = {
  data: [{
    x: [1, 2, 3],
    y: [2, 4, 3],
    type: 'scatter'
  }]
}
</script>

<template>
  <PlotlyChart :data="plotData" />
</template>
```

### Supported Chart Types

PlotlyChart supports all Plotly chart types:

- **Basic**: Scatter, Line, Bar, Area
- **Statistical**: Box, Violin, Histogram
- **Scientific**: Contour, Heatmap, 3D Surface
- **Financial**: Candlestick, OHLC, Waterfall
- **Maps**: Scatter Geo, Choropleth
- **3D**: Scatter3D, Surface, Mesh3D
- And more...

### Automatic Theming

The component automatically applies Catppuccin colors to:

- Background colors (paper_bgcolor, plot_bgcolor)
- Text colors (font, titles, tick labels)
- Grid and axis colors
- Legend styling
- Hover labels
- Default color palette for traces

**Note**: User-specified colors in the JSON data will override theme colors.

### Interactive Features

All Plotly interactivity is preserved:

- Hover tooltips
- Zoom and pan
- Click events
- Mode bar tools (download, zoom, pan, etc.)
- Responsive resizing

### Theme Switching

Plots automatically update when switching between light/dark modes:

- **Light Mode**: Catppuccin Latte colors
- **Dark Mode**: Catppuccin Mocha colors
- Smooth transition without page reload

### Python Helper Reference

The `plotly_to_json.py` script provides:

```python
# Main export function
save_plotly_json(
    fig,                    # Plotly figure object
    output_path,            # Where to save JSON (e.g., 'public/plot.json')
    include_layout=True,    # Include layout in JSON
    pretty=True,            # Pretty-print JSON
    **json_kwargs          # Additional json.dump() arguments
)

# Catppuccin color constants
CATPPUCCIN['latte']  # Light theme colors
CATPPUCCIN['mocha']  # Dark theme colors

# Generate example plots
create_example_plots()  # Creates 4 example JSON files
```

#### Color Constants

Access Catppuccin colors in your Python code:

```python
from plotly_to_json import CATPPUCCIN

# Use theme colors
fig.update_traces(marker_color=CATPPUCCIN['mocha']['blue'])
fig.update_layout(
    paper_bgcolor=CATPPUCCIN['mocha']['base'],
    font_color=CATPPUCCIN['mocha']['text']
)
```

Available colors: `base`, `mantle`, `crust`, `surface0`, `surface1`, `surface2`, `overlay0`, `overlay1`, `overlay2`, `subtext0`, `subtext1`, `text`, `blue`, `red`, `green`, `yellow`, `mauve`, `teal`, `peach`, `pink`, `flamingo`, `maroon`, `sky`, `sapphire`, `lavender`, `rosewater`

### Styling

PlotlyChart features:

- Rounded corners (`border-radius: 0.5rem`)
- Background color matching theme base
- Loading spinner during data fetch
- Error display for failed loads
- Themed mode bar buttons

### Loading States

The component shows:

1. **Loading**: Spinner with "Loading plot..." message
2. **Error**: Warning icon with error message
3. **Success**: Full interactive plot

### Performance

- Lazy loading: Plot renders only when component mounts
- Efficient updates: Uses `Plotly.react()` for theme changes
- Bundle size: ~1MB for plotly.js-dist-min

---

## Color Variables

All components use Catppuccin color variables that automatically adapt to light/dark mode:

### Available Colors

```css
/* Accent colors */
var(--c-blue)      /* #89b4fa (Mocha) / #1e66f5 (Latte) */
var(--c-mauve)     /* #cba6f7 / #8839ef */
var(--c-green)     /* #a6e3a1 / #40a02b */
var(--c-yellow)    /* #f9e2af / #df8e1d */
var(--c-red)       /* #f38ba8 / #d20f39 */
var(--c-teal)      /* #94e2d5 / #179299 */
var(--c-pink)      /* #f5c2e7 / #ea76cb */
var(--c-peach)     /* #fab387 / #fe640b */
var(--c-sapphire)  /* #74c7ec / #209fb5 */

/* Text colors */
var(--c-text)      /* Main text */
var(--c-subtext0)  /* Dimmed text */
var(--c-subtext1)  /* More dimmed text */

/* Surface colors */
var(--c-base)      /* Base background */
var(--c-mantle)    /* Slightly elevated */
var(--c-surface0)  /* Elevated surface */
var(--c-surface1)  /* More elevated */
var(--c-surface2)  /* Most elevated */

/* Overlay colors */
var(--c-overlay0)  /* Subtle overlay */
var(--c-overlay1)  /* Medium overlay */
var(--c-overlay2)  /* Strong overlay */
```

### Custom Styling

```vue
<style scoped>
.my-custom-element {
  background-color: var(--c-base);
  color: var(--c-text);
  border: 1px solid var(--c-overlay0);
}

.my-custom-element:hover {
  background-color: var(--c-surface0);
  color: var(--c-blue);
}
</style>
```

---

## Troubleshooting

### Citations Not Working

**Symptom**: Citations show "?" or numbers don't update

**Solutions**:
1. **Load bibliography on citation slide**:
   ```vue
   <script setup>
   import { onMounted } from 'vue'
   import { useBibliography } from './composables/useBibliography'

   const { loadJsonFromUrl } = useBibliography()

   onMounted(async () => {
     await loadJsonFromUrl('/references.json')
   })
   </script>
   ```

2. **Check JSON format**: Ensure `references.json` is in `public/` directory
3. **Verify ID field**: The composable handles both `"id"` and `"ID"` (uppercase from bib2json)
4. **Convert from BibTeX**: `uvx bib2json -i public/references.bib -o public/references.json`
5. **Check console**: Look for parsing or loading errors

### Author-Year Citations Show Numeric

**Symptom**: `<Citation id="..." style="author-year" />` displays as `[1]` instead of `Einstein, 1905`

**Cause**: Bibliography not loaded when citation component mounts

**Solution**: Ensure bibliography is loaded on the slide with citations (see above)

### Charts Not Displaying

**Symptom**: Chart shows as empty or data doesn't render

**Solutions**:
1. **Check data format**: Must use component-based format (see examples above)
2. **Verify JSON path**: Files in `public/` are accessed as `/filename.json` (no `/public/` prefix)
3. **Check console**: Look for loading or parsing errors
4. **Validate ranges**: Ensure `xRange` and `yRange` cover your data

### Scatter/Line Charts Show Points but No Lines

**Symptom**: Only individual points visible, no connecting lines

**Solution**: Ensure `strokeWidth` is set:
```javascript
{
  type: 'line',
  strokeWidth: 2,  // Required for visible line
  // ...
}
```

### Outside Legends Overlapping Content

**Symptom**: Legend positioned outside appears to overlap with plot

**Cause**: This shouldn't happen - margins auto-adjust

**Solution**: If it occurs, try different position or use inside legend

### Beamer Footnote Not Appearing

**Symptom**: Clicking citation with `showAsFootnote` doesn't show popup

**Solutions**:
1. **Check bibliography loaded**: Footnote requires loaded bibliography data
2. **Verify entry exists**: Check citation ID matches an entry in JSON
3. **Check z-index**: Footnote is at `z-index: 1000`, ensure nothing overlays it

### JSON Charts Not Loading

**Symptom**: Chart shows loading spinner indefinitely

**Solutions**:
1. **Check path**: `public/data/chart.json` → use `data="/data/chart.json"`
2. **Verify JSON structure**: Must match component-based format
3. **Check browser console**: Look for 404, CORS, or JSON parsing errors
4. **Validate JSON**: Use a JSON validator to ensure syntax is correct

---

## Best Practices

### Chart Performance

1. **Limit data points**: For smooth animations, keep datasets under 1000 points
2. **Use appropriate types**: Lines for trends, scatter for relationships
3. **Optimize JSON**: Remove unnecessary precision (2-3 decimals usually sufficient)
4. **Use outside legends**: For cleaner plots with more data space

### Citation Management

1. **Convert BibTeX to JSON**: `uvx bib2json -i public/references.bib -o public/references.json`
2. **Load once per slide**: Call `loadJsonFromUrl()` in slide's `onMounted`
3. **Use consistent IDs**: `author-year` format (e.g., `einstein1905`)
4. **Include all fields**: Title, author, year, journal/booktitle, DOI/URL
5. **Beamer footnotes for quick refs**: Use `showAsFootnote` for definitions or side notes

### Animation Design

1. **Match duration to complexity**: Simple changes 500-800ms, complex 1000-1500ms
2. **Use meaningful labels**: Help users understand state transitions
3. **Test auto-play timing**: Ensure users can read before transition
4. **Provide manual controls**: Always available with keyboard shortcuts

### Legend Placement

1. **Use outside for data-heavy charts**: Maximizes plot area
2. **Use inside for simple charts**: Keeps everything compact
3. **Consider slide layout**: Outside-right works well with text on left
4. **Test both themes**: Verify visibility in light and dark modes

---

## Examples

See `example.md` for comprehensive working examples of all components and features.

---

## Credits

- **Catppuccin**: https://catppuccin.com/
- **D3.js**: https://d3js.org/
- **Slidev**: https://sli.dev/
- **Carbon Design Icons**: https://carbondesignsystem.com/guidelines/icons/

---

## License

MIT License - See repository for details
