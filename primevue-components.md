---
---

# PrimeVue Components

Examples of all available PrimeVue components with Catppuccin theming.

---

## Tabs Component

<script setup>
const jsCode = `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5));  // Output: 120`

const bashCode = `factorial() {
  if [ $1 -le 1 ]; then
    echo 1
  else
    echo $(( $1 * $(factorial $(( $1 - 1 ))) ))
  fi
}

factorial 5  # Output: 120`
</script>

Interactive tabs with code examples:

<PTabs value="python">
<PTabList>
  <PTab value="python">Python</PTab>
  <PTab value="javascript">JavaScript</PTab>
  <PTab value="bash">Bash</PTab>
</PTabList>
<PTabPanels>
  <PTabPanel value="python">

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
```

  </PTabPanel>
  <PTabPanel value="javascript">

```js
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5));  // Output: 120
```

  </PTabPanel>
  <PTabPanel value="bash">

```bash
factorial() {
  if [ $1 -le 1 ]; then
    echo 1
  else
    echo $(( $1 * $(factorial $(( $1 - 1 ))) ))
  fi
}

factorial 5  # Output: 120
```

  </PTabPanel>
</PTabPanels>
</PTabs>

---

## Button Component

Various button styles:

<div class="flex gap-4 items-center">
  <PButton label="Primary Button" />
  <PButton label="Outlined" outlined />
  <PButton label="Text Button" text />
</div>

<br/>

You can also use buttons with icons (requires PrimeIcons):

<div class="flex gap-4 items-center">
  <PButton label="Save" icon="pi pi-check" />
  <PButton label="Delete" icon="pi pi-trash" outlined />
  <PButton icon="pi pi-cog" text />
</div>

---

## Card Component

Display content in a card layout:

<div grid="~ cols-2 gap-4">

<PCard>
  <template #header>
    <div class="p-4">
      <h3 class="text-xl font-semibold text-text">Research Paper</h3>
    </div>
  </template>
  <template #title>
    Deep Learning for Time Series
  </template>
  <template #subtitle>
    Published in Nature, 2024
  </template>
  <template #content>
    <p>This groundbreaking research explores novel applications of transformer architectures for time series forecasting, achieving state-of-the-art results on multiple benchmarks.</p>
  </template>
  <template #footer>
    <div class="flex gap-2">
      <PButton label="Read" text />
      <PButton label="Cite" text />
    </div>
  </template>
</PCard>

<PCard>
  <template #header>
    <div class="p-4">
      <h3 class="text-xl font-semibold text-text">Project Update</h3>
    </div>
  </template>
  <template #title>
    Q4 Progress Report
  </template>
  <template #subtitle>
    December 2024
  </template>
  <template #content>
    <p>Key achievements this quarter:</p>
    <ul>
      <li>Completed user authentication module</li>
      <li>Deployed to production environment</li>
      <li>Onboarded 1,000+ new users</li>
    </ul>
  </template>
</PCard>

</div>

---

## Dialog Component

<script setup>
import { ref } from 'vue'
const visible = ref(false)
</script>

Modal dialogs for important content:

<PButton label="Show Dialog" @click="visible = true" />

<PDialog v-model:visible="visible" header="Confirm Action" style="width: 25rem">
  <template #header>
    <h3 class="text-xl font-semibold">Confirm Action</h3>
  </template>
  <p class="mb-4">Are you sure you want to proceed with this action? This operation cannot be undone.</p>
  <template #footer>
    <PButton label="Cancel" text @click="visible = false" />
    <PButton label="Confirm" @click="visible = false" />
  </template>
</PDialog>

Click the button above to see the dialog in action!

---

## Divider Component

Horizontal dividers:

<div>
  <p>Content above the divider</p>

  <PDivider :type="solid" />

  <p>Content below the divider</p>
</div>

<br/>

Dividers with text:

<div>
  <p>Section 1 content</p>

  <PDivider>
    <span>or</span>
  </PDivider>

  <p>Section 2 content</p>
</div>

---

## Combining Components

You can combine multiple components for rich layouts:

<PTabs value="overview">
  <PTabList>
    <PTab value="overview">Overview</PTab>
    <PTab value="details">Details</PTab>
  </PTabList>
  <PTabPanels>
    <PTabPanel value="overview">
      <div grid="~ cols-2 gap-4">
        <PCard>
          <template #title>Performance</template>
          <template #content>
            <p>95% accuracy on test set</p>
            <p>0.3s average inference time</p>
          </template>
        </PCard>
        <PCard>
          <template #title>Resources</template>
          <template #content>
            <p>2 GB memory footprint</p>
            <p>4 CPU cores utilized</p>
          </template>
        </PCard>
      </div>
    </PTabPanel>
    <PTabPanel value="details">
      <PAccordion>
        <PAccordionPanel value="1">
          <PAccordionHeader>Training Details</PAccordionHeader>
          <PAccordionContent>
            <p>Model was trained for 100 epochs using Adam optimizer with learning rate 0.001.</p>
          </PAccordionContent>
        </PAccordionPanel>
        <PAccordionPanel value="2">
          <PAccordionHeader>Architecture</PAccordionHeader>
          <PAccordionContent>
            <p>ResNet-50 backbone with custom classification head.</p>
          </PAccordionContent>
        </PAccordionPanel>
      </PAccordion>
    </PTabPanel>
  </PTabPanels>
</PTabs>

---

## DataTable Component

<script setup>
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'Laptop', category: 'Electronics', price: 999, stock: 15 },
  { id: 2, name: 'Mouse', category: 'Electronics', price: 29, stock: 45 },
  { id: 3, name: 'Keyboard', category: 'Electronics', price: 79, stock: 30 },
  { id: 4, name: 'Monitor', category: 'Electronics', price: 299, stock: 12 },
  { id: 5, name: 'Desk', category: 'Furniture', price: 399, stock: 8 }
])
</script>

Display tabular data with sorting and selection:

<PDataTable :value="products" stripedRows tableStyle="min-width: 50rem">
  <PColumn field="name" header="Name" sortable></PColumn>
  <PColumn field="category" header="Category" sortable></PColumn>
  <PColumn field="price" header="Price" sortable>
    <template #body="slotProps">
      ${{ slotProps.data.price }}
    </template>
  </PColumn>
  <PColumn field="stock" header="Stock" sortable></PColumn>
</PDataTable>

---

## Tree Component

Hierarchical tree structures:

<script setup>
import { ref } from 'vue'
const nodes = ref([
  {
    key: '0',
    label: 'Documents',
    icon: 'pi pi-folder',
    children: [
      {
        key: '0-0',
        label: 'Work',
        icon: 'pi pi-folder',
        children: [
          { key: '0-0-0', label: 'Presentation.pptx', icon: 'pi pi-file' },
          { key: '0-0-1', label: 'Report.pdf', icon: 'pi pi-file' }
        ]
      },
      {
        key: '0-1',
        label: 'Personal',
        icon: 'pi pi-folder',
        children: [
          { key: '0-1-0', label: 'Photo.jpg', icon: 'pi pi-image' }
        ]
      }
    ]
  }
])
</script>

<PTree :value="nodes" class="w-full" />

---

## TreeTable Component

<script setup>
import { ref } from 'vue'
const treeTableData = ref([
  {
    key: '0',
    data: {
      name: 'Applications',
      size: '200MB',
      type: 'Folder'
    },
    children: [
      {
        key: '0-0',
        data: {
          name: 'Vue',
          size: '25MB',
          type: 'Folder'
        },
        children: [
          {
            key: '0-0-0',
            data: {
              name: 'vue-router.js',
              size: '100KB',
              type: 'JavaScript'
            }
          },
          {
            key: '0-0-1',
            data: {
              name: 'vuex.js',
              size: '80KB',
              type: 'JavaScript'
            }
          }
        ]
      },
      {
        key: '0-1',
        data: {
          name: 'React',
          size: '30MB',
          type: 'Folder'
        },
        children: [
          {
            key: '0-1-0',
            data: {
              name: 'react-dom.js',
              size: '150KB',
              type: 'JavaScript'
            }
          }
        ]
      }
    ]
  },
  {
    key: '1',
    data: {
      name: 'Documents',
      size: '75MB',
      type: 'Folder'
    },
    children: [
      {
        key: '1-0',
        data: {
          name: 'Work',
          size: '55MB',
          type: 'Folder'
        },
        children: [
          {
            key: '1-0-0',
            data: {
              name: 'Presentation.pptx',
              size: '5MB',
              type: 'PowerPoint'
            }
          },
          {
            key: '1-0-1',
            data: {
              name: 'Report.pdf',
              size: '2MB',
              type: 'PDF'
            }
          }
        ]
      }
    ]
  }
])
</script>

Display hierarchical data in a table format with expand/collapse functionality:

<PTreeTable :value="treeTableData" tableStyle="min-width: 50rem">
  <PColumn field="name" header="Name" expander sortable></PColumn>
  <PColumn field="size" header="Size" sortable></PColumn>
  <PColumn field="type" header="Type" sortable></PColumn>
</PTreeTable>

---

## MeterGroup Component

<script setup>
const meterValue = [
  { label: 'CPU', value: 60, color: '#89b4fa' },
  { label: 'Memory', value: 25, color: '#a6e3a1' },
  { label: 'Storage', value: 15, color: '#f9e2af' }
]
</script>

Display progress or resource usage:

<PMeterGroup :value="meterValue" />

---

## OrganizationChart Component

<script setup>
import { ref } from 'vue'

const orgData = ref({
  key: '0',
  type: 'person',
  data: { label: 'CEO', name: 'Alice Johnson' },
  children: [
    {
      key: '0-0',
      type: 'person',
      data: { label: 'CTO', name: 'Bob Smith' },
      children: [
        {
          key: '0-0-0',
          type: 'person',
          data: { label: 'Dev Lead', name: 'Carol White' }
        },
        {
          key: '0-0-1',
          type: 'person',
          data: { label: 'QA Lead', name: 'David Brown' }
        }
      ]
    },
    {
      key: '0-1',
      type: 'person',
      data: { label: 'CFO', name: 'Eve Davis' }
    }
  ]
})
</script>

Organization hierarchy visualization:

<POrganizationChart :value="orgData">
  <template #person="slotProps">
    <div class="text-center">
      <div class="font-semibold text-text">{{ slotProps.node.data.name }}</div>
      <div class="text-sm text-subtext0">{{ slotProps.node.data.label }}</div>
    </div>
  </template>
</POrganizationChart>

---

## DataView Component

<script setup>
import { ref } from 'vue'

const products2 = ref([
  { id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 999, image: '💻' },
  { id: 2, name: 'Wireless Mouse', description: 'Ergonomic design', price: 29, image: '🖱️' },
  { id: 3, name: 'Mechanical Keyboard', description: 'RGB backlit', price: 79, image: '⌨️' }
])
</script>

Alternative data presentation with custom layouts:

<PDataView :value="products2">
  <template #list="slotProps">
    <div class="grid grid-cols-1 gap-2">
      <div v-for="item in slotProps.items" :key="item.id" class="flex items-center gap-4 p-3 bg-surface0 rounded-md">
        <span class="text-4xl">{{ item.image }}</span>
        <div class="flex-1">
          <h4 class="text-text font-semibold">{{ item.name }}</h4>
          <p class="text-sm text-subtext0">{{ item.description }}</p>
        </div>
        <span class="text-blue font-semibold">${{ item.price }}</span>
      </div>
    </div>
  </template>
</PDataView>

---

## Stepper Component

Create multi-step workflows with progress tracking:

<script setup>
import { ref } from 'vue'
const formStep = ref(0)
</script>

<PStepper v-model:value="formStep">
  <PStepList>
    <PStep value="0">Account</PStep>
    <PStep value="1">Profile</PStep>
    <PStep value="2">Confirm</PStep>
  </PStepList>
  <PStepPanels>
    <PStepPanel value="0">
      <div class="flex flex-col gap-3 mb-4">
        <h4 class="text-text font-semibold">Create Your Account</h4>
        <input type="email" placeholder="Email address" class="px-3 py-2 rounded-md bg-surface0 border border-overlay0 text-text" />
        <input type="password" placeholder="Password" class="px-3 py-2 rounded-md bg-surface0 border border-overlay0 text-text" />
      </div>
      <PButton label="Continue" @click="formStep = 1" />
    </PStepPanel>
    <PStepPanel value="1">
      <div class="flex flex-col gap-3 mb-4">
        <h4 class="text-text font-semibold">Complete Your Profile</h4>
        <input type="text" placeholder="Full name" class="px-3 py-2 rounded-md bg-surface0 border border-overlay0 text-text" />
        <input type="text" placeholder="Username" class="px-3 py-2 rounded-md bg-surface0 border border-overlay0 text-text" />
      </div>
      <div class="flex gap-2">
        <PButton label="Back" text @click="formStep = 0" />
        <PButton label="Continue" @click="formStep = 2" />
      </div>
    </PStepPanel>
    <PStepPanel value="2">
      <div class="flex flex-col gap-3 mb-4">
        <h4 class="text-text font-semibold">Confirmation</h4>
        <p class="text-subtext0">Please review your information before submitting.</p>
        <div class="p-3 rounded-md bg-surface0 border border-overlay0">
          <p class="text-sm text-text">✓ Account details verified</p>
          <p class="text-sm text-text">✓ Profile information complete</p>
        </div>
      </div>
      <div class="flex gap-2">
        <PButton label="Back" text @click="formStep = 1" />
        <PButton label="Submit" />
      </div>
    </PStepPanel>
  </PStepPanels>
</PStepper>
