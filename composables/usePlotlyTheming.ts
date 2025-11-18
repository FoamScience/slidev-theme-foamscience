import { computed } from 'vue'
import { useChartTheming } from './useChartTheming'

/**
 * Composable for Plotly.js theming with Catppuccin colors
 * Provides reactive layout and config objects for Plotly charts
 * that automatically adapt to light/dark mode
 */
export function usePlotlyTheming() {
  // Reuse existing chart theming composable for colors
  const { colors, isDark } = useChartTheming()

  /**
   * Base Plotly layout with Catppuccin theming
   * Includes styling for background, text, axes, and legend
   */
  const plotlyLayout = computed(() => ({
    // Background colors
    paper_bgcolor: colors.value.base,
    plot_bgcolor: colors.value.mantle,

    // Compact margins for tighter layout
    margin: {
      l: 60,    // left margin (for y-axis labels)
      r: 20,    // right margin
      t: 60,    // top margin (for title)
      b: 50,    // bottom margin (for x-axis labels)
      pad: 0    // padding between plot and axis labels
    },

    // Font configuration
    font: {
      family: 'Nunito Sans, sans-serif',
      size: 14,
      color: colors.value.text
    },

    // X-axis styling
    xaxis: {
      gridcolor: colors.value.overlay0,
      linecolor: colors.value.overlay0,
      zerolinecolor: colors.value.surface1,
      tickfont: {
        color: colors.value.text
      },
      titlefont: {
        color: colors.value.text
      }
    },

    // Y-axis styling
    yaxis: {
      gridcolor: colors.value.overlay0,
      linecolor: colors.value.overlay0,
      zerolinecolor: colors.value.surface1,
      tickfont: {
        color: colors.value.text
      },
      titlefont: {
        color: colors.value.text
      }
    },

    // Legend styling
    legend: {
      bgcolor: 'transparent',
      bordercolor: colors.value.surface0,
      borderwidth: 1,
      font: {
        color: colors.value.text
      }
    },

    // Title styling
    title: {
      font: {
        color: colors.value.text,
        size: 18
      }
    },

    // Hover label styling
    hoverlabel: {
      bgcolor: colors.value.surface0,
      bordercolor: colors.value.overlay0,
      font: {
        family: 'Nunito Sans, sans-serif',
        color: colors.value.text
      }
    },

    // Colorway for traces (using Catppuccin accent colors)
    colorway: [
      colors.value.blue,
      colors.value.red,
      colors.value.green,
      colors.value.yellow,
      colors.value.mauve,
      colors.value.teal,
      colors.value.peach,
      colors.value.pink,
      colors.value.flamingo,
      colors.value.maroon,
      colors.value.sky,
      colors.value.sapphire,
      colors.value.lavender,
      colors.value.rosewater
    ]
  }))

  /**
   * Plotly config options
   * Configures mode bar, responsiveness, and interaction
   */
  const plotlyConfig = computed(() => ({
    // Make plot responsive to container size
    responsive: true,

    // Display mode bar on hover
    displayModeBar: true,

    // Mode bar position
    modeBarButtonsToRemove: ['sendDataToCloud'],

    // Remove Plotly logo
    displaylogo: false,

    // Mode bar styling
    modeBarStyle: {
      bgcolor: colors.value.mantle,
      color: colors.value.text,
      activecolor: colors.value.blue
    },

    // Locale
    locale: 'en',

    // Double-click behavior
    doubleClick: 'reset' as const,

    // Scroll zoom
    scrollZoom: false
  }))

  /**
   * Helper function to get Plotly colors for multi-series data
   * @param count Number of colors needed
   * @returns Array of hex color strings
   */
  const getPlotlyColors = (count: number): string[] => {
    const colorArray = [
      colors.value.blue,
      colors.value.red,
      colors.value.green,
      colors.value.yellow,
      colors.value.mauve,
      colors.value.teal,
      colors.value.peach,
      colors.value.pink,
      colors.value.flamingo,
      colors.value.maroon,
      colors.value.sky,
      colors.value.sapphire,
      colors.value.lavender,
      colors.value.rosewater
    ]

    // Repeat colors if needed
    const result: string[] = []
    for (let i = 0; i < count; i++) {
      result.push(colorArray[i % colorArray.length])
    }

    return result
  }

  /**
   * Deep merge helper for combining user layout with themed layout
   * @param target Base layout object
   * @param source User-provided layout overrides
   * @returns Merged layout object
   */
  const deepMerge = (target: any, source: any): any => {
    const output = { ...target }

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] })
          } else {
            output[key] = deepMerge(target[key], source[key])
          }
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }

    return output
  }

  /**
   * Check if value is a plain object
   */
  const isObject = (item: any): boolean => {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  return {
    plotlyLayout,
    plotlyConfig,
    colors,
    isDark,
    getPlotlyColors,
    deepMerge
  }
}
