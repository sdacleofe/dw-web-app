<template>
    <div class="notif-stack">
        <transition-group name="fade" tag="div">
            <Notification
                v-for="notif in notifications"
                :key="notif.id"
                :visible="true"
                :type="notif.type"
                :title="
                    notif.type === 'error'
                        ? 'Error'
                        : notif.type === 'success'
                        ? 'Success'
                        : 'Notification'
                "
                :message="notif.message"
                @close="notificationStore.hide(notif.id)"
            />
        </transition-group>
    </div>
    <form
        @submit.prevent="runQuery"
        class="flex flex-col w-full h-full bg-white p-4"
    >
        <div class="relative w-full flex-1">
            <div
                class="pointer-events-none absolute top-2 left-0 pl-2 pr-3 text-xs text-gray-400 font-mono select-none"
                style="user-select: none; min-width: 2em"
                :style="{
                    height: Math.max(query.split('\n').length, 3) * 1.5 + 'em',
                }"
            >
                <template
                    v-for="n in Math.max(query.split('\n').length, 3)"
                    :key="n"
                >
                    <div>{{ n }}</div>
                </template>
            </div>
            <textarea
                v-model="query"
                rows="3"
                class="w-full h-full min-h-[200px] pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                placeholder="Write your SQL query..."
                style="line-height: 1.5; min-height: 100%; min-width: 100%"
                spellcheck="false"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
            ></textarea>
        </div>
        <div
            v-if="result"
            class="mt-3 bg-green-50 border border-green-100 rounded p-3 text-xs text-green-800 font-mono shadow-sm"
        >
            <strong>Result:</strong> {{ result }}
        </div>
    </form>
</template>

<script setup>
import { ref, watch } from "vue";
import Notification from "./Notification.vue";
import { useNotificationStore } from "@/stores/notificationStore";
import { storeToRefs } from "pinia";
import { defineExpose } from "vue";
import { useTableStore } from "../stores/tableStore";

const query = ref("");
const result = ref("");

const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);
const tableStore = useTableStore();

watch(query, (val, oldVal) => {
    if (
        tableStore.selectedTable &&
        /\bfrom\s*$/i.test(val) &&
        (!oldVal || !/\bfrom\s*$/i.test(oldVal))
    ) {
        query.value = val + " " + tableStore.selectedTable + " ";
    }
});

let lastTable = tableStore.selectedTable;
watch(
    () => tableStore.selectedTable,
    (newTable, oldTable) => {
        if (!newTable || newTable !== oldTable) {
            query.value = "";
            result.value = "";
        }
        lastTable = newTable;
    }
);

async function runQuery() {
    const trimmedQuery = query.value.trim();
    if (!trimmedQuery) {
        notificationStore.show({
            type: "error",
            message: "Please enter a SQL query.",
        });
        result.value = "";
        return;
    }
    result.value = "";
    const response = await tableStore.runQuery(trimmedQuery);
    if (response.success) {
        notificationStore.show({
            type: "success",
            message: "Query executed successfully!",
        });
        result.value = `Returned ${tableStore.tableData.length} rows.`;
    } else {
        notificationStore.show({
            type: "error",
            message: response.error || "Query failed.",
        });
        result.value = "";
    }
}

defineExpose({ runQuery });
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
