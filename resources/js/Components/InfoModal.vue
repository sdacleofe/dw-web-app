<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
        @click.self="$emit('close')">
        <div
            class="bg-white rounded-2xl p-8 min-w-[340px] max-w-[95vw] border border-blue-200 shadow-2xl animate-fade-in relative">
            <button @click="$emit('close')"
                class="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors" aria-label="Close">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" />
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" />
                </svg>
            </button>
            <div class="flex flex-col items-center mb-6">
                <div class="flex items-center gap-2 mb-2">
                    <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" />
                        <circle cx="12" cy="8" r="1" fill="currentColor" />
                    </svg>
                    <h2 class="text-2xl font-extrabold text-blue-700">
                        {{ column ? 'Column Details' : 'Table Details' }}
                    </h2>
                </div>
                <p class="text-gray-500 text-sm">
                    {{ column
                        ? 'Here you can find more information about this column and its purpose in the dataset.'
                        : 'Here you can find more information about this table and its contents.' }}
                </p>
            </div>
            <div class="space-y-3">
                <div>
                    <span class="font-semibold text-gray-700">Table Name:</span>
                    <span class="ml-1 px-2 py-1 rounded bg-blue-50 text-blue-800 font-mono text-base">
                        {{ table ? table : 'Unknown Table' }}
                    </span>
                </div>
                <div v-if="column">
                    <span class="font-semibold text-gray-700">Column Name:</span>
                    <span class="ml-1 px-2 py-1 rounded bg-blue-50 text-blue-800 font-mono text-base">{{ column
                        }}</span>
                </div>
                <div class="mt-3 text-gray-600 text-sm italic border-t pt-3">
                    <slot>
                        No additional information is available for this {{ column ? 'column' : 'table' }} at the moment.
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    show: Boolean,
    table: String,
    column: String
})
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.25s cubic-bezier(.4, 2, .6, 1);
}
</style>
