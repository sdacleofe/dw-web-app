<template>
    <div class="p-4">
        <Loader v-if="loading" />
        <div v-if="tableStore.tableData.length">
            <div class="flex items-center justify-between mb-4">
                <span
                    class="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm border border-blue-200 shadow-sm">
                    <svg class="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Rows: <span class="ml-1 font-bold">{{ tableStore.pagination.total }}</span>
                </span>
                <div v-if="pagination.last_page > 1" class="flex items-center gap-2">
                    <button :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)"
                        class="px-2 py-1 border rounded">Prev</button>
                    <span>Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
                    <button :disabled="pagination.current_page === pagination.last_page"
                        @click="changePage(pagination.current_page + 1)" class="px-2 py-1 border rounded">Next</button>
                </div>
            </div>
            <div class="overflow-x-auto w-full">
                <table class="min-w-full w-max border border-gray-200 rounded-lg shadow-sm bg-white">
                    <thead>
                        <tr class="bg-gray-100">
                            <th v-for="(val, key) in tableStore.tableData[0]" :key="key"
                                class="px-4 py-2 text-left text-sm font-semibold border-b text-gray-700 whitespace-nowrap"
                                scope="col">
                                {{ key }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in tableStore.tableData" :key="rowIndex" class="hover:bg-gray-50">
                            <td v-for="(val, key) in row" :key="key"
                                class="px-4 py-2 text-sm text-gray-600 border-b whitespace-nowrap">
                                {{ val }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTableStore } from '../stores/tableStore'
import { storeToRefs } from 'pinia'
import Loader from './Loader.vue'

const tableStore = useTableStore()
const { tableData, pagination } = storeToRefs(tableStore)
const loading = ref(false)

function changePage(page) {
    loading.value = true
    if (pagination.value.isQuery) {
        tableStore.fetchQueryPage(page).then(() => {
            loading.value = false
        })
    } else if (pagination.value.table) {
        tableStore.fetchTableData(pagination.value.table, page)
        setTimeout(() => { loading.value = false }, 500)
    } else {
        loading.value = false
    }
}
</script>
