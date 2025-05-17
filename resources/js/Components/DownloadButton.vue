<template>
    <div class="flex items-center h-12 px-4">
        <button
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded flex items-center gap-2"
            @click="downloadCSV" :disabled="loadingStore.isLoading || !canDownload">
            <span v-if="loadingStore.isLoading">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
            </span>
            <span v-else>Download CSV</span>
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTableStore } from '../stores/tableStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useLoadingStore } from '../stores/useLoadingStore'

const tableStore = useTableStore()
const notificationStore = useNotificationStore()
const loadingStore = useLoadingStore()

const csvSource = computed(() => {
    if (tableStore.tableData && tableStore.tableData.length) {
        const headers = Object.keys(tableStore.tableData[0])
        const rows = tableStore.tableData.map(row => headers.map(h => row[h]))
        return {
            headers,
            rows,
            tableName: tableStore.selectedTable || 'query_result',
            isTable: true
        }
    }
    return null
})

const canDownload = computed(() =>
    csvSource.value &&
    csvSource.value.headers &&
    csvSource.value.rows &&
    csvSource.value.rows.length > 0
)

async function downloadCSV() {
    if (!csvSource.value) {
        notificationStore.show({
            type: 'error',
            title: 'No Data Selected',
            message: 'Select a table before downloading CSV.'
        })
        return
    }

    loadingStore.start()
    let headers = csvSource.value.headers
    let rows = csvSource.value.rows
    let tableName = csvSource.value.tableName

    if (
        csvSource.value.isTable &&
        tableStore.selectedTable &&
        tableStore.pagination.total > tableStore.pagination.per_page
    ) {
        try {
            const res = await fetch(`/export-all/${tableStore.selectedTable}`)
            const json = await res.json()
            headers = json.headers
            rows = json.data.map(row => headers.map(h => row[h]))
            tableName = tableStore.selectedTable
        } catch (e) {
            notificationStore.show({
                type: 'error',
                title: 'Download Failed',
                message: 'Failed to fetch all data for CSV.'
            })
            loadingStore.stop()
            return
        }
    }

    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const safeTableName = (tableName || 'table').replace(/[^a-zA-Z0-9_-]/g, '_')
    const filename = `${safeTableName}-preview-${yyyy}-${mm}-${dd}.csv`

    const csvRows = [
        headers.join(','),
        ...rows.map(row =>
            row
                .map(cell =>
                    typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
                        ? `"${cell.replace(/"/g, '""')}"`
                        : cell
                )
                .join(',')
        ),
    ]

    const csvContent = csvRows.join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    loadingStore.stop()
}
</script>
