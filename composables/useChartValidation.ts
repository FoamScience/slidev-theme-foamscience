import * as yup from 'yup'

// Validation schemas for chart data structures

const pointSchema = yup.object({
  x: yup.number().required(),
  y: yup.number().required(),
  r: yup.number().optional()
})

const areaDataSchema = yup.object({
  upper: yup.array().of(yup.number().required()).required(),
  lower: yup.array().of(yup.number().required()).required()
}).test('matching-lengths', 'Upper and lower arrays must have the same length', function(value) {
  if (!value) return true
  return value.upper.length === value.lower.length
})

const componentSchema = yup.object({
  id: yup.string().required(),
  type: yup.string().oneOf(['line', 'area', 'points', 'bar', 'histogram', 'errorbar', 'boxplot', 'heatmap', 'stackedarea', 'bubble', 'groupedbar', 'violin']).required(),
  label: yup.string().required(),
  data: yup.mixed().required(),
  color: yup.string().required(),
  strokeWidth: yup.number().optional(),
  showPoints: yup.boolean().optional(),
  pointSize: yup.number().optional(),
  lifetimeStart: yup.number().required(),
  lifetimeEnd: yup.number().nullable().optional()
})

const chartDataSchema = yup.object({
  labels: yup.array().of(yup.mixed()).optional(),
  components: yup.array().of(componentSchema).optional(),
  currentState: yup.number().optional(),
  xRange: yup.array().of(yup.number()).length(2).optional(),
  yRange: yup.array().of(yup.number()).length(2).optional(),
  xAxisLabel: yup.string().optional(),
  yAxisLabel: yup.string().optional()
})

export function useChartValidation() {
  const validateChartData = async (data: any) => {
    try {
      await chartDataSchema.validate(data, { abortEarly: false })
      return { valid: true, errors: [] }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return {
          valid: false,
          errors: err.errors
        }
      }
      return {
        valid: false,
        errors: ['Unknown validation error']
      }
    }
  }

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

  return {
    validateChartData,
    validateChartDataSync,
    validateComponent
  }
}
