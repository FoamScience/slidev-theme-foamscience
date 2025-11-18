import { ref, computed } from 'vue'

interface EquationEntry {
  id: string
  number: number
  slideNumber?: number
}

const equations = ref<Map<string, EquationEntry>>(new Map())
const equationOrder = ref<string[]>([])
const equationCounter = ref(0)

export function useEquations() {
  const registerEquation = (label?: string, slideNumber?: number): number => {
    equationCounter.value++
    const currentNumber = equationCounter.value

    if (label) {
      equations.value.set(label, {
        id: label,
        number: currentNumber,
        slideNumber
      })

      // Track order for consistent numbering
      if (!equationOrder.value.includes(label)) {
        equationOrder.value.push(label)
      }
    }

    return currentNumber
  }

  const getEquationNumber = (label: string): number | undefined => {
    return equations.value.get(label)?.number
  }

  const formatReference = (label: string): string => {
    const num = getEquationNumber(label)
    return num !== undefined ? `(${num})` : '(?)'
  }

  const resetEquations = () => {
    equations.value.clear()
    equationOrder.value = []
    equationCounter.value = 0
  }

  return {
    registerEquation,
    getEquationNumber,
    formatReference,
    resetEquations,
    equations: computed(() => equations.value),
    equationCounter: computed(() => equationCounter.value)
  }
}
