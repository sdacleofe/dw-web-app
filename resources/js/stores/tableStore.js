import { defineStore } from "pinia";
import { ref } from "vue";

export const useTableStore = defineStore("table", () => {
    const dbTables = ref([]);
    const tableData = ref([]);
    const selectedTable = ref(null);
    const selectedColumns = ref({});

    const pagination = ref({
        current_page: 1,
        last_page: 1,
        per_page: 100,
        total: 0,
        table: null,
    });

    async function fetchDbTables() {
        try {
            const res = await fetch("/api/tables");
            dbTables.value = await res.json();
        } catch (e) {
            dbTables.value = [];
        }
    }

    async function setSelectedColumns(table, columns) {
        selectedColumns.value[table] = new Set(columns);
    }

    // Old method (for reference)
    async function fetchTableData(table, page = 1, columns = null) {
        selectedTable.value = table;
        let url = `/export/${table}?page=${page}`;
        if (columns && columns.length > 0) {
            url += `&columns=${encodeURIComponent(columns.join(","))}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        tableData.value = json.data || json;
        if (json.current_page) {
            pagination.value = {
                current_page: json.current_page,
                last_page: json.last_page,
                per_page: json.per_page,
                total: json.total,
                table,
            };
        } else {
            pagination.value = {
                current_page: 1,
                last_page: 1,
                per_page: json.length,
                total: json.length,
                table,
            };
        }
    }

    // New Yajra-powered method with column-based filtering support
    async function fetchTableDataYajra(table, page = 1, perPage = 100, columns = null, filters = {}) {
        selectedTable.value = table;
        const start = (page - 1) * perPage;
        let url = `/api/yajra-table/${table}?start=${start}&length=${perPage}`;
        if (columns && columns.length > 0) {
            url += `&columns=${encodeURIComponent(columns.join(","))}`;
        }
        // Add filters as query params for column-based search
        Object.entries(filters).forEach(([key, value]) => {
            if (value) url += `&columns_search[${encodeURIComponent(key)}]=${encodeURIComponent(value)}`;
        });
        const res = await fetch(url);
        const json = await res.json();
        tableData.value = json.data || [];
        pagination.value = {
            current_page: page,
            last_page: Math.ceil((json.recordsTotal || 1) / perPage),
            per_page: perPage,
            total: json.recordsTotal || 0,
            table,
        };
    }

    async function fetchTableColumns(table) {
        try {
            const res = await fetch(`/api/table-columns/${table}`);
            if (!res.ok) throw new Error("Failed to fetch columns");
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async function runQuery(query) {
        if (!selectedTable.value) {
            return { success: false, error: "No table selected." };
        }
        try {
            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            const res = await fetch("/api/query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": token,
                },
                body: JSON.stringify({ query, table: selectedTable.value }),
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            tableData.value = json.data || [];
            pagination.value = {
                current_page: 1,
                last_page: 1,
                per_page: json.data ? json.data.length : 0,
                total: json.total || (json.data ? json.data.length : 0),
                table: null,
            };
            return { success: true };
        } catch (err) {
            tableData.value = [];
            pagination.value = {
                current_page: 1,
                last_page: 1,
                per_page: 0,
                total: 0,
                table: null,
            };
            return { success: false, error: err.message };
        }
    }

    function setSelectedTable(table) {
        selectedTable.value = table;
    }

    return {
        dbTables,
        tableData,
        selectedTable,
        pagination,
        fetchDbTables,
        fetchTableData,
        fetchTableDataYajra, // <-- expose the new method
        setSelectedTable,
        runQuery,
        fetchTableColumns,
        selectedColumns,
        setSelectedColumns,
    };
});
