<template>
  <div class="mb-4">
    <div>
      <div class="px-4 py-2 font-semibold text-gray-700 text-base">
        Data
      </div>
      <div v-for="(item, idx) in categories" :key="item.label">
        <button class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 transition"
          @click="toggleDropdown(idx)" type="button">
          <svg class="w-4 h-4 mr-2 text-blue-400 transition-transform duration-200"
            :class="{ 'rotate-90': openStates[idx] }" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {{ item.label }}
        </button>
        <div v-show="openStates[idx]" class="pl-8 pb-2">
          <ul class="text-xs text-gray-600">
            <li v-for="sub in item.children" :key="sub" class="flex items-center py-1">
              <label class="flex items-center cursor-pointer select-none w-full p-2 hover:bg-blue-50 rounded px-2">
                <input type="checkbox" class="mr-2 accent-blue-600" :checked="selectedChild === sub"
                  @change="selectChild(sub)" />
                <span>{{ sub }}</span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTableStore } from '../stores/tableStore'

const tableStore = useTableStore()
const selectedChild = ref(null)

const categories = computed(() => [
  {
    label: 'Labor Force',
    children: tableStore.dbTables.filter(t => t.startsWith('lf_'))
  },
  {
    label: 'Poverty',
    children: tableStore.dbTables.filter(t => t.startsWith('pov_'))
  },
  {
    label: 'National Income Accounts',
    children: tableStore.dbTables.filter(t => t.startsWith('nia_'))
  },
  {
    label: 'Inflation',
    children: tableStore.dbTables.filter(t => t.startsWith('inf_'))
  }
])

const openStates = ref([false, false, false, false])

function toggleDropdown(idx) {
  openStates.value[idx] = !openStates.value[idx]
}

function selectChild(sub) {
  if (selectedChild.value === sub) {
    selectedChild.value = null;
    tableStore.setSelectedTable(null);
    tableStore.tableData = [];
  } else {
    selectedChild.value = sub;
    tableStore.setSelectedTable(sub);
    tableStore.fetchTableData(sub);
  }
}

onMounted(() => {
  tableStore.fetchDbTables()
})

function onTableCheckboxChange(table, event) {
  if (event.target.checked) {
    tableStore.setSelectedTable(table)
    tableStore.fetchTableData(table)
  } else {
    tableStore.setSelectedTable(null)
    tableStore.tableData = []
  }
}
</script>
