<template>
    <div class="mb-4">
        <Loader v-if="anyLoading" />
        <div v-else>
            <!-- Header with Data label and search -->
            <span class="text-md font-bold text-blue-700 flex items-center">
                Data
            </span>
            <div class="flex items-center bg-white rounded-t shadow-sm border-b">
                <div class="py-2 flex-1 relative">
                    <input
                        v-model="categorySearch"
                        type="text"
                        placeholder="Search category..."
                        class="w-full pl-10 pr-7 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-gray-50 transition"
                        autocomplete="off"
                        @focus="showCategorySuggestions = true"
                        @blur="() => setTimeout(() => showCategorySuggestions = false, 100)"
                        @input="onCategoryInput"
                    />
                    <!-- Magnifier icon inside the input, fully inside the border -->
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <!-- Clear button -->
                    <button v-if="categorySearch" @click="categorySearch = ''"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
                        aria-label="Clear category search">
                        &times;
                    </button>
                    <!-- Custom suggestion dropdown -->
                    <ul v-if="showCategorySuggestions && filteredCategorySuggestions.length"
                        class="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow max-h-40 overflow-auto text-sm">
                        <li v-for="suggestion in filteredCategorySuggestions" :key="suggestion"
                            @mousedown.prevent="selectCategorySuggestion(suggestion)"
                            class="px-3 py-1.5 cursor-pointer hover:bg-blue-50">
                            {{ suggestion }}
                        </li>
                    </ul>
                </div>
            </div>
            <!-- Category Search -->
            <div class="bg-white rounded-b shadow-sm pb-2">
                <!-- Categories and tables -->
                <div v-for="(item, idx) in filteredCategories" :key="item.label" class="mb-2">
                    <button
                        class="flex items-center w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded hover:bg-blue-100 transition"
                        @click="() => { toggleDropdown(idx); selectedCategoryIdx = idx; tableSearch = '' }"
                        type="button">
                        <svg class="w-4 h-4 mr-2 text-blue-400 transition-transform duration-200"
                            :class="{ 'rotate-90': openStates[idx] }" fill="none" stroke="currentColor" stroke-width="2"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        {{ item.label }}
                    </button>
                    <!-- Table Search (only for opened category) -->
                    <div v-if="openStates[idx] && selectedCategoryIdx === idx" class="pl-8 pt-2 pb-1">
                        <div class="relative">
                            <input
                                v-model="tableSearch"
                                type="text"
                                placeholder="Search table..."
                                class="w-full pl-8 pr-7 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-gray-50 transition"
                                autocomplete="off"
                                @focus="showSuggestions = true"
                                @blur="() => setTimeout(() => showSuggestions = false, 100)"
                                @input="onTableInput"
                            />
                            <!-- Magnifier icon -->
                            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"
                                        stroke-width="2" />
                                </svg>
                            </span>
                            <!-- Clear button -->
                            <button v-if="tableSearch" @click="tableSearch = ''"
                                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
                                aria-label="Clear table search">
                                &times;
                            </button>
                            <!-- Custom suggestion dropdown -->
                            <ul v-if="showSuggestions && filteredSuggestions.length"
                                class="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow max-h-40 overflow-auto text-sm">
                                <li v-for="suggestion in filteredSuggestions" :key="suggestion"
                                    @mousedown.prevent="selectSuggestion(suggestion)"
                                    class="px-3 py-1.5 cursor-pointer hover:bg-blue-50">
                                    {{ suggestion }}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div v-show="openStates[idx]" class="pl-8 pb-2">
                        <ul class="text-xs text-gray-700">
                            <li v-if="(selectedCategoryIdx === idx ? filteredTables : item.children).length === 0"
                                class="text-gray-400 px-2 py-1">
                                No tables found.
                            </li>
                            <li v-for="sub in (selectedCategoryIdx === idx ? filteredTables : item.children)" :key="sub"
                                class="flex flex-col py-1" :class="{
                                    'bg-blue-100': selectedChild === sub && (!tableStore.selectedColumns[sub] || tableStore.selectedColumns[sub].size === 0)
                                }">
                                <div class="flex items-center group rounded transition px-2" :class="{
                                    'hover:bg-blue-50': !tableStore.selectedColumns[sub] || tableStore.selectedColumns[sub].size === 0
                                }">
                                    <button
                                        class="mr-2 px-1 py-1 rounded hover:bg-blue-100 transition text-xs text-blue-600"
                                        :class="{ 'bg-blue-100': expandedTables[sub] }"
                                        @click.stop="toggleTableColumns(sub)" title="Show columns"
                                        style="min-width: 24px;">
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
                                    <span class="text-gray-800 font-medium truncate" :title="formatName(sub)">
                                        {{ formatName(sub) }}
                                    </span>
                                    <div
                                        class="flex items-center group hover:bg-blue-50 rounded transition px-2 ml-auto">
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
                                    <ul v-if="expandedTables[sub]"
                                        class="ml-6 mt-2 bg-gray-50 rounded p-2 shadow-inner">
                                        <li v-if="loadingColumns[sub]" class="flex items-center text-gray-400">
                                            <input type="checkbox" disabled class="mr-2" />
                                        </li>
                                        <li v-else v-for="col in tableColumns[sub] || []" :key="col"
                                            class="flex items-center py-1 px-1 hover:bg-blue-50 rounded transition">
                                            <input type="checkbox" class="mr-2 accent-blue-600 cursor-pointer"
                                                :checked="tableStore.selectedColumns[sub] && tableStore.selectedColumns[sub].has(col)"
                                                @change="toggleColumn(sub, col)" />
                                            <span class="truncate" :title="formatName(col)">{{ formatName(col) }}</span>
                                            <span class="ml-auto flex items-center">
                                                <button @click.stop="showColumnInfo(sub, col)"
                                                    class="focus:outline-none">
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

const categorySearch = ref('')
const tableSearch = ref('')
const selectedCategoryIdx = ref(null)

const showCategorySuggestions = ref(false)
const categorySuggestions = computed(() => categories.value.map(cat => cat.label))
const filteredCategorySuggestions = computed(() => {
    if (!categorySearch.value) return []
    return categorySuggestions.value.filter(s =>
        s.toLowerCase().includes(categorySearch.value.toLowerCase())
    )
})
function selectCategorySuggestion(suggestion) {
    categorySearch.value = suggestion
    showCategorySuggestions.value = false
}
function onCategoryInput() {
    showCategorySuggestions.value = !!categorySearch.value
}

const showSuggestions = ref(false)
const tableSuggestions = computed(() => {
    if (selectedCategoryIdx.value === null) return []
    const tables = filteredCategories.value[selectedCategoryIdx.value]?.children || []
    if (!tableSearch.value) return tables.map(formatName)
    return tables
        .filter(t => formatName(t).toLowerCase().includes(tableSearch.value.toLowerCase()))
        .map(formatName)
})
const filteredSuggestions = computed(() => {
    if (!tableSearch.value) return []
    return tableSuggestions.value.filter(s =>
        s.toLowerCase().includes(tableSearch.value.toLowerCase())
    )
})
function selectSuggestion(suggestion) {
    tableSearch.value = suggestion
    showSuggestions.value = false
}

const anyLoading = computed(() => Object.values(loadingColumns.value).some(Boolean))

function resetPreviewTable() {
    tableStore.tableData = []
    tableStore.pagination.current_page = 1
    tableStore.pagination.last_page = 1
    tableStore.pagination.total = 0
}

function showTableInfo(table) {
    modalType.value = 'table'
    modalTitle.value = formatName(table)
    showModal.value = true
}

function showColumnInfo(table, col) {
    modalType.value = 'column'
    modalTitle.value = `${col} in ${formatName(table)}`
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    modalType.value = null
    modalTitle.value = ''
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

const filteredCategories = computed(() => {
    if (!categorySearch.value) return categories.value
    return categories.value.filter(cat =>
        cat.label.toLowerCase().includes(categorySearch.value.toLowerCase())
    )
})

const filteredTables = computed(() => {
    if (selectedCategoryIdx.value === null) return []
    const tables = filteredCategories.value[selectedCategoryIdx.value]?.children || []
    if (!tableSearch.value) return tables
    return tables.filter(t =>
        formatName(t).toLowerCase().includes(tableSearch.value.toLowerCase())
    )
})

const openStates = ref([false, false, false, false])

function toggleDropdown(idx) {
    openStates.value = openStates.value.map((open, i) => i === idx ? !open : false)
    if (openStates.value[idx]) {
        selectedCategoryIdx.value = idx
        tableSearch.value = ''
    }
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
