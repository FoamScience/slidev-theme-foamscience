import { defineKatexSetup } from '@slidev/types'

export default defineKatexSetup(() => {
  return {
    // Enable trust for HTML commands used in cross-references
    trust: (context: any) => ['\\htmlId', '\\href'].includes(context.command),

    // Keep macros globally for cross-slide references
    globalGroup: true,

    // Custom macros for equation referencing
    macros: {
      // \eqref{label} - creates clickable reference like (1)
      "\\eqref": "\\href{###1}{(\\text{#1})}",

      // \ref{label} - creates clickable reference without parentheses
      "\\ref": "\\href{###1}{\\text{#1}}",

      // \label{id} - creates anchor point for references
      "\\label": "\\htmlId{#1}{}"
    }
  }
})
