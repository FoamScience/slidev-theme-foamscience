import { defineAppSetup } from '@slidev/types'
import PrimeVue from 'primevue/config'

// Import commonly used components
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DataView from 'primevue/dataview'
import OrganizationChart from 'primevue/organizationchart'
import Timeline from 'primevue/timeline'
import Tree from 'primevue/tree'
import TreeTable from 'primevue/treetable'
import Dock from 'primevue/dock'
import MeterGroup from 'primevue/metergroup'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import Step from 'primevue/step'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import StepItem from 'primevue/stepitem'

// Catppuccin preset for PrimeVue unstyled mode
const catppuccinPreset = {
  tabs: {
    root: 'w-full',
    tablist: 'flex flex-wrap border-b-2 border-surface0 bg-mantle mb-4',
    tab: ({ context }: any) => ({
      class: [
        'px-4 py-2 cursor-pointer transition-all duration-200 text-sm',
        'border-b-2 -mb-[2px]',
        {
          'border-blue text-blue bg-surface0': context.active,
          'border-transparent text-subtext0 hover:text-text hover:bg-surface0/50': !context.active
        }
      ]
    }),
    tabpanels: 'mt-4',
    tabpanel: 'px-3 py-2 bg-base text-base text-text rounded-md border border-surface0'
  },
  tablist: {
    root: 'flex flex-wrap border-b-2 border-surface0 bg-mantle',
    content: 'flex flex-1'
  },
  tab: {
    root: ({ context }: any) => ({
      class: [
        'px-4 py-2 cursor-pointer transition-all duration-200 text-sm relative',
        'border-b-2 -mb-[2px]',
        'focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2',
        {
          'border-blue text-blue bg-surface0': context.active,
          'border-transparent text-subtext0 hover:text-text hover:bg-surface0/50': !context.active
        }
      ]
    })
  },
  tabpanels: {
    root: 'mt-4'
  },
  tabpanel: {
    root: 'px-3 py-2 bg-base text-base text-text rounded-md border border-surface0'
  },
  button: {
    root: ({ props }: any) => ({
      class: [
        'px-4 py-2 rounded-md font-medium transition-colors cursor-pointer',
        'border border-transparent',
        'focus:outline-none focus:ring-2 focus:ring-blue',
        {
          'bg-blue text-base hover:bg-sapphire': !props.outlined && !props.text,
          'bg-transparent border-blue text-blue hover:bg-surface0': props.outlined,
          'bg-transparent text-blue hover:bg-surface0': props.text
        }
      ]
    }),
    label: 'flex-1 font-medium',
    icon: ({ props }: any) => ({
      class: [
        'mr-2',
        {
          'text-crust': !props.outlined && !props.text,
          'text-blue': props.outlined || props.text
        }
      ]
    })
  },
  card: {
    root: 'bg-mantle border border-surface0 rounded-lg shadow-sm',
    header: 'px-3 py-2 border-b border-surface0',
    body: 'px-3 py-2',
    title: 'text-lg text-base font-semibold text-text mb-2 px-3',
    subtitle: 'text-base text-subtext0 mb-3 px-3',
    content: 'text-base text-text px-3',
    footer: 'px-3 py-2 border-t border-surface0'
  },
  dialog: {
    root: 'rounded-lg shadow-xl border border-surface0',
    header: 'flex items-center justify-between p-5 bg-mantle border-b border-surface0 rounded-t-lg',
    title: 'font-semibold text-xl text-text',
    headerIcons: 'flex items-center',
    closeButton: {
      class: [
        'flex items-center justify-center overflow-hidden relative',
        'w-8 h-8 text-subtext0 border-0 bg-transparent rounded-full transition duration-200 ease-in-out',
        'hover:text-text hover:bg-surface0',
        'focus:outline-none focus:ring-2 focus:ring-blue'
      ]
    },
    closeButtonIcon: 'w-4 h-4',
    content: 'p-5 bg-base text-text',
    footer: 'p-5 bg-mantle border-t border-surface0 rounded-b-lg',
    mask: 'bg-crust/70',
    transition: {
      enterFromClass: 'opacity-0 scale-75',
      enterActiveClass: 'transition-all duration-150 ease-out',
      leaveActiveClass: 'transition-all duration-150 ease-out',
      leaveToClass: 'opacity-0 scale-75'
    }
  },
  divider: {
    root: ({ props }: any) => ({
      class: [
        'flex relative',
        {
          'w-full my-5 mx-0 py-0 px-5 before:content-[\'\'] before:block before:left-0 before:absolute before:top-1/2 before:w-full before:border-t-2 before:border-blue':
            props.layout === 'horizontal',
          'min-h-full mx-4 md:mx-5 py-5 before:content-[\'\'] before:block before:min-h-full before:absolute before:left-1/2 before:top-0 before:transform before:-translate-x-1/2 before:border-l-2 before:border-blue':
            props.layout === 'vertical'
        }
      ]
    }),
    content: 'px-2 bg-base z-10 text-subtext0'
  },
  datatable: {
    root: 'border border-surface0 rounded-md',
    header: 'bg-surface0 px-3 py-2 border-b border-surface0',
    table: 'w-full',
    thead: 'bg-mantle',
    tbody: 'bg-base',
    tfoot: 'bg-mantle border-t border-surface0',
    headerRow: 'border-b border-surface0',
    row: ({ context }: any) => ({
      class: [
        'border-b border-surface0 transition-colors',
        {
          'bg-surface0': context.selected,
          'hover:bg-surface0/50': !context.selected
        }
      ]
    }),
    headerCell: 'px-3 py-2 text-left text-text font-semibold text-base',
    bodyCell: 'px-3 py-2 text-text text-base',
    footerCell: 'px-3 py-2 text-text font-semibold text-base',
    footer: 'bg-surface0 px-3 py-2 border-t border-surface0'
  },
  column: {
    headerCell: 'px-3 py-2 text-left text-text font-semibold text-base',
    bodyCell: 'px-3 py-2 text-text text-base',
    footerCell: 'px-3 py-2 text-text font-semibold text-base'
  },
  dataview: {
    root: 'border border-surface0 rounded-md',
    header: 'bg-surface0 px-3 py-2 border-b border-surface0',
    content: 'bg-base px-3 py-2',
    footer: 'bg-surface0 px-3 py-2 border-t border-surface0'
  },
  organizationchart: {
    root: 'text-center',
    table: 'border-spacing-0 border-separate mx-auto',
    body: 'text-text',
    row: '',
    cell: 'text-center align-top p-0',
    node: 'relative inline-block bg-surface0 border-2 border-blue text-text px-4 py-2 rounded-md transition-all duration-200 hover:bg-surface1',
    nodeContent: 'flex items-center',
    nodeToggler: 'absolute bottom-[-1.5rem] left-1/2 ml-[-0.75rem] z-2 cursor-pointer w-6 h-6 bg-blue text-base rounded-full flex items-center justify-center hover:bg-sapphire transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2',
    nodeTogglerIcon: 'w-3 h-3',
    connectors: '',
    lineCell: 'text-center align-top p-0!',
    connectorDown: 'mx-auto h-6 w-px bg-blue',
    connectorLeft: ({ context }: any) => ({
      class: [
        'border-r border-blue',
        {
          'border-t border-blue': context.lineTop
        }
      ]
    }),
    connectorRight: ({ context }: any) => ({
      class: [
        {
          'border-l border-t border-blue': context.lineTop,
          'border-l border-blue': !context.lineTop
        }
      ]
    }),
    nodeChildren: 'align-top',
    nodeCell: 'text-center align-top p-0'
  },
  timeline: {
    root: 'flex',
    event: 'flex relative min-h-[70px]',
    eventOpposite: 'flex-1 px-2',
    eventSeparator: 'flex items-center flex-col flex-initial',
    eventMarker: 'flex self-baseline w-4 h-4 rounded-full border-2 border-blue bg-blue',
    eventConnector: 'grow bg-blue w-[3px]',
    eventContent: 'flex-1 px-2'
  },
  tree: {
    root: 'w-full',
    wrapper: 'overflow-auto',
    container: 'm-0 p-0 list-none',
    node: 'p-1',
    content: ({ context }: any) => ({
      class: [
        'flex items-center px-2 py-1 rounded-md transition-colors cursor-pointer',
        {
          'bg-surface0 text-blue': context.selected,
          'hover:bg-surface0/50': !context.selected
        }
      ]
    }),
    toggler: 'mr-2 w-6 h-6 flex items-center justify-center cursor-pointer text-subtext0 hover:text-blue',
    nodeIcon: 'mr-2 text-blue',
    nodeLabel: 'text-text text-base',
    nodeChildren: 'list-none m-0 pl-6'
  },
  treetable: {
    root: 'border border-surface0 rounded-md',
    header: 'bg-surface0 px-3 py-2 border-b border-surface0',
    table: 'w-full border-separate border-spacing-0',
    thead: 'bg-mantle',
    tbody: 'bg-base',
    tfoot: 'bg-mantle border-t border-surface0',
    headerRow: 'border-b border-surface0',
    row: ({ context }: any) => ({
      class: [
        'border-b border-surface0 transition-colors',
        {
          'bg-surface0': context.selected,
          'hover:bg-surface0/50': !context.selected
        }
      ]
    }),
    headerCell: 'px-3 py-2 text-left text-text font-semibold text-sm border-b border-surface0',
    bodyCell: 'px-3 py-2 text-text text-base',
    bodyCellContent: 'flex items-center gap-2',
    nodeToggleButton: 'w-6 h-6 flex-shrink-0 flex items-center justify-center cursor-pointer text-subtext0 hover:text-blue hover:bg-surface0/50 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-1',
    nodeToggleIcon: 'w-4 h-4 transition-transform duration-200',
    pcNodeCheckbox: {
      root: 'flex items-center justify-center w-5 h-5',
      box: 'w-5 h-5 border-2 border-surface0 rounded transition-all duration-200 flex items-center justify-center hover:border-blue focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-1',
      checkIcon: 'w-3 h-3 text-blue'
    },
    footerCell: 'px-3 py-2 text-text font-semibold text-sm',
    footer: 'bg-surface0 px-3 py-2 border-t border-surface0',
    emptyMessage: 'bg-base',
    emptyMessageCell: 'px-3 py-4 text-center text-subtext0 italic',
    columnResizeIndicator: 'absolute w-[2px] bg-blue z-10 opacity-0.7',
    paginator: {
      root: 'flex items-center justify-between bg-surface0 px-4 py-2 border-t border-surface0',
      firstPageButton: ({ context }: any) => ({
        class: [
          'w-8 h-8 flex items-center justify-center rounded transition-all',
          'text-subtext0 hover:text-blue hover:bg-surface1',
          'focus:outline-none focus:ring-2 focus:ring-blue',
          {
            'cursor-not-allowed opacity-50': context.disabled
          }
        ]
      }),
      previousPageButton: ({ context }: any) => ({
        class: [
          'w-8 h-8 flex items-center justify-center rounded transition-all',
          'text-subtext0 hover:text-blue hover:bg-surface1',
          'focus:outline-none focus:ring-2 focus:ring-blue',
          {
            'cursor-not-allowed opacity-50': context.disabled
          }
        ]
      }),
      nextPageButton: ({ context }: any) => ({
        class: [
          'w-8 h-8 flex items-center justify-center rounded transition-all',
          'text-subtext0 hover:text-blue hover:bg-surface1',
          'focus:outline-none focus:ring-2 focus:ring-blue',
          {
            'cursor-not-allowed opacity-50': context.disabled
          }
        ]
      }),
      lastPageButton: ({ context }: any) => ({
        class: [
          'w-8 h-8 flex items-center justify-center rounded transition-all',
          'text-subtext0 hover:text-blue hover:bg-surface1',
          'focus:outline-none focus:ring-2 focus:ring-blue',
          {
            'cursor-not-allowed opacity-50': context.disabled
          }
        ]
      }),
      pageButton: ({ context }: any) => ({
        class: [
          'w-8 h-8 flex items-center justify-center rounded transition-all',
          'text-text hover:bg-surface1',
          'focus:outline-none focus:ring-2 focus:ring-blue',
          {
            'bg-blue text-base font-semibold': context.active,
            'hover:text-blue': !context.active
          }
        ]
      }),
      rowPerPageDropdown: {
        root: 'ml-2',
        input: 'bg-base border border-surface0 text-text rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue'
      },
      currentPageReport: 'text-subtext0 text-sm mx-4',
      jumpToPageInput: {
        root: 'inline-flex mx-2',
        input: 'bg-base border border-surface0 text-text rounded px-2 py-1 w-12 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue'
      }
    }
  },
  dock: {
    root: 'absolute z-2 flex justify-center items-center',
    container: 'flex list-none p-0 m-0 bg-mantle/90 backdrop-blur border border-surface0 rounded-lg px-2 py-2',
    item: 'p-1',
    itemLink: 'flex items-center justify-center w-12 h-12 rounded-md transition-all hover:scale-110 cursor-pointer',
    itemIcon: 'w-8 h-8 text-blue'
  },
  metergroup: {
    root: 'relative overflow-hidden border border-surface0 rounded-md bg-surface0',
    meters: 'flex',
    meter: 'h-6',
    label: 'inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface0 text-text text-sm',
    labelList: 'flex flex-wrap gap-3 mt-2',
    labelListItem: 'flex items-center gap-2',
    labelIcon: 'w-3 h-3 rounded-full',
    labelMarker: 'w-3 h-3 rounded-full'
  },
  stepper: {
    root: 'flex flex-col',
    separator: 'flex-1 w-full h-[2px] bg-overlay0 transition-colors duration-200'
  },
  steplist: {
    root: 'flex flex-wrap p-0 m-0 list-none'
  },
  step: {
    root: 'flex-1 flex items-center gap-2 py-2 px-3',
    header: ({ context }: any) => ({
      class: [
        'flex items-center justify-center gap-2 cursor-pointer transition-all duration-200',
        'border-2 rounded-md px-4 py-2',
        {
          'border-blue bg-surface0 text-blue': context.active,
          'border-green bg-green/10 text-green': context.completed && !context.active,
          'border-surface0 text-subtext0 hover:border-overlay0': !context.active && !context.completed,
          'opacity-50 cursor-not-allowed': context.disabled
        }
      ]
    }),
    number: ({ context }: any) => ({
      class: [
        'flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold transition-colors',
        {
          'bg-blue text-base': context.active,
          'bg-green text-base': context.completed && !context.active,
          'bg-surface0 text-subtext0': !context.active && !context.completed
        }
      ]
    }),
    title: ({ context }: any) => ({
      class: [
        'font-medium text-sm transition-colors',
        {
          'text-blue': context.active,
          'text-green': context.completed && !context.active,
          'text-subtext0': !context.active && !context.completed
        }
      ]
    })
  },
  steppanels: {
    root: 'mt-4'
  },
  steppanel: {
    root: 'bg-base',
    content: ({ context }: any) => ({
      class: [
        'px-4 py-3 rounded-md border border-surface0 transition-all duration-200',
        {
          'block': context.active,
          'hidden': !context.active
        }
      ]
    })
  },
  stepitem: {
    root: 'flex flex-col'
  }
}

export default defineAppSetup(({ app }) => {
  // Install PrimeVue in unstyled mode with Catppuccin preset
  app.use(PrimeVue, {
    unstyled: true,
    pt: catppuccinPreset
  })

  // Register components with 'P' prefix to avoid conflicts
  app.component('PTabs', Tabs)
  app.component('PTabList', TabList)
  app.component('PTab', Tab)
  app.component('PTabPanels', TabPanels)
  app.component('PTabPanel', TabPanel)
  app.component('PButton', Button)
  app.component('PCard', Card)
  app.component('PDialog', Dialog)
  app.component('PDivider', Divider)
  app.component('PDataTable', DataTable)
  app.component('PColumn', Column)
  app.component('PDataView', DataView)
  app.component('POrganizationChart', OrganizationChart)
  app.component('PTimeline', Timeline)
  app.component('PTree', Tree)
  app.component('PTreeTable', TreeTable)
  app.component('PDock', Dock)
  app.component('PMeterGroup', MeterGroup)
  app.component('PStepper', Stepper)
  app.component('PStepList', StepList)
  app.component('PStep', Step)
  app.component('PStepPanels', StepPanels)
  app.component('PStepPanel', StepPanel)
  app.component('PStepItem', StepItem)
})
