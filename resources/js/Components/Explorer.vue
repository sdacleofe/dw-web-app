<template>
    <div class="mb-4">
        <Loader v-if="anyLoading" />
        <div v-else>
            <div class="px-4 py-2 font-semibold text-gray-700 text-base">
                Data
            </div>
            <div v-for="(item, idx) in categories" :key="item.label" class="mb-2">
                <button
                    class="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded hover:bg-blue-100 transition"
                    @click="toggleDropdown(idx)" type="button">
                    <svg class="w-4 h-4 mr-2 text-blue-400 transition-transform duration-200"
                        :class="{ 'rotate-90': openStates[idx] }" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    {{ item.label }}
                </button>
                <div v-show="openStates[idx]" class="pl-8 pb-2">
                    <ul class="text-xs text-gray-700">
                        <li v-for="sub in item.children" :key="sub" class="flex flex-col py-1">
                            <div class="flex items-center group hover:bg-blue-50 rounded transition px-2">
                                <button
                                    class="mr-2 px-1 py-1 rounded hover:bg-blue-100 transition text-xs text-blue-600"
                                    :class="{ 'bg-blue-100': expandedTables[sub] }"
                                    @click.stop="toggleTableColumns(sub)" title="Show columns" style="min-width: 24px;">
                                    <svg class="w-3 h-3 transition-transform"
                                        :class="{ 'rotate-45': expandedTables[sub], 'text-blue-600': expandedTables[sub] }"
                                        fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
                                    </svg>
                                </button>
                                <input type="checkbox" class="mr-2 accent-blue-600 cursor-pointer"
                                    :checked="tableStore.selectedColumns[sub] && tableStore.selectedColumns[sub].size === (tableColumns[sub]?.length || 0)"
                                    :indeterminate="tableStore.selectedColumns[sub] && tableStore.selectedColumns[sub].size > 0 && tableStore.selectedColumns[sub].size < (tableColumns[sub]?.length || 0)"
                                    @change="selectChild(sub)" :aria-label="`Select ${sub}`"
                                    :disabled="loadingColumns[sub]" />
                                <span class="text-gray-800 font-medium truncate" :title="formatName(sub)">{{
                                    formatName(sub) }}</span>
                                <div class="flex items-center group hover:bg-blue-50 rounded transition px-2 ml-auto">
                                    <button
                                        v-if="tableStore.selectedColumns[sub] && tableStore.selectedColumns[sub].size > 0"
                                        @click.stop="resetTableSelection(sub)"
                                        class="focus:outline-none flex items-center mr-1" title="Reset selection">
                                        <svg class="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer"
                                            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M4 4v5h.582M20 20v-5h-.581M5.002 9A7.003 7.003 0 0112 5c1.657 0 3.156.576 4.354 1.536M19 15a7.003 7.003 0 01-7 4c-1.657 0-3.156-.576-4.354-1.536" />
                                        </svg>
                                    </button>
                                    <button @click.stop="showTableInfo(sub)"
                                        class="focus:outline-none flex items-center" title="Table info">
                                        <svg class="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer"
                                            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                                            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor"
                                                stroke-width="2" />
                                            <circle cx="12" cy="8" r="1" fill="currentColor" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <transition name="fade">
                                <ul v-if="expandedTables[sub]" class="ml-6 mt-2 bg-gray-50 rounded p-2 shadow-inner">
                                    <li v-if="loadingColumns[sub]" class="flex items-center text-gray-400">
                                        <input type="checkbox" disabled class="mr-2" />
                                    </li>
                                    <li v-else v-for="col in tableColumns[sub]" :key="col"
                                        class="flex items-center py-1 px-1 hover:bg-blue-50 rounded transition">
                                        <input type="checkbox" class="mr-2 accent-blue-600 cursor-pointer"
                                            :checked="tableStore.selectedColumns[sub] && tableStore.selectedColumns[sub].has(col)"
                                            @change="toggleColumn(sub, col)" />
                                        <span class="truncate" :title="formatName(col)">{{ formatName(col) }}</span>
                                        <span class="ml-auto flex items-center">
                                            <button @click.stop="showColumnInfo(sub, col)" class="focus:outline-none">
                                                <svg class="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer"
                                                    fill="none" stroke="currentColor" stroke-width="2"
                                                    viewBox="0 0 24 24" title="Column info">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor"
                                                        stroke-width="2" />
                                                    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor"
                                                        stroke-width="2" />
                                                    <circle cx="12" cy="8" r="1" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </span>
                                    </li>
                                </ul>
                            </transition>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <InfoModal v-if="modalType === 'table'" :show="showModal" :table="modalTitle.replace('Table: ', '')"
        @close="closeModal" />
    <InfoModal v-if="modalType === 'column'" :show="showModal" :table="modalTable" :column="modalColumn"
        @close="closeModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTableStore } from '../stores/tableStore'
import InfoModal from './InfoModal.vue'
import Loader from './Loader.vue'

const tableStore = useTableStore()
const selectedChild = ref(null)

const expandedTables = ref({})
const tableColumns = ref({})
const loadingColumns = ref({})
const showModal = ref(false)
const modalType = ref(null)
const modalTitle = ref('')
const modalContent = ref('')

const anyLoading = computed(() => Object.values(loadingColumns.value).some(Boolean))


function resetPreviewTable() {
    tableStore.tableData = []
    tableStore.pagination.current_page = 1
    tableStore.pagination.last_page = 1
    tableStore.pagination.total = 0
}

function resetTableSelection(sub) {
    tableStore.setSelectedColumns(sub, []);
    selectedChild.value = null;
    tableStore.setSelectedTable(null);
    resetPreviewTable();
}

const modalTable = computed(() => {
    const match = modalContent.value.match(/table "([^"]+)"/)
    return match ? match[1] : ''
})
const modalColumn = computed(() => {
    const match = modalContent.value.match(/column "([^"]+)"/)
    return match ? match[1] : ''
})

const tableDisplayNames = {
    lf_population: "Labor Force Population",
    pov_households: "Poverty Households",
    nia_gdp: "National Income GDP",
    inf_prices: "Inflation Prices",
}

function showTableInfo(table) {
    modalType.value = 'table'
    modalTitle.value = `Table: ${tableDisplayNames[table] || table}`
    modalContent.value = `Information about table "${tableDisplayNames[table] || table}".`
    showModal.value = true
}

function showColumnInfo(table, col) {
    modalType.value = 'column'
    modalTitle.value = `Column: ${col}`
    modalContent.value = `Information about column "${col}" in table "${tableDisplayNames[table] || table}".`
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    modalType.value = null
    modalTitle.value = ''
    modalContent.value = ''
}

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

async function selectChild(sub) {
    if (!tableColumns.value[sub]) {
        loadingColumns.value[sub] = true
        tableColumns.value[sub] = await tableStore.fetchTableColumns(sub)
        loadingColumns.value[sub] = false
    }

    Object.keys(tableStore.selectedColumns).forEach(table => {
        if (table !== sub) {
            tableStore.setSelectedColumns(table, []);
        }
    });

    if (
        tableStore.selectedColumns[sub] &&
        tableStore.selectedColumns[sub].size === (tableColumns.value[sub]?.length || 0)
    ) {
        tableStore.setSelectedColumns(sub, []);
        selectedChild.value = null;
        tableStore.setSelectedTable(null);
        resetPreviewTable()
    } else {
        const cols = tableColumns.value[sub] || [];
        tableStore.setSelectedColumns(sub, cols);
        selectedChild.value = sub;
        tableStore.setSelectedTable(sub);
        resetPreviewTable()
    }
}

function toggleColumn(table, col) {
    Object.keys(tableStore.selectedColumns).forEach(t => {
        if (t !== table) {
            tableStore.setSelectedColumns(t, []);
        }
    });

    if (!tableStore.selectedColumns[table]) tableStore.selectedColumns[table] = new Set()
    if (tableStore.selectedColumns[table].has(col)) {
        tableStore.selectedColumns[table].delete(col)
    } else {
        tableStore.selectedColumns[table].add(col)
        tableStore.setSelectedTable(table)
    }
    tableStore.setSelectedColumns(table, Array.from(tableStore.selectedColumns[table]))

    if (tableStore.selectedColumns[table].size === 0) {
        tableStore.setSelectedTable(null)
    }
}

function formatName(name) {
    if (!name) return '';
    const prefixes = ['lf', 'pov', 'nia', 'inf'];
    const parts = name.split('_');
    let prefix = parts[0];
    let rest = parts.slice(1);

    if (prefixes.includes(prefix)) {
        prefix = prefix.toUpperCase();
    } else {
        prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const pascal = rest.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return prefix + (pascal ? ' ' + pascal : '');
}

onMounted(() => {
    tableStore.fetchDbTables()
})

async function toggleTableColumns(table) {
    expandedTables.value[table] = !expandedTables.value[table]
    if (expandedTables.value[table] && !tableColumns.value[table]) {
        loadingColumns.value[table] = true
        tableColumns.value[table] = await tableStore.fetchTableColumns(table)
        loadingColumns.value[table] = false
        if (!tableStore.selectedColumns[table]) {
            tableStore.selectedColumns[table] = new Set()
        }
    }
}
</script>
