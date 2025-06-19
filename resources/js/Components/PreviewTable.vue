<template>
    <div class="p-4">
        <Loader v-if="loading" />
        <!-- Show table and controls if columns are known -->
        <div v-if="allColumns.length">
            <!-- Entries per page selector -->
            <div class="flex flex-wrap items-center gap-2 mb-6 bg-gray-50 px-4 py-3 rounded-lg ">
                <label for="perPage" class="text-sm text-gray-700 font-medium">Show</label>
                <div class="relative">
                    <select id="perPage" v-model.number="tableStore.pagination.per_page" @change="onPerPageChange"
                        class="appearance-none border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-blue-200 bg-white transition">
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                    </select>
                    <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400"></span>
                </div>
                <span class="text-sm text-gray-700 font-medium">entries</span>
            </div>
            <div class="overflow-x-auto w-full rounded-lg border border-gray-200 shadow bg-white">
                <table class="min-w-full w-max">
                    <thead>
                        <tr class="bg-gray-50 border-b">
                            <th v-for="key in visibleColumns" :key="key"
                                class="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                <div class="relative flex items-center">
                                    <input v-model="filters[key]" @input="onFilterChange"
                                        class="w-full px-7 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 text-xs text-center font-bold uppercase"
                                        :placeholder="key" />
                                    <div class="absolute inset-y-0 right-1 flex flex-col justify-center gap-0.5">
                                        <button @click="sortBy(key, 'asc')" :aria-label="`Sort ${key} ascending`"
                                            type="button" tabindex="-1">
                                            <svg class="w-3 h-3"
                                                :class="sort.column === key && sort.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'"
                                                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <button class="focus:outline-none" @click="sortBy(key, 'desc')"
                                            :aria-label="`Sort ${key} descending`" type="button" tabindex="-1">
                                            <svg class="w-3 h-3"
                                                :class="sort.column === key && sort.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'"
                                                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!filteredTableData.length">
                            <td :colspan="visibleColumns.length" class="text-center text-gray-400 py-6">
                                No data found for current filters.
                            </td>
                        </tr>
                        <tr v-for="(row, rowIndex) in filteredTableData" :key="rowIndex"
                            class="hover:bg-blue-50 transition">
                            <td v-for="key in visibleColumns" :key="key"
                                class="px-4 py-2 text-sm text-gray-700 border-b whitespace-nowrap">
                                {{ row[key] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="pagination.total > 0"
                class="flex flex-wrap justify-between items-center gap-4 mt-4 text-sm text-gray-700">
                <div>
                    Showing
                    {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }}
                    to
                    {{
                        Math.min(
                            pagination.current_page * pagination.per_page,
                            pagination.total
                    )
                    }}
                    of {{ pagination.total }} entries
                </div>
                <div v-if="pagination.last_page > 1" class="flex items-center gap-2">
                    <button class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        :disabled="pagination.current_page === 1" @click="changePage(1)" title="First">
                        &laquo; First
                    </button>
                    <button class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)"
                        title="Previous">
                        Prev
                    </button>
                    <span>
                        Page {{ pagination.current_page }} of {{ pagination.last_page }}
                    </span>
                    <button class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        :disabled="pagination.current_page === pagination.last_page"
                        @click="changePage(pagination.current_page + 1)" title="Next">
                        Next
                    </button>
                    <button class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        :disabled="pagination.current_page === pagination.last_page"
                        @click="changePage(pagination.last_page)" title="Last">
                        Last &raquo;
                    </button>
                </div>
            </div>

        </div>
        <!-- Show this only if no columns are known (no table selected) -->
        <div v-else class="flex flex-col items-center justify-center h-40 text-gray-400">
            <svg class="w-12 h-12 mb-3 text-blue-200" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span class="text-lg font-semibold">
                No table selected or no data to display.
            </span>
            <span class="text-sm">
                Please select a table to preview its data.
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import { useTableStore } from '../stores/tableStore'
import { storeToRefs } from 'pinia'
import Loader from './Loader.vue'

const tableStore = useTableStore()
const { tableData, pagination, selectedTable } = storeToRefs(tableStore)
const loading = ref(false)
const filters = reactive({})

// Column selection logic
const allColumns = ref([])
const visibleColumns = ref([])

// Only update columns if structure changes (not just data)
watch(
    () => tableStore.tableData.length ? Object.keys(tableStore.tableData[0]).join(',') : allColumns.value.join(','),
    (cols) => {
        // If there is data, update columns from data
        if (tableStore.tableData.length) {
            allColumns.value = Object.keys(tableStore.tableData[0])
        }
        // If visibleColumns is empty or columns changed, show all columns
        if (
            visibleColumns.value.length === 0 ||
            visibleColumns.value.some(col => !allColumns.value.includes(col))
        ) {
            visibleColumns.value = [...allColumns.value]
        }
        // Initialize filters for new columns
        allColumns.value.forEach((key) => {
            if (!(key in filters)) {
                filters[key] = ''
            }
        })
    },
    { immediate: true }
)

function onFilterChange() {
    changePage(1)
}

function onPerPageChange() {
    changePage(1)
}

async function changePage(page) {
    if (pagination.value.table) {
        loading.value = true;
        await tableStore.fetchTableDataYajra(
            pagination.value.table,
            page,
            pagination.value.per_page,
            null,
            filters,
            sort // pass sort object
        );
        loading.value = false;
    }
}

const sort = reactive({
    column: '',
    direction: 'asc'
})

function sortBy(column, direction) {
    if (sort.column !== column || sort.direction !== direction) {
        sort.column = column
        sort.direction = direction
        changePage(1)
    }
}

// Case-insensitive filtering on the client side
const filteredTableData = computed(() => {
    // If no filters, return all data
    if (!Object.values(filters).some(f => f)) return tableStore.tableData

    return tableStore.tableData.filter(row =>
        visibleColumns.value.every(key => {
            const filterValue = filters[key]
            if (!filterValue) return true
            const cellValue = row[key] != null ? String(row[key]) : ''
            return cellValue.toLowerCase().includes(filterValue.toLowerCase())
        })
    )
})
</script>
