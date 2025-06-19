<template>
    <transition name="fade">
        <div v-if="visible"
            class="fixed bottom-8 right-8 z-50 bg-white bg-opacity-80 border-t-4 rounded-b text-blue-900 px-6 py-4 shadow-lg max-w-lg w-full backdrop-blur-sm"
            :style="`border-top-color: ${color};`" role="alert">
            <div class="flex">
                <div class="py-1">
                    <svg class="fill-current h-6 w-6 mr-4" :style="`color: ${color};`"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path
                            d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                    </svg>
                </div>
                <div>
                    <p class="font-bold">{{ title }}</p>
                    <p class="text-sm">{{ message }}</p>
                </div>
                <button @click="closeNotification" class="ml-auto transition-colors duration-200"
                    :style="`color: ${color};`" aria-label="Close">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Notice'
    },
    message: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        required: true
    },
    type: {
        type: String,
        default: 'info'
    }
})

const color = computed(() => {
    if (props.type === 'error') return 'rgb(220,38,38)'
    if (props.type === 'success') return 'rgb(22,163,74)'
    return 'rgb(37,99,235)'
})

const emit = defineEmits(['update:visible', 'close'])

function closeNotification() {
    emit('update:visible', false)
    emit('close')
}
</script>
