import { defineMermaidSetup } from '@slidev/types'

// Helper function to get CSS variable value
function getCSSVar(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

// Build Catppuccin theme from CSS variables
export default defineMermaidSetup(() => {
  // Detect current theme
  const isDark = document.documentElement.classList.contains('dark')

  // Get font from document
  const htmlStyle = window.getComputedStyle(document.documentElement)
  const fontFamily = htmlStyle.fontFamily || 'ui-sans-serif, system-ui, sans-serif'

  // For git branch labels, we need high contrast text colors
  // Use crust (dark) for light mode, and base (light) for dark mode
  // This ensures good readability on colored backgrounds
  const gitLabelColor = isDark ? getCSSVar('--c-base') : getCSSVar('--c-crust')

  return {
    theme: 'base',
    themeVariables: {
      primaryColor: getCSSVar('--c-blue'),
      primaryTextColor: getCSSVar('--c-text'),
      primaryBorderColor: getCSSVar('--c-lavender'),
      lineColor: getCSSVar('--c-subtext1'),
      secondaryColor: getCSSVar('--c-green'),
      tertiaryColor: getCSSVar('--c-yellow'),
      background: 'transparent',
      mainBkg: 'transparent',
      secondBkg: getCSSVar('--c-mantle'),
      tertiaryBkg: getCSSVar('--c-crust'),
      textColor: getCSSVar('--c-text'),
      border1: getCSSVar('--c-subtext1'),
      border2: getCSSVar('--c-subtext0'),
      noteBkgColor: getCSSVar('--c-mantle'),
      noteTextColor: getCSSVar('--c-text'),
      noteBorderColor: getCSSVar('--c-subtext1'),
      arrowheadColor: getCSSVar('--c-text'),
      fontFamily: fontFamily,
      fontSize: '16px',
      labelBackground: getCSSVar('--c-mantle'),
      nodeTextColor: getCSSVar('--c-text'),
      edgeLabelBackground: getCSSVar('--c-base'),
      clusterBkg: getCSSVar('--c-crust'),
      clusterBorder: getCSSVar('--c-subtext1'),
      defaultLinkColor: getCSSVar('--c-text'),
      titleColor: getCSSVar('--c-text'),
      actorBkg: getCSSVar('--c-mantle'),
      actorBorder: getCSSVar('--c-subtext1'),
      actorTextColor: getCSSVar('--c-text'),
      actorLineColor: getCSSVar('--c-text'),
      signalColor: getCSSVar('--c-text'),
      signalTextColor: getCSSVar('--c-text'),
      labelBoxBkgColor: getCSSVar('--c-mantle'),
      labelBoxBorderColor: getCSSVar('--c-subtext1'),
      labelTextColor: getCSSVar('--c-text'),
      loopTextColor: getCSSVar('--c-text'),
      activationBorderColor: getCSSVar('--c-subtext1'),
      activationBkgColor: getCSSVar('--c-mantle'),
      // Git branch label colors (text on branch backgrounds)
      // Using high contrast colors for readability on colored backgrounds
      gitBranchLabel0: gitLabelColor,
      gitBranchLabel1: gitLabelColor,
      gitBranchLabel2: gitLabelColor,
      gitBranchLabel3: gitLabelColor,
      gitBranchLabel4: gitLabelColor,
      gitBranchLabel5: gitLabelColor,
      gitBranchLabel6: gitLabelColor,
      gitBranchLabel7: gitLabelColor,
      // Git branch colors (backgrounds) - using Catppuccin accent colors
      git0: getCSSVar('--c-blue'),      // Main branch - blue
      git1: getCSSVar('--c-green'),     // Feature branch - green
      git2: getCSSVar('--c-mauve'),     // Development branch - mauve
      git3: getCSSVar('--c-peach'),     // Hotfix branch - peach
      git4: getCSSVar('--c-yellow'),    // Release branch - yellow
      git5: getCSSVar('--c-teal'),      // Experimental branch - teal
      git6: getCSSVar('--c-pink'),      // Support branch - pink
      git7: getCSSVar('--c-lavender'),  // Additional branch - lavender
      // Git tag colors
      tagLabelColor: gitLabelColor,                    // Tag text color (high contrast)
      tagLabelBackground: getCSSVar('--c-peach'),      // Tag background (peach for release tags)
      tagLabelBorder: getCSSVar('--c-maroon'),         // Tag border color
      tagLabelFontSize: '10px',                         // Tag font size
    }
  }
})
