import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTableStore = defineStore('table', () => {
    const dbTables = ref([])
    const tableData = ref([])
    const selectedTable = ref(null)
    const pagination = ref({
        current_page: 1,
        last_page: 1,
        per_page: 100,
        total: 0,
        table: null,
        isQuery: false,
        query: null,
    })

    async function fetchDbTables() {
        try {
            const res = await fetch('/api/tables')
            dbTables.value = await res.json()
        } catch (e) {
            dbTables.value = []
        }
    }

    async function fetchTableData(table, page = 1) {
        selectedTable.value = table
        const res = await fetch(`/export/${table}?page=${page}`)
        const json = await res.json()
        tableData.value = json.data || json
        if (json.current_page) {
            pagination.value = {
                current_page: json.current_page,
                last_page: json.last_page,
                per_page: json.per_page,
                total: json.total,
                table,
                isQuery: false,
                query: null,
            }
        } else {
            pagination.value = {
                current_page: 1,
                last_page: 1,
                per_page: 100,
                total: tableData.value.length,
                table,
                isQuery: false,
                query: null,
            }
        }
    }

    async function runQuery(query, page = 1, perPage = 100) {
    if (!selectedTable.value) return { success: false, error: 'No table selected.' }
    try {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
            },
            body: JSON.stringify({
                query,
                table: selectedTable.value,
                page,
                per_page: perPage,
            }),
        })
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        tableData.value = json.data || []
        pagination.value = {
            current_page: json.current_page || 1,
            last_page: json.last_page || 1,
            per_page: json.per_page || (json.data ? json.data.length : 0),
            total: json.total || (json.data ? json.data.length : 0),
            table: selectedTable.value,
            isQuery: true,
            query,
        }
        return { success: true }
    } catch (err) {
        tableData.value = []
        pagination.value = {
            current_page: 1,
            last_page: 1,
            per_page: 0,
            total: 0,
            table: null,
            isQuery: false,
            query: null,
        }
        return { success: false, error: err.message }
    }
}

    async function fetchQueryPage(page) {
        if (!pagination.value.isQuery) return
        await runQuery(pagination.value.query, page, pagination.value.per_page)
    }

    function setSelectedTable(table) {
        selectedTable.value = table
    }

    return {
        dbTables, tableData, selectedTable, pagination,
        fetchDbTables, fetchTableData, setSelectedTable, runQuery, fetchQueryPage
    }
})
