// Chart data validation utilities

export function useChartValidation() {

  const validateComponent = (comp: any, xLabelsLength: number) => {
    const errors: string[] = []

    // Validate component has required fields
    if (!comp.id) errors.push(`Component missing id`)
    if (!comp.type) errors.push(`Component ${comp.id || 'unknown'} missing type`)
    if (!comp.label) errors.push(`Component ${comp.id || 'unknown'} missing label`)
    if (!comp.color) errors.push(`Component ${comp.id || 'unknown'} missing color`)
    if (comp.lifetimeStart === undefined) errors.push(`Component ${comp.id || 'unknown'} missing lifetimeStart`)

    // Validate data based on type
    if (comp.type === 'line') {
      if (!Array.isArray(comp.data)) {
        errors.push(`Component ${comp.id}: line data must be an array`)
      } else if (comp.data.length !== xLabelsLength) {
        errors.push(`Component ${comp.id}: line data length (${comp.data.length}) doesn't match xLabels length (${xLabelsLength})`)
      } else if (!comp.data.every((v: any) => typeof v === 'number')) {
        errors.push(`Component ${comp.id}: line data must contain only numbers`)
      }
    } else if (comp.type === 'area') {
      if (!comp.data || typeof comp.data !== 'object') {
        errors.push(`Component ${comp.id}: area data must be an object with upper and lower arrays`)
      } else {
        if (!Array.isArray(comp.data.upper)) {
          errors.push(`Component ${comp.id}: area data.upper must be an array`)
        } else if (comp.data.upper.length !== xLabelsLength) {
          errors.push(`Component ${comp.id}: area data.upper length (${comp.data.upper.length}) doesn't match xLabels length (${xLabelsLength})`)
        }

        if (!Array.isArray(comp.data.lower)) {
          errors.push(`Component ${comp.id}: area data.lower must be an array`)
        } else if (comp.data.lower.length !== xLabelsLength) {
          errors.push(`Component ${comp.id}: area data.lower length (${comp.data.lower.length}) doesn't match xLabels length (${xLabelsLength})`)
        }

        if (Array.isArray(comp.data.upper) && Array.isArray(comp.data.lower) && comp.data.upper.length !== comp.data.lower.length) {
          errors.push(`Component ${comp.id}: area data.upper and data.lower must have the same length`)
        }
      }
    } else if (comp.type === 'points') {
      if (!Array.isArray(comp.data)) {
        errors.push(`Component ${comp.id}: points data must be an array`)
      } else {
        const invalidPoints = comp.data.filter((p: any) =>
          typeof p !== 'object' || typeof p.x !== 'number' || typeof p.y !== 'number'
        )
        if (invalidPoints.length > 0) {
          errors.push(`Component ${comp.id}: points data must be array of {x, y} objects`)
        }
      }
    }

    return errors
  }

  const validateChartDataSync = (data: any) => {
    const errors: string[] = []

    // Validate required fields
    if (!data.components && !data.datasets) {
      errors.push('ChartData must have either components or datasets')
    }

    if (data.components) {
      if (!Array.isArray(data.components)) {
        errors.push('ChartData.components must be an array')
      }

      if (!data.labels) {
        errors.push('ChartData with components must have labels array')
      } else if (!Array.isArray(data.labels)) {
        errors.push('ChartData.labels must be an array')
      } else {
        // Validate each component
        data.components.forEach((comp: any) => {
          const compErrors = validateComponent(comp, data.labels.length)
          errors.push(...compErrors)
        })
      }

      // Validate ranges if provided
      if (data.xRange) {
        if (!Array.isArray(data.xRange) || data.xRange.length !== 2) {
          errors.push('ChartData.xRange must be an array of 2 numbers')
        } else if (data.xRange[0] >= data.xRange[1]) {
          errors.push('ChartData.xRange[0] must be less than xRange[1]')
        }
      }

      if (data.yRange) {
        if (!Array.isArray(data.yRange) || data.yRange.length !== 2) {
          errors.push('ChartData.yRange must be an array of 2 numbers')
        } else if (data.yRange[0] >= data.yRange[1]) {
          errors.push('ChartData.yRange[0] must be less than yRange[1]')
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Alias for backwards compatibility - validateChartData now uses sync validation
  const validateChartData = validateChartDataSync

  return {
    validateChartData,
    validateChartDataSync,
    validateComponent
  }
}
