import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    })
  ],
  theme: {
    colors: {
      // Base Catppuccin colors (CSS variables)
      base: 'var(--c-base)',
      mantle: 'var(--c-mantle)',
      crust: 'var(--c-crust)',

      // Text colors
      text: 'var(--c-text)',
      subtext0: 'var(--c-subtext0)',
      subtext1: 'var(--c-subtext1)',

      // Overlay colors
      overlay0: 'var(--c-overlay0)',
      overlay1: 'var(--c-overlay1)',
      overlay2: 'var(--c-overlay2)',

      // Surface colors
      surface0: 'var(--c-surface0)',
      surface1: 'var(--c-surface1)',
      surface2: 'var(--c-surface2)',

      // Accent colors
      blue: 'var(--c-blue)',
      lavender: 'var(--c-lavender)',
      sapphire: 'var(--c-sapphire)',
      sky: 'var(--c-sky)',
      teal: 'var(--c-teal)',
      green: 'var(--c-green)',
      yellow: 'var(--c-yellow)',
      peach: 'var(--c-peach)',
      maroon: 'var(--c-maroon)',
      red: 'var(--c-red)',
      mauve: 'var(--c-mauve)',
      pink: 'var(--c-pink)',
      flamingo: 'var(--c-flamingo)',
      rosewater: 'var(--c-rosewater)'
    }
  },
  safelist: [
    // Background colors
    'bg-base', 'bg-mantle', 'bg-crust', 'bg-surface0', 'bg-surface1', 'bg-surface2',
    'bg-blue', 'bg-sapphire', 'bg-transparent', 'bg-overlay1', 'bg-green',
    'bg-surface0/50', 'bg-mantle/90', 'bg-green/10',

    // Text colors
    'text-text', 'text-subtext0', 'text-subtext1', 'text-blue', 'text-base', 'text-crust', 'text-green',

    // Border colors
    'border-surface0', 'border-blue', 'border-green', 'border-transparent', 'border-overlay0', 'border-overlay1',
    'border', 'border-b', 'border-b-2', 'border-t', 'border-t-0', 'border-t-2',
    'border-l', 'border-l-2', 'border-r', 'border-r-2', 'border-2',

    // Layout & flexbox
    'flex', 'flex-1', 'flex-wrap', 'flex-col', 'flex-initial',
    'items-center', 'justify-between', 'justify-center', 'self-baseline',
    'grid', 'relative', 'absolute', 'overflow-hidden', 'overflow-auto',
    'inline-block', 'inline-flex',
    'order-1', 'order-2',

    // Spacing
    'p-0', 'p-1', 'p-2', 'p-4', 'p-5',
    'px-2', 'px-3', 'px-4', 'px-6',
    'py-1', 'py-2', 'py-3', 'py-5',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4',
    'mr-2', 'ml-[-0.75rem]', 'mt-2', 'mt-4',
    'm-0', 'mx-auto', 'mx-4', 'my-0', 'my-5',
    '-mb-[2px]',
    'gap-2', 'gap-3',

    // Sizing
    'w-full', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-12', 'w-px', 'w-[2px]', 'w-[3px]',
    'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-12', 'h-[2px]',
    'min-h-full', 'min-h-[70px]',
    'max-h-0', 'max-h-[1000px]',

    // Positioning
    'top-0', 'left-0', 'left-1/2', 'bottom-[-1.5rem]',

    // Effects
    'rounded-md', 'rounded-lg', 'rounded-full', 'rounded-t-lg', 'rounded-b-md', 'rounded-b-lg',
    'rounded-tr-md', 'rounded-tl-md',
    'shadow-sm', 'shadow-xl',
    'cursor-pointer', 'cursor-not-allowed',
    'hover:bg-surface0', 'hover:bg-surface1', 'hover:bg-sapphire', 'hover:bg-surface0/50',
    'hover:text-text', 'hover:text-blue', 'hover:scale-110', 'hover:border-blue', 'hover:border-overlay0',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-blue', 'focus:ring-offset-2',
    'ring-2', 'ring-blue', 'ring-offset-2', 'ring-offset-1',
    'backdrop-blur',
    'transform', 'scale-110', 'scale-0.995', '-translate-x-1/2',
    'opacity-0', 'opacity-0.7', 'opacity-50',
    'pointer-events-none',
    'italic',
    'rotate-90',
    'font-500',
    'block', 'hidden',

    // Pseudo-elements
    'before:content-[\'\']', 'before:block', 'before:absolute', 'before:left-0', 'before:top-1/2',
    'before:left-1/2', 'before:top-0', 'before:right-0', 'before:w-full', 'before:w-0', 'before:h-5',
    'before:min-h-full', 'before:border-t-2', 'before:border-l-2', 'before:border-2',
    'before:border-blue', 'before:transform', 'before:-translate-x-1/2',

    // Transitions
    'transition-all', 'transition-colors', 'transition',
    'duration-200', 'duration-300', 'duration-150',
    'ease-in-out', 'ease-in', 'ease-out',

    // Typography
    'font-semibold', 'font-medium',
    'text-sm', 'text-base', 'text-lg', 'text-xl',
    'text-left', 'text-center',
    'leading-none',

    // Lists
    'list-none',

    // Table
    'border-spacing-0', 'border-separate',
    'align-top',

    // Positioning & layout
    'z-2', 'z-10',
    'grow'
  ]
})
