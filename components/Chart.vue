<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import { useChartTheming, type ChartColors } from '../composables/useChartTheming'
import { useChartValidation } from '../composables/useChartValidation'

export interface ChartComponent {
  id: string
  type: 'line' | 'area' | 'points' | 'bar' | 'histogram' | 'errorbar' | 'boxplot' | 'heatmap' | 'stackedarea' | 'bubble' | 'groupedbar' | 'violin'
  label: string
  data: any
  color: string
  strokeWidth?: number
  showPoints?: boolean
  pointSize?: number
  lifetimeStart: number
  lifetimeEnd?: number
  areaFill?: any
  orientation?: 'vertical' | 'horizontal'  // For bar charts and box plots
  barWidth?: number  // Custom bar width (default: auto-calculated)
  capWidth?: number  // Width of error bar caps (default: 8)
  boxWidth?: number  // Width of box plot boxes (default: auto-calculated)
  showOutliers?: boolean  // Show outlier points in box plot (default: true)
  colors?: string[]  // Array of colors for heatmap, stacked areas, grouped bars
  rScale?: [number, number]  // Min and max radius for bubble charts (default: [3, 20])
}

export interface ChartDataset {
  label: string
  data: number[] | Array<{x: number, y: number, r?: number}>
}

export interface ChartData {
  labels?: string[] | number[]
  datasets?: ChartDataset[]
  components?: ChartComponent[]  // New component-based format
  currentState?: number  // For incremental rendering
  xRange?: [number, number]  // Fixed x-axis range [min, max]
  yRange?: [number, number]  // Fixed y-axis range [min, max]
  xAxisLabel?: string  // X-axis label
  yAxisLabel?: string  // Y-axis label
}

interface Props {
  // Note: For pie/doughnut charts, use the PlotlyChart component instead
  type?: 'line' | 'bar' | 'scatter' | 'bubble'
  data?: ChartData | string
  height?: number | string
  animationDuration?: number
  legendPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left' | 'right' | 'top' | 'bottom' | 'none' | 'outside-top-left' | 'outside-top-right' | 'outside-bottom-left' | 'outside-bottom-right' | 'outside-left' | 'outside-right' | 'outside-top' | 'outside-bottom'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  height: 400,
  animationDuration: 1000,
  legendPosition: 'right'
})

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const validationErrors = ref<string[]>([])
const chartData = ref<ChartData | null>(null)
const renderedComponents = ref<Set<string>>(new Set())
const currentStateIndex = ref(0)
const resizeObserver = ref<ResizeObserver | null>(null)
const hiddenLabels = ref<Set<string>>(new Set())

const { getChartColors, hexToRgba, colors, isDark } = useChartTheming()
const { validateChartDataSync } = useChartValidation()

// Map Catppuccin colors to theme-aware colors
// This ensures colors in JSON adapt to current theme
const mapColorToTheme = (color: string): string => {
  // Catppuccin Mocha color mappings
  const mochaPalette: Record<string, keyof ChartColors> = {
    '#89b4fa': 'blue',
    '#f38ba8': 'red',
    '#a6e3a1': 'green',
    '#f9e2af': 'yellow',
    '#cba6f7': 'mauve',
    '#94e2d5': 'teal',
    '#fab387': 'peach',
    '#f5c2e7': 'pink',
    '#f2cdcd': 'flamingo',
    '#eba0ac': 'maroon',
    '#89dceb': 'sky',
    '#74c7ec': 'sapphire',
    '#b4befe': 'lavender',
    '#f5e0dc': 'rosewater',
    '#6c7086': 'overlay0',
    '#7f849c': 'overlay1',
    '#cdd6f4': 'text',
    '#a6adc8': 'subtext0',
    '#bac2de': 'subtext1'
  }

  // Catppuccin Latte color mappings
  const lattePalette: Record<string, keyof ChartColors> = {
    '#1e66f5': 'blue',
    '#d20f39': 'red',
    '#40a02b': 'green',
    '#df8e1d': 'yellow',
    '#8839ef': 'mauve',
    '#179299': 'teal',
    '#fe640b': 'peach',
    '#ea76cb': 'pink',
    '#dd7878': 'flamingo',
    '#e64553': 'maroon',
    '#04a5e5': 'sky',
    '#209fb5': 'sapphire',
    '#7287fd': 'lavender',
    '#dc8a78': 'rosewater',
    '#9ca0b0': 'overlay0',
    '#8c8fa1': 'overlay1',
    '#4c4f69': 'text',
    '#6c6f85': 'subtext0',
    '#5c5f77': 'subtext1'
  }

  // Check if color is in either palette
  const colorKey = mochaPalette[color] || lattePalette[color]

  if (colorKey) {
    // Map to current theme color
    return colors.value[colorKey]
  }

  // Return original color if not found in palettes
  return color
}

// Load data from JSON file or use provided data
const loadData = async () => {
  // Skip if no data provided (e.g., when AnimatedChart hasn't loaded states yet)
  if (!props.data) {
    return
  }

  if (typeof props.data === 'string') {
    loading.value = true
    error.value = null
    validationErrors.value = []

    try {
      const response = await fetch(props.data)
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`)
      }
      const jsonData = await response.json()

      // Validate data
      const validation = validateChartDataSync(jsonData)
      if (!validation.valid) {
        validationErrors.value = validation.errors
        console.error('[Chart] Validation errors:', validation.errors)
        error.value = `Chart data validation failed: ${validation.errors[0]}`
        return
      }

      chartData.value = jsonData
    } catch (err) {
      error.value = `Error loading chart data: ${err}`
      console.error('Chart data loading error:', err)
    } finally {
      loading.value = false
    }
  } else {
    // Validate inline data
    const validation = validateChartDataSync(props.data)
    if (!validation.valid) {
      validationErrors.value = validation.errors
      console.error('[Chart] Validation errors:', validation.errors)
      error.value = `Chart data validation failed: ${validation.errors[0]}`
      return
    }
    chartData.value = props.data
  }
}

// Base margins constant
const baseMargin = { top: 40, right: 40, bottom: 60, left: 60 }

// Calculate margins dynamically based on legend position
const calculateMargins = (components: ChartComponent[]) => {

  // If legend is disabled or positioned inside, use base margins
  if (props.legendPosition === 'none' ||
      !props.legendPosition?.startsWith('outside-')) {
    return baseMargin
  }

  // Calculate legend dimensions
  const uniqueLabels = Array.from(new Set(components.map(c => c.label)))
  const legendWidth = 200
  const legendHeight = uniqueLabels.length * 25
  const legendPadding = 10  // Space between legend and plot

  // Adjust margins based on outside legend position
  // Use optimized base margins to reduce total space when legends are outside
  const margin = { ...baseMargin }

  if (props.legendPosition === 'outside-top' ||
      props.legendPosition === 'outside-top-left' ||
      props.legendPosition === 'outside-top-right') {
    margin.top = baseMargin.top + legendHeight + legendPadding
  }

  if (props.legendPosition === 'outside-bottom' ||
      props.legendPosition === 'outside-bottom-left' ||
      props.legendPosition === 'outside-bottom-right') {
    margin.bottom = baseMargin.bottom + legendHeight + legendPadding
  }

  if (props.legendPosition === 'outside-left') {
    // Optimize base left margin: use 40px instead of 60px to reduce total space
    margin.left = 40 + legendWidth + legendPadding  // 40 + 200 + 10 = 250px (was 270px)
  }

  if (props.legendPosition === 'outside-right') {
    // Optimize base right margin: use 25px instead of 40px to reduce total space
    margin.right = 25 + legendWidth + legendPadding  // 25 + 200 + 10 = 235px (was 250px)
  }

  return margin
}

// Component-based rendering with incremental updates
const renderComponentBased = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
  if (!data.components || !data.labels) return

  const xLabels = data.labels as number[]
  const stateIdx = data.currentState ?? currentStateIndex.value

  // Calculate margins based on legend position
  const margin = calculateMargins(data.components)

  // Create scales - use fixed ranges if provided, otherwise calculate from data
  const xDomain = data.xRange || [d3.min(xLabels) || 0, d3.max(xLabels) || 100]
  const x = d3.scaleLinear()
    .domain(xDomain)
    .range([margin.left, width - margin.right])

  // Calculate y domain from all component data (if not fixed)
  let yDomain: [number, number]
  if (data.yRange) {
    yDomain = data.yRange
  } else {
    let allValues: number[] = []
    data.components.forEach(comp => {
      if (comp.type === 'line' && Array.isArray(comp.data)) {
        allValues = allValues.concat(comp.data.filter(v => typeof v === 'number'))
      } else if (comp.type === 'area' && comp.data.upper && comp.data.lower) {
        allValues = allValues.concat(comp.data.upper)
        allValues = allValues.concat(comp.data.lower)
      } else if (comp.type === 'points' && Array.isArray(comp.data)) {
        allValues = allValues.concat(comp.data.map((p: any) => p.y))
      } else if (comp.type === 'bar' && Array.isArray(comp.data)) {
        if (comp.orientation === 'horizontal') {
          // For horizontal bars, data values are on x-axis
          allValues = allValues.concat(comp.data.filter(v => typeof v === 'number'))
        } else {
          // For vertical bars (default), data values are on y-axis
          allValues = allValues.concat(comp.data.filter(v => typeof v === 'number'))
        }
      } else if (comp.type === 'histogram' && comp.data.frequencies) {
        // For histogram, frequencies are on y-axis (for vertical) or x-axis (for horizontal)
        if (comp.orientation === 'horizontal') {
          allValues = allValues.concat(comp.data.frequencies)
        } else {
          allValues = allValues.concat(comp.data.frequencies)
        }
      } else if (comp.type === 'errorbar' && Array.isArray(comp.data)) {
        // For error bars, include the error ranges in domain calculation
        comp.data.forEach((d: any) => {
          if (d.errorUpper !== undefined && d.errorLower !== undefined) {
            allValues.push(d.y + d.errorUpper)
            allValues.push(d.y - d.errorLower)
          } else if (d.error !== undefined) {
            allValues.push(d.y + d.error)
            allValues.push(d.y - d.error)
          } else {
            allValues.push(d.y)
          }
        })
      } else if (comp.type === 'boxplot' && Array.isArray(comp.data)) {
        // For box plots, include min, max, and outliers
        comp.data.forEach((d: any) => {
          allValues.push(d.min)
          allValues.push(d.max)
          if (d.outliers && Array.isArray(d.outliers)) {
            allValues = allValues.concat(d.outliers)
          }
        })
      } else if (comp.type === 'stackedarea' && comp.data.series) {
        // For stacked areas, include all series values
        comp.data.series.forEach((series: any) => {
          allValues = allValues.concat(series.data)
        })
      } else if (comp.type === 'bubble' && Array.isArray(comp.data)) {
        // For bubble charts, include y values
        allValues = allValues.concat(comp.data.map((p: any) => p.y))
      } else if (comp.type === 'groupedbar' && comp.data.groups) {
        // For grouped bars, include all group values
        comp.data.groups.forEach((group: any) => {
          allValues = allValues.concat(group.values)
        })
      } else if (comp.type === 'violin' && Array.isArray(comp.data)) {
        // For violin plots, include min, max from each distribution
        comp.data.forEach((d: any) => {
          allValues.push(d.min)
          allValues.push(d.max)
        })
      }
    })
    yDomain = [d3.min(allValues) || 0, d3.max(allValues) || 100]
  }

  const y = d3.scaleLinear()
    .domain(yDomain)
    .nice()
    .range([height - margin.bottom, margin.top])

  // Debug logging for scale domains
  console.log(`[Chart] Scale domains - X: [${x.domain()}], Y: [${y.domain()}]`)
  console.log(`[Chart] Scale ranges - X: [${x.range()}], Y: [${y.range()}]`)

  // Check if we have bar charts to use categorical axis
  const hasVerticalBars = data.components.some(comp =>
    comp.type === 'bar' && comp.orientation !== 'horizontal'
  )
  const hasHorizontalBars = data.components.some(comp =>
    comp.type === 'bar' && comp.orientation === 'horizontal'
  )

  // Only add axes once
  if (!svg.select('.x-axis').node()) {
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${hasHorizontalBars ? margin.top : height - margin.bottom})`)

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`)

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
  }

  // Update axes
  if (hasVerticalBars) {
    // For vertical bar charts, use categorical x-axis
    const xRange = x.range()
    const totalWidth = xRange[1] - xRange[0]
    const categorySpacing = totalWidth / xLabels.length

    // Calculate tick positions in range (pixels), then convert to domain values
    const tickPositionsRange = xLabels.map((_, i) => xRange[0] + i * categorySpacing + categorySpacing / 2)
    const tickPositionsDomain = tickPositionsRange.map(pos => x.invert(pos))

    const xAxisGenerator = d3.axisBottom(x)
      .tickValues(tickPositionsDomain)
      .tickFormat((d, i) => String(xLabels[i]))

    svg.select<SVGGElement>('.x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxisGenerator)
      .attr('color', colors.value.text)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Nunito Sans, sans-serif')
      .style('fill', colors.value.text)
  } else if (hasHorizontalBars) {
    // For horizontal bar charts, use x-axis at top
    const xAxisGenerator = d3.axisTop(x).ticks(8)

    svg.select<SVGGElement>('.x-axis')
      .attr('transform', `translate(0,${margin.top})`)
      .call(xAxisGenerator)
      .attr('color', colors.value.text)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Nunito Sans, sans-serif')
      .style('fill', colors.value.text)
  } else {
    svg.select<SVGGElement>('.x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8))
      .attr('color', colors.value.text)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Nunito Sans, sans-serif')
      .style('fill', colors.value.text)
  }

  if (hasHorizontalBars) {
    // For horizontal bar charts, use categorical y-axis
    const yRange = y.range()
    const totalHeight = Math.abs(yRange[1] - yRange[0])
    const categorySpacing = totalHeight / xLabels.length
    const topMargin = Math.min(yRange[0], yRange[1])

    // Calculate tick positions in range (pixels), then convert to domain values
    const tickPositionsRange = xLabels.map((_, i) => topMargin + i * categorySpacing + categorySpacing / 2)
    const tickPositionsDomain = tickPositionsRange.map(pos => y.invert(pos))

    const yAxisGenerator = d3.axisLeft(y)
      .tickValues(tickPositionsDomain)
      .tickFormat((d, i) => String(xLabels[i]))

    svg.select<SVGGElement>('.y-axis')
      .call(yAxisGenerator)
      .attr('color', colors.value.text)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Nunito Sans, sans-serif')
      .style('fill', colors.value.text)
  } else {
    svg.select<SVGGElement>('.y-axis')
      .call(d3.axisLeft(y).ticks(8))
      .attr('color', colors.value.text)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Nunito Sans, sans-serif')
      .style('fill', colors.value.text)
  }

  // Update gridlines
  svg.select<SVGGElement>('.grid')
    .call(d3.axisLeft(y)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat(() => '')
    )
    .attr('color', colors.value.overlay0)
    .attr('opacity', 0.1)

  // Add axis labels if provided
  if (data.xAxisLabel) {
    let xLabel = svg.select<SVGTextElement>('.x-axis-label')
    if (xLabel.empty()) {
      xLabel = svg.append('text')
        .attr('class', 'x-axis-label')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-family', 'Nunito Sans, sans-serif')
    }
    // Position x-axis label - account for outside legends
    let xLabelY: number
    if (hasHorizontalBars) {
      // For horizontal bars, x-axis is at top
      if (props.legendPosition?.startsWith('outside-top')) {
        xLabelY = margin.top - 20  // Below legend, above plot
      } else {
        xLabelY = margin.top + 25  // Further below the axis for better spacing
      }
    } else {
      // For normal charts, x-axis is at bottom
      if (props.legendPosition?.startsWith('outside-bottom')) {
        xLabelY = height - margin.bottom + 20  // Above legend, below plot
      } else {
        xLabelY = height - 15  // Just above the bottom edge
      }
    }
    xLabel
      .attr('x', (margin.left + width - margin.right) / 2)
      .attr('y', xLabelY)
      .attr('fill', colors.value.text)
      .text(data.xAxisLabel)
  } else {
    svg.select('.x-axis-label').remove()
  }

  if (data.yAxisLabel) {
    let yLabel = svg.select<SVGTextElement>('.y-axis-label')
    if (yLabel.empty()) {
      yLabel = svg.append('text')
        .attr('class', 'y-axis-label')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-family', 'Nunito Sans, sans-serif')
    }
    // Position y-axis label - account for outside legends
    let yLabelY: number
    if (props.legendPosition === 'outside-left') {
      yLabelY = margin.left - 20  // To the right of legend
    } else {
      yLabelY = 15  // Standard position
    }
    yLabel
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + height - margin.bottom) / 2)
      .attr('y', yLabelY)
      .attr('fill', colors.value.text)
      .text(data.yAxisLabel)
  } else {
    svg.select('.y-axis-label').remove()
  }

  // Filter components based on lifetime (for legend - shows all components in current lifetime)
  const lifetimeComponents = data.components.filter(comp => {
    return comp.lifetimeStart <= stateIdx &&
           (comp.lifetimeEnd == null || comp.lifetimeEnd >= stateIdx)
  })

  // Filter components based on lifetime and visibility (for rendering)
  const activeComponents = lifetimeComponents.filter(comp => {
    return !hiddenLabels.value.has(comp.label)
  })

  const activeIds = new Set(activeComponents.map(c => c.id))

  // Remove components that are no longer active
  renderedComponents.value.forEach(id => {
    if (!activeIds.has(id)) {
      svg.selectAll(`.component-${id}`)
        .transition()
        .duration(props.animationDuration / 2)
        .style('opacity', 0)
        .remove()
      renderedComponents.value.delete(id)
    }
  })

  // Render active components
  activeComponents.forEach(comp => {
    const isNew = !renderedComponents.value.has(comp.id)

    if (comp.type === 'line') {
      renderLine(svg, comp, x, y, xLabels, isNew)
    } else if (comp.type === 'area') {
      renderArea(svg, comp, x, y, xLabels, isNew)
    } else if (comp.type === 'points') {
      renderPoints(svg, comp, x, y, isNew)
    } else if (comp.type === 'bar') {
      renderBar(svg, comp, x, y, xLabels, isNew)
    } else if (comp.type === 'histogram') {
      renderHistogram(svg, comp, x, y, isNew)
    } else if (comp.type === 'errorbar') {
      renderErrorBar(svg, comp, x, y, isNew)
    } else if (comp.type === 'boxplot') {
      renderBoxPlot(svg, comp, x, y, xLabels, isNew)
    } else if (comp.type === 'heatmap') {
      renderHeatmap(svg, comp, x, y, isNew)
    } else if (comp.type === 'stackedarea') {
      renderStackedArea(svg, comp, x, y, xLabels, isNew)
    } else if (comp.type === 'bubble') {
      renderBubble(svg, comp, x, y, isNew)
    } else if (comp.type === 'groupedbar') {
      renderGroupedBar(svg, comp, x, y, xLabels, isNew)
    } else if (comp.type === 'violin') {
      renderViolin(svg, comp, x, y, xLabels, isNew)
    }

    renderedComponents.value.add(comp.id)
  })

  // Add legend (use lifetimeComponents so hidden items still show in legend)
  updateLegend(svg, lifetimeComponents, width, height, margin)
}

const renderLine = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  // Validate data length matches xLabels length
  if (!Array.isArray(comp.data) || comp.data.length !== xLabels.length) {
    console.error(`[Chart] ${comp.id}: data length (${comp.data?.length}) doesn't match xLabels length (${xLabels.length})`)
    return
  }

  const line = d3.line<number>()
    .x((d, i) => x(xLabels[i]))
    .y(d => y(d))
    .curve(d3.curveMonotoneX)

  let path = svg.select<SVGPathElement>(`.component-${comp.id}`)

  if (path.empty()) {
    path = svg.append('path')
      .attr('class', `component-${comp.id}`)
      .attr('fill', 'none')
      .attr('stroke', mapColorToTheme(comp.color))
      .attr('stroke-width', comp.strokeWidth || 2)
  }

  // Debug logging
  const dataLength = (comp.data as number[]).length
  console.log(`[Chart] renderLine ${comp.id}: isNew=${isNew}, dataLength=${dataLength}, color=${comp.color}, strokeWidth=${comp.strokeWidth || 2}`)

  // Update stroke properties (but not path data yet)
  path
    .datum(comp.data as number[])
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', comp.strokeWidth || 2)

  // Check if this path has already been animated or is currently animating
  const hasAnimated = path.attr('data-animated') === 'true'
  const isAnimating = path.attr('data-animating') === 'true'

  if (isNew && !hasAnimated && !isAnimating) {
    // For new paths, set path data immediately then animate the drawing
    path.attr('d', line)
    const pathString = path.attr('d')
    const totalLength = path.node()?.getTotalLength() || 0
    console.log(`[Chart] ${comp.id}: path preview="${pathString?.substring(0, 50)}...", totalLength=${totalLength}`)

    // Validate path length before attempting animation
    if (totalLength === 0 || isNaN(totalLength)) {
      console.warn(`[Chart] ${comp.id}: Invalid path length (${totalLength}), skipping animation`)
      path.attr('stroke-dasharray', null).attr('data-animated', 'true')
    } else {
      console.log(`[Chart] ${comp.id}: Starting animation with dasharray="${totalLength} ${totalLength}"`)

      // Mark this path as animating
      path.attr('data-animating', 'true')

      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(props.animationDuration)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0)
        .on('end', function() {
          d3.select(this)
            .attr('stroke-dasharray', null)
            .attr('data-animating', null)
            .attr('data-animated', 'true')
        })
        .on('interrupt', function() {
          // If interrupted, still make the line visible
          d3.select(this)
            .attr('stroke-dasharray', null)
            .attr('stroke-dashoffset', null)
            .attr('data-animating', null)
            .attr('data-animated', 'true')
        })
    }
  } else if (!hasAnimated && !isAnimating) {
    // For existing paths, animate the path data change
    path
      .transition()
      .duration(props.animationDuration)
      .attr('d', line)
  }
}

const renderArea = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  const area = d3.area<number>()
    .x((d, i) => x(xLabels[i]))
    .y0((d, i) => y(comp.data.lower[i]))
    .y1((d, i) => y(comp.data.upper[i]))
    .curve(d3.curveMonotoneX)

  let path = svg.select<SVGPathElement>(`.component-${comp.id}`)

  if (path.empty()) {
    path = svg.append('path')
      .attr('class', `component-${comp.id}`)
      .attr('fill', hexToRgba(mapColorToTheme(comp.color), 0.2))
      .attr('stroke', mapColorToTheme(comp.color))
      .attr('stroke-width', comp.strokeWidth || 1)
      .style('opacity', 0)
  }

  // Debug logging
  const upperLength = (comp.data.upper as number[]).length
  const lowerLength = (comp.data.lower as number[]).length
  console.log(`[Chart] renderArea ${comp.id}: isNew=${isNew}, upperLength=${upperLength}, lowerLength=${lowerLength}, color=${comp.color}`)

  path
    .datum(comp.data.upper as number[])
    .attr('d', area)
    .attr('fill', hexToRgba(mapColorToTheme(comp.color), 0.2))
    .attr('stroke', mapColorToTheme(comp.color))

  const pathString = path.attr('d')
  console.log(`[Chart] ${comp.id}: area path preview="${pathString?.substring(0, 50)}..."`)

  if (isNew) {
    path
      .transition()
      .duration(props.animationDuration)
      .style('opacity', 1)
  } else {
    // Ensure opacity is 1 for existing components
    path.style('opacity', 1)
  }
}

const renderPoints = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  isNew: boolean
) => {
  const points = comp.data as Array<{x: number, y: number}>

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const circles = group.selectAll('circle')
    .data(points, (d: any) => `${d.x}-${d.y}`)

  // Exit old points
  circles.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .attr('r', 0)
    .remove()

  // Enter new points
  const enter = circles.enter()
    .append('circle')
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', 0)
    .attr('fill', mapColorToTheme(comp.color))
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', 1.5)

  // Update existing + entered points
  enter.merge(circles as any)
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', comp.pointSize || 5)
}

const renderBar = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  const values = comp.data as number[]
  const isHorizontal = comp.orientation === 'horizontal'

  // For bar charts, treat positions as categorical (evenly distributed)
  // not based on their numeric values
  const barPadding = 0.1  // 10% padding between bars

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const bars = group.selectAll('rect')
    .data(values.map((v, i) => ({ value: v, index: i, xLabel: xLabels[i] })), (d: any) => d.index)

  // Exit old bars
  bars.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  if (isHorizontal) {
    // Horizontal bars - categories on y-axis, values on x-axis
    const yRange = y.range()
    const totalHeight = Math.abs(yRange[1] - yRange[0])
    const barHeight = comp.barWidth || (totalHeight / values.length) * (1 - barPadding)
    const categorySpacing = totalHeight / values.length

    // Position bars categorically (evenly spaced along y-axis)
    const yPos = (i: number) => {
      const topMargin = Math.min(yRange[0], yRange[1])
      return topMargin + i * categorySpacing + (categorySpacing - barHeight) / 2
    }

    // Enter new bars
    const enter = bars.enter()
      .append('rect')
      .attr('x', x(0))
      .attr('y', (d: any) => yPos(d.index))
      .attr('width', 0)  // Start with 0 width
      .attr('height', barHeight)
      .attr('fill', mapColorToTheme(comp.color))
      .attr('stroke', mapColorToTheme(comp.color))
      .attr('stroke-width', comp.strokeWidth || 0)

    // Update existing + entered bars
    enter.merge(bars as any)
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .ease(d3.easeQuadInOut)
      .attr('x', x(0))
      .attr('y', (d: any) => yPos(d.index))
      .attr('width', (d: any) => x(d.value) - x(0))
      .attr('height', barHeight)
      .attr('fill', mapColorToTheme(comp.color))
  } else {
    // Vertical bars (default) - categories on x-axis, values on y-axis
    const xRange = x.range()
    const totalWidth = xRange[1] - xRange[0]
    const barWidth = comp.barWidth || (totalWidth / values.length) * (1 - barPadding)
    const categorySpacing = totalWidth / values.length

    // Position bars categorically (evenly spaced along x-axis)
    const xPos = (i: number) => {
      return xRange[0] + i * categorySpacing + (categorySpacing - barWidth) / 2
    }

    // Enter new bars
    const enter = bars.enter()
      .append('rect')
      .attr('x', (d: any) => xPos(d.index))
      .attr('y', y(0))  // Start at baseline
      .attr('width', barWidth)
      .attr('height', 0)  // Start with 0 height
      .attr('fill', mapColorToTheme(comp.color))
      .attr('stroke', mapColorToTheme(comp.color))
      .attr('stroke-width', comp.strokeWidth || 0)

    // Update existing + entered bars
    enter.merge(bars as any)
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .ease(d3.easeQuadInOut)
      .attr('x', (d: any) => xPos(d.index))
      .attr('y', (d: any) => y(d.value))
      .attr('width', barWidth)
      .attr('height', (d: any) => y(0) - y(d.value))
      .attr('fill', mapColorToTheme(comp.color))
  }
}

const renderHistogram = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  isNew: boolean
) => {
  const { bins, frequencies } = comp.data as { bins: number[], frequencies: number[] }
  const isHorizontal = comp.orientation === 'horizontal'

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  // Create bin data (bins array has n+1 edges for n bins)
  const binData = frequencies.map((freq, i) => ({
    x0: bins[i],
    x1: bins[i + 1],
    frequency: freq,
    index: i
  }))

  const rects = group.selectAll('rect')
    .data(binData, (d: any) => d.index)

  // Exit old bins
  rects.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  if (isHorizontal) {
    // Horizontal histogram
    // Enter new bins
    const enter = rects.enter()
      .append('rect')
      .attr('x', x(0))
      .attr('y', (d: any) => y(d.x1))  // Top edge of bin
      .attr('width', 0)  // Start with 0 width
      .attr('height', (d: any) => Math.abs(y(d.x0) - y(d.x1)))  // Bin height
      .attr('fill', mapColorToTheme(comp.color))
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 0.5)
      .attr('opacity', 0.8)

    // Update existing + entered bins
    enter.merge(rects as any)
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .ease(d3.easeQuadInOut)
      .attr('x', x(0))
      .attr('y', (d: any) => y(d.x1))
      .attr('width', (d: any) => x(d.frequency) - x(0))
      .attr('height', (d: any) => Math.abs(y(d.x0) - y(d.x1)))
      .attr('fill', mapColorToTheme(comp.color))
  } else {
    // Vertical histogram (default)
    // Enter new bins
    const enter = rects.enter()
      .append('rect')
      .attr('x', (d: any) => x(d.x0))  // Left edge of bin
      .attr('y', y(0))  // Start at baseline
      .attr('width', (d: any) => Math.abs(x(d.x1) - x(d.x0)))  // Bin width
      .attr('height', 0)  // Start with 0 height
      .attr('fill', mapColorToTheme(comp.color))
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 0.5)
      .attr('opacity', 0.8)

    // Update existing + entered bins
    enter.merge(rects as any)
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .ease(d3.easeQuadInOut)
      .attr('x', (d: any) => x(d.x0))
      .attr('y', (d: any) => y(d.frequency))
      .attr('width', (d: any) => Math.abs(x(d.x1) - x(d.x0)))
      .attr('height', (d: any) => y(0) - y(d.frequency))
      .attr('fill', mapColorToTheme(comp.color))
  }
}

const renderErrorBar = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  isNew: boolean
) => {
  const points = comp.data as Array<{
    x: number
    y: number
    error?: number
    errorUpper?: number
    errorLower?: number
  }>
  const capWidth = comp.capWidth || 8

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const errorBars = group.selectAll('g.error-bar')
    .data(points, (d: any) => `${d.x}-${d.y}`)

  // Exit old error bars
  errorBars.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  // Enter new error bars
  const enter = errorBars.enter()
    .append('g')
    .attr('class', 'error-bar')
    .style('opacity', 0)

  // Add vertical line for each error bar
  enter.append('line')
    .attr('class', 'error-line')
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', comp.strokeWidth || 1.5)

  // Add top cap
  enter.append('line')
    .attr('class', 'error-cap-top')
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', comp.strokeWidth || 1.5)

  // Add bottom cap
  enter.append('line')
    .attr('class', 'error-cap-bottom')
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', comp.strokeWidth || 1.5)

  // Update existing + entered error bars
  const merged = enter.merge(errorBars as any)

  merged
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .style('opacity', 1)

  merged.select('.error-line')
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('x1', (d: any) => x(d.x))
    .attr('x2', (d: any) => x(d.x))
    .attr('y1', (d: any) => {
      const errorUpper = d.errorUpper !== undefined ? d.errorUpper : d.error || 0
      return y(d.y + errorUpper)
    })
    .attr('y2', (d: any) => {
      const errorLower = d.errorLower !== undefined ? d.errorLower : d.error || 0
      return y(d.y - errorLower)
    })
    .attr('stroke', mapColorToTheme(comp.color))

  merged.select('.error-cap-top')
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('x1', (d: any) => x(d.x) - capWidth / 2)
    .attr('x2', (d: any) => x(d.x) + capWidth / 2)
    .attr('y1', (d: any) => {
      const errorUpper = d.errorUpper !== undefined ? d.errorUpper : d.error || 0
      return y(d.y + errorUpper)
    })
    .attr('y2', (d: any) => {
      const errorUpper = d.errorUpper !== undefined ? d.errorUpper : d.error || 0
      return y(d.y + errorUpper)
    })
    .attr('stroke', mapColorToTheme(comp.color))

  merged.select('.error-cap-bottom')
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('x1', (d: any) => x(d.x) - capWidth / 2)
    .attr('x2', (d: any) => x(d.x) + capWidth / 2)
    .attr('y1', (d: any) => {
      const errorLower = d.errorLower !== undefined ? d.errorLower : d.error || 0
      return y(d.y - errorLower)
    })
    .attr('y2', (d: any) => {
      const errorLower = d.errorLower !== undefined ? d.errorLower : d.error || 0
      return y(d.y - errorLower)
    })
    .attr('stroke', mapColorToTheme(comp.color))
}

const renderBoxPlot = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  const boxes = comp.data as Array<{
    x: number
    min: number
    q1: number
    median: number
    q3: number
    max: number
    outliers?: number[]
  }>
  const isHorizontal = comp.orientation === 'horizontal'

  // Calculate box width
  const xRange = x.range()
  const totalWidth = xRange[1] - xRange[0]
  const boxPadding = 0.3  // 30% padding between boxes
  const calculatedBoxWidth = comp.boxWidth || (totalWidth / boxes.length) * (1 - boxPadding)

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const boxGroups = group.selectAll('g.box')
    .data(boxes, (d: any) => d.x)

  // Exit old boxes
  boxGroups.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  if (isHorizontal) {
    // Horizontal box plots
    // Enter new boxes
    const enter = boxGroups.enter()
      .append('g')
      .attr('class', 'box')
      .style('opacity', 0)

    // Add box (Q1 to Q3)
    enter.append('rect')
      .attr('class', 'box-rect')
      .attr('fill', mapColorToTheme(comp.color))
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)
      .attr('opacity', 0.6)

    // Add median line
    enter.append('line')
      .attr('class', 'median-line')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', 2)

    // Add whisker lines
    enter.append('line')
      .attr('class', 'whisker-min')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    enter.append('line')
      .attr('class', 'whisker-max')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    // Add whisker caps
    enter.append('line')
      .attr('class', 'whisker-cap-min')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    enter.append('line')
      .attr('class', 'whisker-cap-max')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    // Update all boxes
    const merged = enter.merge(boxGroups as any)

    merged
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .style('opacity', 1)

    const yPos = (d: any) => y(d.x) - calculatedBoxWidth / 2

    merged.select('.box-rect')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x', (d: any) => x(d.q1))
      .attr('y', (d: any) => yPos(d))
      .attr('width', (d: any) => x(d.q3) - x(d.q1))
      .attr('height', calculatedBoxWidth)
      .attr('fill', mapColorToTheme(comp.color))

    merged.select('.median-line')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.median))
      .attr('x2', (d: any) => x(d.median))
      .attr('y1', (d: any) => yPos(d))
      .attr('y2', (d: any) => yPos(d) + calculatedBoxWidth)

    merged.select('.whisker-min')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.min))
      .attr('x2', (d: any) => x(d.q1))
      .attr('y1', (d: any) => y(d.x))
      .attr('y2', (d: any) => y(d.x))

    merged.select('.whisker-max')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.q3))
      .attr('x2', (d: any) => x(d.max))
      .attr('y1', (d: any) => y(d.x))
      .attr('y2', (d: any) => y(d.x))

    merged.select('.whisker-cap-min')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.min))
      .attr('x2', (d: any) => x(d.min))
      .attr('y1', (d: any) => yPos(d) + calculatedBoxWidth * 0.25)
      .attr('y2', (d: any) => yPos(d) + calculatedBoxWidth * 0.75)

    merged.select('.whisker-cap-max')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.max))
      .attr('x2', (d: any) => x(d.max))
      .attr('y1', (d: any) => yPos(d) + calculatedBoxWidth * 0.25)
      .attr('y2', (d: any) => yPos(d) + calculatedBoxWidth * 0.75)
  } else {
    // Vertical box plots (default)
    // Enter new boxes
    const enter = boxGroups.enter()
      .append('g')
      .attr('class', 'box')
      .style('opacity', 0)

    // Add box (Q1 to Q3)
    enter.append('rect')
      .attr('class', 'box-rect')
      .attr('fill', mapColorToTheme(comp.color))
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)
      .attr('opacity', 0.6)

    // Add median line
    enter.append('line')
      .attr('class', 'median-line')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', 2)

    // Add whisker lines
    enter.append('line')
      .attr('class', 'whisker-min')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    enter.append('line')
      .attr('class', 'whisker-max')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    // Add whisker caps
    enter.append('line')
      .attr('class', 'whisker-cap-min')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    enter.append('line')
      .attr('class', 'whisker-cap-max')
      .attr('stroke', colors.value.text)
      .attr('stroke-width', comp.strokeWidth || 1.5)

    // Update all boxes
    const merged = enter.merge(boxGroups as any)

    merged
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .style('opacity', 1)

    const xPos = (d: any) => x(d.x) - calculatedBoxWidth / 2

    merged.select('.box-rect')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x', (d: any) => xPos(d))
      .attr('y', (d: any) => y(d.q3))
      .attr('width', calculatedBoxWidth)
      .attr('height', (d: any) => y(d.q1) - y(d.q3))
      .attr('fill', mapColorToTheme(comp.color))

    merged.select('.median-line')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => xPos(d))
      .attr('x2', (d: any) => xPos(d) + calculatedBoxWidth)
      .attr('y1', (d: any) => y(d.median))
      .attr('y2', (d: any) => y(d.median))

    merged.select('.whisker-min')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.x))
      .attr('x2', (d: any) => x(d.x))
      .attr('y1', (d: any) => y(d.min))
      .attr('y2', (d: any) => y(d.q1))

    merged.select('.whisker-max')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => x(d.x))
      .attr('x2', (d: any) => x(d.x))
      .attr('y1', (d: any) => y(d.q3))
      .attr('y2', (d: any) => y(d.max))

    merged.select('.whisker-cap-min')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => xPos(d) + calculatedBoxWidth * 0.25)
      .attr('x2', (d: any) => xPos(d) + calculatedBoxWidth * 0.75)
      .attr('y1', (d: any) => y(d.min))
      .attr('y2', (d: any) => y(d.min))

    merged.select('.whisker-cap-max')
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('x1', (d: any) => xPos(d) + calculatedBoxWidth * 0.25)
      .attr('x2', (d: any) => xPos(d) + calculatedBoxWidth * 0.75)
      .attr('y1', (d: any) => y(d.max))
      .attr('y2', (d: any) => y(d.max))
  }

  // Render outliers if enabled
  if (comp.showOutliers !== false) {
    boxes.forEach((box) => {
      if (box.outliers && box.outliers.length > 0) {
        const outlierData = box.outliers.map(val => ({ x: box.x, y: val }))
        const outlierGroup = group.selectAll(`.outliers-${box.x}`)
          .data([outlierData])

        const outlierEnter = outlierGroup.enter()
          .append('g')
          .attr('class', `outliers-${box.x}`)

        const circles = outlierEnter.merge(outlierGroup as any)
          .selectAll('circle')
          .data((d: any) => d)

        circles.exit().remove()

        circles.enter()
          .append('circle')
          .attr('r', 0)
          .attr('fill', mapColorToTheme(comp.color))
          .attr('stroke', colors.value.text)
          .attr('stroke-width', 1)
          .merge(circles as any)
          .transition()
          .duration(isNew ? props.animationDuration : props.animationDuration / 2)
          .attr('cx', (d: any) => x(d.x))
          .attr('cy', (d: any) => y(d.y))
          .attr('r', 3)
      }
    })
  }
}

const renderHeatmap = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  isNew: boolean
) => {
  const { values, xCategories, yCategories } = comp.data as {
    values: number[][]
    xCategories: (string | number)[]
    yCategories: (string | number)[]
  }

  // Flatten the 2D array to cells
  const cells: Array<{ x: number, y: number, value: number }> = []
  values.forEach((row, i) => {
    row.forEach((val, j) => {
      cells.push({ x: j, y: i, value: val })
    })
  })

  // Calculate cell dimensions
  const xRange = x.range()
  const yRange = y.range()
  const cellWidth = (xRange[1] - xRange[0]) / xCategories.length
  const cellHeight = Math.abs(yRange[1] - yRange[0]) / yCategories.length

  // Create color scale
  const minVal = d3.min(cells, d => d.value) || 0
  const maxVal = d3.max(cells, d => d.value) || 1

  // Use provided colors or default gradient
  const colorScale = comp.colors && comp.colors.length >= 2
    ? d3.scaleLinear<string>()
        .domain([minVal, maxVal])
        .range([mapColorToTheme(comp.colors[0]), mapColorToTheme(comp.colors[1])])
    : d3.scaleSequential(d3.interpolateViridis)
        .domain([minVal, maxVal])

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const rects = group.selectAll('rect')
    .data(cells, (d: any) => `${d.x}-${d.y}`)

  // Exit old cells
  rects.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  // Enter new cells
  const enter = rects.enter()
    .append('rect')
    .attr('x', (d: any) => xRange[0] + d.x * cellWidth)
    .attr('y', (d: any) => yRange[1] + d.y * cellHeight)
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    .attr('fill', mapColorToTheme(comp.color))
    .attr('stroke', colors.value.overlay0)
    .attr('stroke-width', 0.5)
    .style('opacity', 0)

  // Update existing + entered cells
  enter.merge(rects as any)
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('x', (d: any) => xRange[0] + d.x * cellWidth)
    .attr('y', (d: any) => yRange[1] + d.y * cellHeight)
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    .attr('fill', (d: any) => colorScale(d.value))
    .style('opacity', 1)
}

const renderStackedArea = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  const { series } = comp.data as {
    series: Array<{ label: string, data: number[] }>
  }

  // Create stacked data
  const stackedData: Array<Array<[number, number]>> = []
  const n = series[0].data.length

  for (let i = 0; i < n; i++) {
    let cumulative = 0
    const layer: Array<[number, number]> = []

    series.forEach(s => {
      const value = s.data[i]
      layer.push([cumulative, cumulative + value])
      cumulative += value
    })

    stackedData.push(layer)
  }

  // Get colors for each series
  const seriesColors = comp.colors || series.map((_, i) => {
    const chartColors = getChartColors(series.length)
    return chartColors[i]
  })

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  // Render each series as an area
  series.forEach((s, seriesIndex) => {
    const area = d3.area<number>()
      .x((d, i) => x(xLabels[i]))
      .y0((d, i) => y(stackedData[i][seriesIndex][0]))
      .y1((d, i) => y(stackedData[i][seriesIndex][1]))
      .curve(d3.curveMonotoneX)

    let path = group.select<SVGPathElement>(`.series-${seriesIndex}`)

    if (path.empty()) {
      path = group.append('path')
        .attr('class', `series-${seriesIndex}`)
        .attr('fill', hexToRgba(mapColorToTheme(seriesColors[seriesIndex]), 0.7))
        .attr('stroke', mapColorToTheme(seriesColors[seriesIndex]))
        .attr('stroke-width', comp.strokeWidth || 1)
        .style('opacity', 0)
    }

    path
      .datum(s.data)
      .transition()
      .duration(isNew ? props.animationDuration : props.animationDuration / 2)
      .attr('d', area)
      .attr('fill', hexToRgba(mapColorToTheme(seriesColors[seriesIndex]), 0.7))
      .attr('stroke', mapColorToTheme(seriesColors[seriesIndex]))
      .style('opacity', 1)
  })
}

const renderBubble = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  isNew: boolean
) => {
  const bubbles = comp.data as Array<{x: number, y: number, r: number}>

  // Create radius scale
  const rValues = bubbles.map(d => d.r)
  const rMin = d3.min(rValues) || 1
  const rMax = d3.max(rValues) || 10
  const [rScaleMin, rScaleMax] = comp.rScale || [3, 20]

  const rScale = d3.scaleSqrt()
    .domain([rMin, rMax])
    .range([rScaleMin, rScaleMax])

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const circles = group.selectAll('circle')
    .data(bubbles, (d: any) => `${d.x}-${d.y}-${d.r}`)

  // Exit old bubbles
  circles.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .attr('r', 0)
    .remove()

  // Enter new bubbles
  const enter = circles.enter()
    .append('circle')
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', 0)
    .attr('fill', hexToRgba(mapColorToTheme(comp.color), 0.6))
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', comp.strokeWidth || 1.5)

  // Update existing + entered bubbles
  enter.merge(circles as any)
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', d => rScale(d.r))
    .attr('fill', hexToRgba(mapColorToTheme(comp.color), 0.6))
    .attr('stroke', mapColorToTheme(comp.color))
}

const renderGroupedBar = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  const { groups } = comp.data as {
    groups: Array<{ x: number, values: number[], labels: string[] }>
  }

  // Get colors for each sub-bar
  const numSeries = groups[0]?.values.length || 1
  const seriesColors = comp.colors || getChartColors(numSeries)

  // Calculate bar dimensions
  const xRange = x.range()
  const totalWidth = xRange[1] - xRange[0]
  const groupPadding = 0.2
  const groupWidth = (totalWidth / groups.length) * (1 - groupPadding)
  const barWidth = groupWidth / numSeries

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  // Flatten data for D3 binding
  const flatData: Array<{ groupX: number, seriesIndex: number, value: number }> = []
  groups.forEach(g => {
    g.values.forEach((val, i) => {
      flatData.push({ groupX: g.x, seriesIndex: i, value: val })
    })
  })

  const bars = group.selectAll('rect')
    .data(flatData, (d: any) => `${d.groupX}-${d.seriesIndex}`)

  // Exit old bars
  bars.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  // Enter new bars
  const enter = bars.enter()
    .append('rect')
    .attr('x', (d: any) => {
      const groupCenter = x(d.groupX)
      const groupStart = groupCenter - groupWidth / 2
      return groupStart + d.seriesIndex * barWidth
    })
    .attr('y', y(0))
    .attr('width', barWidth * 0.9)  // 10% gap between bars in group
    .attr('height', 0)
    .attr('fill', (d: any) => mapColorToTheme(seriesColors[d.seriesIndex]))
    .attr('stroke', colors.value.text)
    .attr('stroke-width', comp.strokeWidth || 0.5)

  // Update existing + entered bars
  enter.merge(bars as any)
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .ease(d3.easeQuadInOut)
    .attr('x', (d: any) => {
      const groupCenter = x(d.groupX)
      const groupStart = groupCenter - groupWidth / 2
      return groupStart + d.seriesIndex * barWidth
    })
    .attr('y', (d: any) => y(d.value))
    .attr('width', barWidth * 0.9)
    .attr('height', (d: any) => y(0) - y(d.value))
    .attr('fill', (d: any) => mapColorToTheme(seriesColors[d.seriesIndex]))
}

const renderViolin = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  comp: ChartComponent,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  xLabels: number[],
  isNew: boolean
) => {
  const violins = comp.data as Array<{
    x: number
    min: number
    max: number
    density: Array<{ value: number, density: number }>  // KDE points
  }>

  // Calculate violin width
  const xRange = x.range()
  const totalWidth = xRange[1] - xRange[0]
  const violinPadding = 0.3
  const maxViolinWidth = (totalWidth / violins.length) * (1 - violinPadding) / 2

  let group = svg.select<SVGGElement>(`.component-${comp.id}`)
  if (group.empty()) {
    group = svg.append('g').attr('class', `component-${comp.id}`)
  }

  const violinGroups = group.selectAll('g.violin')
    .data(violins, (d: any) => d.x)

  // Exit old violins
  violinGroups.exit()
    .transition()
    .duration(props.animationDuration / 2)
    .style('opacity', 0)
    .remove()

  // Enter new violins
  const enter = violinGroups.enter()
    .append('g')
    .attr('class', 'violin')
    .style('opacity', 0)

  // For each violin, create a path
  enter.append('path')
    .attr('class', 'violin-path')
    .attr('fill', hexToRgba(mapColorToTheme(comp.color), 0.6))
    .attr('stroke', mapColorToTheme(comp.color))
    .attr('stroke-width', comp.strokeWidth || 1.5)

  // Update all violins
  const merged = enter.merge(violinGroups as any)

  merged
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .style('opacity', 1)

  merged.select('.violin-path')
    .transition()
    .duration(isNew ? props.animationDuration : props.animationDuration / 2)
    .attr('d', (d: any) => {
      // Find max density for scaling
      const maxDensity = d3.max(d.density, (p: any) => p.density) || 1

      // Create density scale (maps density to width)
      const densityScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, maxViolinWidth])

      // Create the violin shape (mirrored area)
      const points: Array<[number, number]> = []

      // Right side (going up)
      d.density.forEach((p: any) => {
        points.push([x(d.x) + densityScale(p.density), y(p.value)])
      })

      // Left side (going down) - mirror
      for (let i = d.density.length - 1; i >= 0; i--) {
        const p = d.density[i]
        points.push([x(d.x) - densityScale(p.density), y(p.value)])
      }

      // Close the path
      return d3.line()(points as any) + 'Z'
    })
    .attr('fill', hexToRgba(mapColorToTheme(comp.color), 0.6))
    .attr('stroke', mapColorToTheme(comp.color))
}

const updateLegend = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  components: ChartComponent[],
  width: number,
  height: number,
  margin: { top: number, right: number, bottom: number, left: number }
) => {
  // Return early if legend is disabled
  if (props.legendPosition === 'none') {
    svg.select('.legend').remove()
    return
  }

  // Get unique labels
  const uniqueLabels = Array.from(new Set(components.map(c => c.label)))
  const labelToColor = new Map<string, string>()
  components.forEach(c => {
    if (!labelToColor.has(c.label)) {
      labelToColor.set(c.label, mapColorToTheme(c.color))
    }
  })

  // Calculate legend position based on prop
  const legendWidth = 200
  const legendHeight = uniqueLabels.length * 25
  const legendPadding = 10  // Padding for outside positions
  const insideLegendPadding = 15  // Padding from axes for inside positions
  let legendX = 0
  let legendY = 0

  switch (props.legendPosition) {
    // Inside positions (within plot area)
    case 'top-left':
      legendX = margin.left + insideLegendPadding
      legendY = margin.top + insideLegendPadding
      break
    case 'top-center':
    case 'top':
      legendX = (width - legendWidth) / 2
      legendY = margin.top + insideLegendPadding
      break
    case 'top-right':
      legendX = width - margin.right - legendWidth - insideLegendPadding
      legendY = margin.top + insideLegendPadding
      break
    case 'center-left':
    case 'left':
      legendX = margin.left + insideLegendPadding
      legendY = (height - legendHeight) / 2
      break
    case 'center':
      legendX = (width - legendWidth) / 2
      legendY = (height - legendHeight) / 2
      break
    case 'center-right':
    case 'right':
      legendX = width - margin.right - legendWidth - insideLegendPadding
      legendY = (height - legendHeight) / 2
      break
    case 'bottom-left':
      legendX = margin.left + insideLegendPadding
      legendY = height - margin.bottom - legendHeight - insideLegendPadding
      break
    case 'bottom-center':
    case 'bottom':
      legendX = (width - legendWidth) / 2
      legendY = height - margin.bottom - legendHeight - insideLegendPadding
      break
    case 'bottom-right':
      legendX = width - margin.right - legendWidth - insideLegendPadding
      legendY = height - margin.bottom - legendHeight - insideLegendPadding
      break

    // Outside positions (outside plot area)
    case 'outside-top-left':
      legendX = legendPadding
      legendY = legendPadding
      break
    case 'outside-top':
      legendX = (width - legendWidth) / 2
      legendY = legendPadding
      break
    case 'outside-top-right':
      legendX = width - legendWidth - legendPadding
      legendY = legendPadding
      break
    case 'outside-bottom-left':
      legendX = legendPadding
      legendY = height - legendHeight - legendPadding
      break
    case 'outside-bottom':
      legendX = (width - legendWidth) / 2
      legendY = height - legendHeight - legendPadding
      break
    case 'outside-bottom-right':
      legendX = width - legendWidth - legendPadding
      legendY = height - legendHeight - legendPadding
      break
    case 'outside-left':
      legendX = legendPadding
      legendY = (height - legendHeight) / 2
      break
    case 'outside-right':
      legendX = width - legendWidth - legendPadding
      legendY = (height - legendHeight) / 2
      break
  }

  let legend = svg.select<SVGGElement>('.legend')
  if (legend.empty()) {
    legend = svg.append('g')
      .attr('class', 'legend')
  }

  legend.attr('transform', `translate(${legendX}, ${legendY})`)

  const legendItems = legend.selectAll('.legend-item')
    .data(uniqueLabels, (d: any) => d)

  // Exit
  legendItems.exit().remove()

  // Enter
  const enter = legendItems.enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 25})`)

  enter.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', d => labelToColor.get(d) || colors.value.blue)

  enter.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .attr('fill', colors.value.text)
    .style('font-size', '13px')
    .style('font-family', 'Nunito Sans, sans-serif')
    .text(d => d)

  // Update (merge enter + existing)
  const merged = enter.merge(legendItems as any)

  // Add click handler and cursor to all legend items (both new and existing)
  merged
    .style('cursor', 'pointer')
    .on('click', (event, label) => {
      // Toggle visibility
      if (hiddenLabels.value.has(label)) {
        hiddenLabels.value.delete(label)
      } else {
        hiddenLabels.value.add(label)
      }
      // Trigger reactivity by creating new Set
      hiddenLabels.value = new Set(hiddenLabels.value)
    })

  merged
    .transition()
    .duration(300)
    .attr('transform', (d, i) => `translate(0, ${i * 25})`)

  // Update visual feedback based on hidden state
  merged.select('rect')
    .attr('fill', d => labelToColor.get(d as string) || colors.value.blue)
    .attr('opacity', d => hiddenLabels.value.has(d as string) ? 0.3 : 1)

  merged.select('text')
    .attr('fill', colors.value.text)
    .attr('opacity', d => hiddenLabels.value.has(d as string) ? 0.3 : 1)
    .style('text-decoration', d => hiddenLabels.value.has(d as string) ? 'line-through' : 'none')
}

// Legacy dataset rendering (for backward compatibility)
const createLineChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
  if (!data.labels || !data.datasets || data.datasets.length === 0) return

  const chartColors = getChartColors(data.datasets.length)

  const x = d3.scalePoint()
    .domain(data.labels as string[])
    .range([baseMargin.left, width - baseMargin.right])
    .padding(0.5)

  const allValues = data.datasets.flatMap(d => d.data as number[])
  const y = d3.scaleLinear()
    .domain([0, d3.max(allValues) || 100])
    .nice()
    .range([height - baseMargin.bottom, baseMargin.top])

  svg.append('g')
    .attr('transform', `translate(0,${height - baseMargin.bottom})`)
    .call(d3.axisBottom(x))
    .attr('color', colors.value.text)
    .selectAll('text')
    .style('font-size', '12px')
    .style('font-family', 'Nunito Sans, sans-serif')
    .style('fill', colors.value.text)

  svg.append('g')
    .attr('transform', `translate(${baseMargin.left},0)`)
    .call(d3.axisLeft(y))
    .attr('color', colors.value.text)
    .selectAll('text')
    .style('font-size', '12px')
    .style('font-family', 'Nunito Sans, sans-serif')
    .style('fill', colors.value.text)

  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${baseMargin.left},0)`)
    .call(d3.axisLeft(y)
      .tickSize(-(width - baseMargin.left - baseMargin.right))
      .tickFormat(() => '')
    )
    .attr('color', colors.value.overlay0)
    .attr('opacity', 0.1)

  // Filter visible datasets
  const visibleDatasets = data.datasets.filter(dataset => !hiddenLabels.value.has(dataset.label))

  visibleDatasets.forEach((dataset) => {
    const i = data.datasets.indexOf(dataset)
    const line = d3.line<number>()
      .x((d, idx) => x((data.labels as string[])[idx]) || 0)
      .y(d => y(d))
      .curve(d3.curveMonotoneX)

    const path = svg.append('path')
      .datum(dataset.data as number[])
      .attr('fill', 'none')
      .attr('stroke', chartColors[i])
      .attr('stroke-width', 2.5)
      .attr('d', line)

    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(props.animationDuration)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0)

    svg.selectAll(`.dot-${i}`)
      .data(dataset.data as number[])
      .enter()
      .append('circle')
      .attr('class', `dot-${i}`)
      .attr('cx', (d, idx) => x((data.labels as string[])[idx]) || 0)
      .attr('cy', d => y(d))
      .attr('r', 0)
      .attr('fill', chartColors[i])
      .transition()
      .delay((d, idx) => (idx / (dataset.data.length)) * props.animationDuration)
      .duration(200)
      .attr('r', 4)
  })

  // Create interactive legend
  // Calculate legend position based on legendPosition prop (same logic as updateLegend)
  const legendWidth = 200
  const legendHeight = data.datasets.length * 25
  const legendPadding = 10  // Padding for outside positions
  const insideLegendPadding = 15  // Padding from axes for inside positions
  let legendX = 0
  let legendY = 0

  // Return early if legend is disabled
  if (props.legendPosition !== 'none') {
    switch (props.legendPosition) {
      // Inside positions (within plot area)
      case 'top-left':
        legendX = baseMargin.left + insideLegendPadding
        legendY = baseMargin.top + insideLegendPadding
        break
      case 'top-center':
      case 'top':
        legendX = (width - legendWidth) / 2
        legendY = baseMargin.top + insideLegendPadding
        break
      case 'top-right':
        legendX = width - baseMargin.right - legendWidth - insideLegendPadding
        legendY = baseMargin.top + insideLegendPadding
        break
      case 'center-left':
      case 'left':
        legendX = baseMargin.left + insideLegendPadding
        legendY = (height - legendHeight) / 2
        break
      case 'center':
        legendX = (width - legendWidth) / 2
        legendY = (height - legendHeight) / 2
        break
      case 'center-right':
      case 'right':
      default:
        legendX = width - baseMargin.right - legendWidth - insideLegendPadding
        legendY = (height - legendHeight) / 2
        break
      case 'bottom-left':
        legendX = baseMargin.left + insideLegendPadding
        legendY = height - baseMargin.bottom - legendHeight - insideLegendPadding
        break
      case 'bottom-center':
      case 'bottom':
        legendX = (width - legendWidth) / 2
        legendY = height - baseMargin.bottom - legendHeight - insideLegendPadding
        break
      case 'bottom-right':
        legendX = width - baseMargin.right - legendWidth - insideLegendPadding
        legendY = height - baseMargin.bottom - legendHeight - insideLegendPadding
        break

      // Outside positions (outside plot area)
      case 'outside-top-left':
        legendX = legendPadding
        legendY = legendPadding
        break
      case 'outside-top':
        legendX = (width - legendWidth) / 2
        legendY = legendPadding
        break
      case 'outside-top-right':
        legendX = width - legendWidth - legendPadding
        legendY = legendPadding
        break
      case 'outside-bottom-left':
        legendX = legendPadding
        legendY = height - legendHeight - legendPadding
        break
      case 'outside-bottom':
        legendX = (width - legendWidth) / 2
        legendY = height - legendHeight - legendPadding
        break
      case 'outside-bottom-right':
        legendX = width - legendWidth - legendPadding
        legendY = height - legendHeight - legendPadding
        break
      case 'outside-left':
        legendX = legendPadding
        legendY = (height - legendHeight) / 2
        break
      case 'outside-right':
        legendX = width - legendWidth - legendPadding
        legendY = (height - legendHeight) / 2
        break
    }

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`)

      data.datasets.forEach((dataset, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 25})`)
          .style('cursor', 'pointer')
          .on('click', () => {
            // Toggle visibility
            if (hiddenLabels.value.has(dataset.label)) {
              hiddenLabels.value.delete(dataset.label)
            } else {
              hiddenLabels.value.add(dataset.label)
            }
            // Trigger reactivity by creating new Set
            hiddenLabels.value = new Set(hiddenLabels.value)
          })

        legendRow.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', chartColors[i])
          .attr('opacity', hiddenLabels.value.has(dataset.label) ? 0.3 : 1)

        legendRow.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .attr('fill', colors.value.text)
          .attr('opacity', hiddenLabels.value.has(dataset.label) ? 0.3 : 1)
          .style('font-size', '13px')
          .style('font-family', 'Nunito Sans, sans-serif')
          .style('text-decoration', hiddenLabels.value.has(dataset.label) ? 'line-through' : 'none')
          .text(dataset.label)
      })
  }
}

const createChart = (clearAll = false) => {
  if (!svgRef.value || !containerRef.value || !chartData.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // If container has no dimensions yet, retry after a short delay
  if (width === 0 || height === 0) {
    setTimeout(() => createChart(clearAll), 50)
    return
  }

  const svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  if (clearAll) {
    svg.selectAll('*').remove()
    renderedComponents.value.clear()
  }

  // Use component-based rendering if components are present
  if (chartData.value.components) {
    renderComponentBased(svg, chartData.value, width, height)
  } else if (chartData.value.datasets) {
    // Legacy dataset format - always re-render when clearAll is true
    if (clearAll) {
      createLineChart(svg, chartData.value, width, height)
    }
  }
}

watch(chartData, async (newData) => {
  if (newData) {
    if (newData.currentState !== undefined) {
      currentStateIndex.value = newData.currentState
    }
    await nextTick()
    createChart(false)  // Incremental update
  }
})

watch(isDark, () => {
  createChart(true)  // Full redraw on theme change
})

watch(hiddenLabels, () => {
  // For component-based charts, use incremental update
  // For legacy dataset-based charts, need full redraw
  const needsFullRedraw = chartData.value?.datasets && !chartData.value?.components
  createChart(needsFullRedraw)
}, { deep: true })

onMounted(async () => {
  await loadData()
  await nextTick()
  createChart(true)

  // Setup ResizeObserver to handle container size changes
  if (containerRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      createChart(true)
    })
    resizeObserver.value.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

defineExpose({
  updateData: async (newData: ChartData) => {
    // Validate new data before updating
    const validation = validateChartDataSync(newData)
    if (!validation.valid) {
      validationErrors.value = validation.errors
      console.error('[Chart] updateData validation errors:', validation.errors)
      error.value = `Chart data validation failed: ${validation.errors[0]}`
      return
    }

    const wasEmpty = !chartData.value || !chartData.value.components || chartData.value.components.length === 0
    chartData.value = newData
    if (newData.currentState !== undefined) {
      currentStateIndex.value = newData.currentState
    }
    await nextTick()
    // Full render if this is the first data or going to state 0, otherwise incremental
    const shouldClearAll = wasEmpty || newData.currentState === 0
    createChart(shouldClearAll)
  }
})
</script>

<template>
  <div class="chart-outer" :style="{ height: typeof height === 'number' ? `${height}px` : height }">
    <div class="chart-wrapper">
      <div v-if="loading" class="chart-loading">
        <div class="spinner"></div>
        <p>Loading chart data...</p>
      </div>

      <div v-else-if="error" class="chart-error">
        <p>{{ error }}</p>
        <div v-if="validationErrors.length > 0" class="validation-errors">
          <p><strong>Validation Errors:</strong></p>
          <ul>
            <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-else class="chart-container" ref="containerRef">
        <svg ref="svgRef"></svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-outer {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0.25rem;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.chart-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

svg {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--c-text);
}

.chart-error {
  color: var(--c-red);
}

.chart-error p {
  margin: 0;
  padding: 1rem;
  background-color: color-mix(in srgb, var(--c-red) 20%, transparent);
  border: 1px solid var(--c-red);
  border-radius: 0.375rem;
}

.validation-errors {
  margin-top: 1rem;
  padding: 1rem;
  background-color: color-mix(in srgb, var(--c-yellow) 10%, transparent);
  border: 1px solid var(--c-yellow);
  border-radius: 0.375rem;
  text-align: left;
  max-width: 600px;
}

.validation-errors ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.validation-errors li {
  margin: 0.25rem 0;
  font-size: 0.9em;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--c-surface0);
  border-top-color: var(--c-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
