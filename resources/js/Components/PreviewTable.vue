<template>
  <div class="p-4 bg-white">
    <!-- Pagination Controls (Top) -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
      <div class="text-sm text-gray-600">
        <template v-if="tableStore.pagination.total > 0">
          <span class="font-medium">Showing </span>
          <span class="font-semibold text-gray-800">
            {{ (tableStore.pagination.current_page - 1) * tableStore.pagination.per_page + 1 }}
          </span>
          <span class="font-medium"> to </span>
          <span class="font-semibold text-gray-800">
            {{
              Math.min(
                tableStore.pagination.current_page * tableStore.pagination.per_page,
                tableStore.pagination.total
              )
            }}
          </span>
          <span class="font-medium"> of </span>
          <span class="font-semibold text-gray-800">{{ tableStore.pagination.total }}</span>
          <span class="font-medium"> entries</span>
        </template>
        <template v-else>
          <span class="font-medium">Showing 0 to 0 of 0 entries</span>
        </template>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === 1"
          @click="goToPage(1)"
        >
          « First
        </button>
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === 1"
          @click="goToPage(tableStore.pagination.current_page - 1)"
        >
          ‹ Prev
        </button>
        <span class="px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded">
          Page <span class="font-semibold">{{ tableStore.pagination.current_page }}</span>
          of <span class="font-semibold">{{ tableStore.pagination.last_page }}</span>
        </span>
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === tableStore.pagination.last_page"
          @click="goToPage(tableStore.pagination.current_page + 1)"
        >
          Next ›
        </button>
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === tableStore.pagination.last_page"
          @click="goToPage(tableStore.pagination.last_page)"
        >
          Last »
        </button>
      </div>
    </div>
    <Loader v-if="loading" />
    <v-data-table
      v-else
      :headers="headers"
      :items="tableStore.tableData"
      :loading="loading"
      class="elevation-1"
      :items-per-page="tableStore.pagination.per_page"
      :page="tableStore.pagination.current_page"
      :server-items-length="tableStore.pagination.total"
      hide-default-footer
      style="background: #f9fafb; border-radius: 8px;"
    >
      <template #headers="{ columns }">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="align-middle"
            style="vertical-align: middle; background: #f3f4f6; padding: 10px 14px; border-bottom: 1px solid #e5e7eb;"
          >
            <div class="flex items-center justify-end gap-2">
              <input
                v-model="search[column.key]"
                type="text"
                :placeholder="column.title"
                @input="onSearch"
                style="width: 100%; min-width: 150px; max-width: 350px; font-size: 13px; background: #fff; border-radius: 6px; border: 1px solid #d1d5db; padding: 4px 8px;"
                class="my-0 py-0 shadow-sm focus:ring-2 focus:ring-blue-100"
              />
              <button
                class="flex flex-col items-center justify-center p-0.5 rounded hover:bg-blue-50 transition"
                @click="toggleSort(column.key)"
                style="min-width: 24px; min-height: 24px;"
                type="button"
                tabindex="-1"
                :title="sortBy === column.key ? (sortDesc ? 'Sort descending' : 'Sort ascending') : 'Sort'"
              >
                <svg
                  v-if="sortBy === column.key"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <g>
                    <path
                      v-if="!sortDesc"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v12m0 0l-6-6m6 6l6-6"
                      class="text-blue-500"
                      :class="{'opacity-100': sortBy === column.key, 'opacity-40': sortBy !== column.key}"
                    />
                    <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 18V6m0 0l-6 6m6-6l6 6"
                      class="text-blue-500"
                      :class="{'opacity-100': sortBy === column.key, 'opacity-40': sortBy !== column.key}"
                    />
                  </g>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <g>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m0 0l-6-6m6 6l6-6" />
                  </g>
                </svg>
              </button>
            </div>
          </th>
        </tr>
      </template>
      <template #no-data>
        <div class="flex flex-col items-center justify-center h-40 text-gray-400">
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
      </template>
    </v-data-table>
    <!-- Pagination Controls (Bottom) -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
      <div class="text-sm text-gray-600">
        <template v-if="tableStore.pagination.total > 0">
          <span class="font-medium">Showing </span>
          <span class="font-semibold text-gray-800">
            {{ (tableStore.pagination.current_page - 1) * tableStore.pagination.per_page + 1 }}
          </span>
          <span class="font-medium"> to </span>
          <span class="font-semibold text-gray-800">
            {{
              Math.min(
                tableStore.pagination.current_page * tableStore.pagination.per_page,
                tableStore.pagination.total
              )
            }}
          </span>
          <span class="font-medium"> of </span>
          <span class="font-semibold text-gray-800">{{ tableStore.pagination.total }}</span>
          <span class="font-medium"> entries</span>
        </template>
        <template v-else>
          <span class="font-medium">Showing 0 to 0 of 0 entries</span>
        </template>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === 1"
          @click="goToPage(1)"
        >
          « First
        </button>
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === 1"
          @click="goToPage(tableStore.pagination.current_page - 1)"
        >
          ‹ Prev
        </button>
        <span class="px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded">
          Page <span class="font-semibold">{{ tableStore.pagination.current_page }}</span>
          of <span class="font-semibold">{{ tableStore.pagination.last_page }}</span>
        </span>
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === tableStore.pagination.last_page"
          @click="goToPage(tableStore.pagination.current_page + 1)"
        >
          Next ›
        </button>
        <button
          class="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
          :disabled="tableStore.pagination.current_page === tableStore.pagination.last_page"
          @click="goToPage(tableStore.pagination.last_page)"
        >
          Last »
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTableStore } from '../stores/tableStore'
import { storeToRefs } from 'pinia'
import Loader from './Loader.vue'

const tableStore = useTableStore()
const { tableData } = storeToRefs(tableStore)
const loading = ref(false)

const headers = computed(() =>
  tableData.value.length
    ? Object.keys(tableData.value[0]).map(key => ({
        title: key,
        key: key,
      }))
    : []
)

const search = ref({})
const sortBy = ref('')
const sortDesc = ref(false)

/**
 * Sequential sorting:
 * - First click: descending
 * - Second click: ascending
 * - Third click: no sort
 * - Then repeat
 */
function toggleSort(column) {
  if (sortBy.value !== column) {
    sortBy.value = column
    sortDesc.value = true // First click: descending
  } else if (sortBy.value === column && sortDesc.value) {
    sortDesc.value = false // Second click: ascending
  } else if (sortBy.value === column && !sortDesc.value) {
    sortBy.value = ''
    sortDesc.value = false // Third click: no sort
  }
  onSearch()
}

function onSearch() {
  tableStore.fetchTableData(
    tableStore.selectedTable,
    1,
    null,
    search.value,
    sortBy.value,
    sortBy.value ? (sortDesc.value ? 'desc' : 'asc') : null
  )
}

function goToPage(page) {
  if (
    page >= 1 &&
    page <= tableStore.pagination.last_page &&
    page !== tableStore.pagination.current_page
  ) {
    tableStore.fetchTableData(
      tableStore.selectedTable,
      page,
      null,
      search.value,
      sortBy.value,
      sortBy.value ? (sortDesc.value ? 'desc' : 'asc') : null
    )
  }
}
</script>
