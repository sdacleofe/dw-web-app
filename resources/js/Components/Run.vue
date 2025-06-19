<template>
    <div class="flex items-center h-12 px-4">
        <button
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded flex items-center gap-2"
            @click="runAction" :disabled="isLoading">
            <span v-if="isLoading">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
            </span>
            <span v-else class="flex items-center gap-1">
                <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4l10 6-10 6V4z" />
                </svg>
            </span>
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTableStore } from '../stores/tableStore'
import { useNotificationStore } from '@/stores/notificationStore'

const isLoading = ref(false)
const tableStore = useTableStore()
const notification = useNotificationStore()

async function runAction() {
    if (!tableStore.selectedTable) {
        notification.show({
            title: 'No Table Selected',
            message: 'Please select a table first',
            type: 'error'
        })
        return
    }
    isLoading.value = true
    const selectedColsSet = tableStore.selectedColumns[tableStore.selectedTable]
    const selectedCols = selectedColsSet ? Array.from(selectedColsSet) : []
    await tableStore.fetchTableData(tableStore.selectedTable, 1, selectedCols)
    isLoading.value = false
}
</script>
