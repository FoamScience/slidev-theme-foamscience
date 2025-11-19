import { ref, computed } from 'vue'

interface BibEntry {
  id: string
  type: string
  title: string
  author?: Array<{ given?: string; family?: string; literal?: string }> | string
  year?: number | string
  issued?: { 'date-parts': number[][] }
  'container-title'?: string
  journal?: string
  booktitle?: string
  publisher?: string
  'publisher-place'?: string
  URL?: string
  url?: string
  DOI?: string
  doi?: string
  [key: string]: any
}

const bibData = ref<Map<string, BibEntry>>(new Map())
const citations = ref<Set<string>>(new Set())
const bibFileLoaded = ref(false)

export function useBibliography() {
  const loadJsonFile = async (jsonContent: string | object) => {
    try {
      // Parse JSON content if it's a string
      const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent

      // Create a new Map to trigger reactivity
      const newBibData = new Map<string, BibEntry>()

      // Handle both array and object formats
      let entries: BibEntry[]
      if (Array.isArray(data)) {
        entries = data
      } else if (typeof data === 'object') {
        // If it's an object with entry keys, convert to array
        entries = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }))
      } else {
        throw new Error('Invalid JSON format')
      }

      entries.forEach((entry) => {
        // Handle both "id" and "ID" (bib2json uses uppercase "ID")
        const id = entry.id || (entry as any).ID
        if (id) {
          // Normalize to lowercase "id" for consistency
          entry.id = id
          newBibData.set(id, entry)
        }
      })

      // Replace the entire Map to trigger reactivity
      bibData.value = newBibData
      bibFileLoaded.value = true
      return true
    } catch (error) {
      console.error('Error parsing JSON bibliography file:', error)
      return false
    }
  }

  const loadJsonFromUrl = async (url: string) => {
    try {
      const response = await fetch(url)
      const content = await response.json()
      return await loadJsonFile(content)
    } catch (error) {
      console.error('Error loading JSON bibliography file from URL:', error)
      return false
    }
  }

  const addCitation = (key: string) => {
    // Always add to citations set, even if bibData isn't loaded yet
    // This ensures citations are tracked in the order they appear
    const newSet = new Set(citations.value)
    newSet.add(key)
    citations.value = newSet

    // Warn if the entry doesn't exist (but only if bibData is loaded)
    if (bibFileLoaded.value && !bibData.value.has(key)) {
      console.warn(`Citation key "${key}" not found in bibliography`)
    }
  }

  const getCitation = (key: string): BibEntry | undefined => {
    return bibData.value.get(key)
  }

  const formatAuthors = (authors?: Array<{ given?: string; family?: string; literal?: string }> | string): string => {
    if (!authors) return 'Unknown Author'

    // Handle string format (e.g., "Einstein, Albert" or "Smith, J. and Doe, K.")
    if (typeof authors === 'string') {
      // Split by "and" to handle multiple authors
      const authorList = authors.split(' and ').map(a => a.trim())
      if (authorList.length === 1) {
        return authorList[0]
      } else if (authorList.length === 2) {
        return `${authorList[0]} and ${authorList[1]}`
      } else {
        return `${authorList[0]} et al.`
      }
    }

    // Handle array format
    if (authors.length === 0) return 'Unknown Author'

    const authorNames = authors.map(author => {
      if (author.literal) return author.literal
      if (author.family && author.given) return `${author.family}, ${author.given}`
      if (author.family) return author.family
      return 'Unknown'
    })

    if (authorNames.length === 1) {
      return authorNames[0]
    } else if (authorNames.length === 2) {
      return `${authorNames[0]} and ${authorNames[1]}`
    } else {
      return `${authorNames[0]} et al.`
    }
  }

  const getYear = (entry: BibEntry): string => {
    if (entry.year) return entry.year.toString()
    if (entry.issued?.['date-parts']?.[0]?.[0]) {
      return entry.issued['date-parts'][0][0].toString()
    }
    return 'n.d.'
  }

  const formatCitation = (key: string, style: 'numeric' | 'author-year' = 'numeric'): string => {
    const entry = bibData.value.get(key)
    if (!entry) return key

    if (style === 'author-year') {
      let author = 'Unknown'
      if (typeof entry.author === 'string') {
        // Extract first author's last name from string format
        const firstAuthor = entry.author.split(' and ')[0].trim()
        // Handle "Last, First" format
        author = firstAuthor.split(',')[0].trim()
      } else if (Array.isArray(entry.author) && entry.author.length > 0) {
        author = entry.author[0]?.family || entry.author[0]?.literal || 'Unknown'
      }
      const year = getYear(entry)
      return `${author}, ${year}`
    }

    // Numeric style
    const citedEntries = Array.from(citations.value)
    const index = citedEntries.indexOf(key) + 1
    return `${index}`
  }

  const formatReference = (entry: BibEntry): string => {
    const authors = formatAuthors(entry.author)
    const year = getYear(entry)
    const title = entry.title || 'Untitled'

    let venue = ''
    if (entry['container-title']) {
      venue = entry['container-title']
    } else if (entry.journal) {
      venue = entry.journal
    } else if (entry.booktitle) {
      venue = `In ${entry.booktitle}`
    } else if (entry.publisher) {
      venue = entry.publisher
    }

    return `${authors} (${year}). ${title}. ${venue}`.trim()
  }

  const citedReferences = computed(() => {
    return Array.from(citations.value)
      .map(key => ({
        key,
        entry: bibData.value.get(key)
      }))
      .filter(item => item.entry !== undefined)
  })

  const allReferences = computed(() => {
    return Array.from(bibData.value.entries()).map(([key, entry]) => ({
      key,
      entry
    }))
  })

  return {
    loadJsonFile,
    loadJsonFromUrl,
    addCitation,
    getCitation,
    formatCitation,
    formatReference,
    formatAuthors,
    citedReferences,
    allReferences,
    bibFileLoaded
  }
}
