import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
    const loadingCount = ref(0)
    const isLoading = ref(false)

    function start() {
        loadingCount.value++
        isLoading.value = true
    }
    function stop() {
        loadingCount.value = Math.max(0, loadingCount.value - 1)
        if (loadingCount.value === 0) isLoading.value = false
    }
    function reset() {
        loadingCount.value = 0
        isLoading.value = false
    }

    return { isLoading, start, stop, reset }
})
