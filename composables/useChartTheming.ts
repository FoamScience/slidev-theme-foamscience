import { computed } from 'vue'
import { useDarkMode } from '@slidev/client'

export interface ChartColors {
  blue: string
  red: string
  green: string
  yellow: string
  mauve: string
  teal: string
  peach: string
  pink: string
  flamingo: string
  maroon: string
  sky: string
  sapphire: string
  lavender: string
  rosewater: string
  text: string
  subtext0: string
  subtext1: string
  surface0: string
  surface1: string
  surface2: string
  overlay0: string
  overlay1: string
  base: string
  mantle: string
}

export function useChartTheming() {
  const { isDark } = useDarkMode()

  const colors = computed<ChartColors>(() => {
    if (isDark.value) {
      // Catppuccin Mocha (Dark)
      return {
        blue: '#89b4fa',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        mauve: '#cba6f7',
        teal: '#94e2d5',
        peach: '#fab387',
        pink: '#f5c2e7',
        flamingo: '#f2cdcd',
        maroon: '#eba0ac',
        sky: '#89dceb',
        sapphire: '#74c7ec',
        lavender: '#b4befe',
        rosewater: '#f5e0dc',
        text: '#cdd6f4',
        subtext0: '#a6adc8',
        subtext1: '#bac2de',
        surface0: '#313244',
        surface1: '#45475a',
        surface2: '#585b70',
        overlay0: '#6c7086',
        overlay1: '#7f849c',
        base: '#1e1e2e',
        mantle: '#181825'
      }
    } else {
      // Catppuccin Latte (Light)
      return {
        blue: '#1e66f5',
        red: '#d20f39',
        green: '#40a02b',
        yellow: '#df8e1d',
        mauve: '#8839ef',
        teal: '#179299',
        peach: '#fe640b',
        pink: '#ea76cb',
        flamingo: '#dd7878',
        maroon: '#e64553',
        sky: '#04a5e5',
        sapphire: '#209fb5',
        lavender: '#7287fd',
        rosewater: '#dc8a78',
        text: '#4c4f69',
        subtext0: '#6c6f85',
        subtext1: '#5c5f77',
        surface0: '#ccd0da',
        surface1: '#bcc0cc',
        surface2: '#acb0be',
        overlay0: '#9ca0b0',
        overlay1: '#8c8fa1',
        base: '#eff1f5',
        mantle: '#e6e9ef'
      }
    }
  })

  const getChartColors = (count: number): string[] => {
    const palette = [
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

    const result: string[] = []
    for (let i = 0; i < count; i++) {
      result.push(palette[i % palette.length])
    }
    return result
  }

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return {
    colors,
    isDark,
    getChartColors,
    hexToRgba
  }
}
