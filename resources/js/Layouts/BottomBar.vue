<template>
    <transition name="bottombar-fade">
        <div v-if="visible && isMobile" class="fixed inset-0 bg-black bg-opacity-40 z-30" @click="toggleBottombar">
        </div>
    </transition>
    <transition name="bottombar-slide-fade">
        <div v-if="visible && bottombarHeight > minHeight"
            class="bottombar min-h-[250px] w-full bg-white text-gray-700 flex flex-col px-6 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] border-t border-gray-200 z-20 overflow-x-auto relative"
            :style="{ height: bottombarHeight + 'px' }">
            <div class="flex items-center justify-between w-full h-14 border-b border-gray-100 relative">
                <div class="flex items-center gap-4">
                    <span class="text-base font-semibold text-gray-800 tracking-wide">SQL QUERY</span>
                    <button type="button"
                        class="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                        @click="runQueryRef?.runQuery()">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <polygon points="6,4 16,10 6,16" />
                        </svg>
                        Run Query
                    </button>
                </div>
                <div class="resize-handle absolute left-0 top-0 w-full h-2 cursor-ns-resize z-30"
                    @mousedown="startResize" style="user-select: none;">
                    <span class="resize-bar"></span>
                </div>
                <button
                    class="bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center z-40 ml-2 mt-1"
                    @click="minimizeBottombar" title="Minimize" style="transition: background 0.2s;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-width="2" d="M6 18L18 18" />
                    </svg>
                </button>
            </div>
            <!-- Main content -->
            <div class="flex-1 flex items-center">
                <RunQuery ref="runQueryRef" />
            </div>
        </div>
    </transition>
    <transition name="bottombar-fade">
        <button v-if="!visible || bottombarHeight <= minHeight"
            class="fixed left-1/2 -translate-x-1/2 bottom-2 bg-gray-200 rounded px-3 py-1 shadow z-30"
            @click="toggleBottombar" title="Show bottombar">▲</button>
    </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useBottomBarStore } from '../stores/bottombarStore'
import { useAttrs } from 'vue'
import RunQuery from '../Components/RunQuery.vue'

const $attrs = useAttrs()

const minHeight = 250
const maxHeight = 500
const bottombarHeight = ref(300)
let isResizing = false

const isMobile = ref(window.innerWidth < 1024)
const bottomBarStore = useBottomBarStore()

const visible = ref(bottomBarStore.isVisible)

const runQueryRef = ref(null)

watch(() => bottomBarStore.isVisible, (newVal) => {
    visible.value = newVal
})

function toggleBottombar() {
    bottomBarStore.toggle()
    // If showing, restore height if minimized
    if (bottomBarStore.isVisible && bottombarHeight.value <= minHeight) {
        bottombarHeight.value = 300
    }
    // If hiding, minimize height
    if (!bottomBarStore.isVisible) {
        bottombarHeight.value = 0
    }
}

function startResize(e) {
    if (isMobile.value) return
    isResizing = true
    document.body.style.cursor = 'ns-resize'
}

function stopResize() {
    isResizing = false
    document.body.style.cursor = ''
}

function handleResize(e) {
    if (!isResizing || isMobile.value) return
    const windowHeight = window.innerHeight
    const newHeight = Math.min(maxHeight, Math.max(minHeight, windowHeight - e.clientY))
    bottombarHeight.value = newHeight
    if (newHeight <= minHeight + 5) {
        bottomBarStore.hide()
        isResizing = false
        document.body.style.cursor = ''
    }
}

function minimizeBottombar() {
    bottombarHeight.value = 0
    bottomBarStore.hide()
}

function handleWindowResize() {
    isMobile.value = window.innerWidth < 1024
    if (!isMobile.value) {
        bottomBarStore.show()
    }
    if (isMobile.value) {
        isResizing = false
        document.body.style.cursor = ''
    }
}

onMounted(() => {
    window.addEventListener('mousemove', handleResize)
    window.addEventListener('mouseup', stopResize)
    window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleResize)
    window.removeEventListener('mouseup', stopResize)
    window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped>
.bottombar-slide-fade-enter-active,
.bottombar-slide-fade-leave-active {
    transition: all 0.35s cubic-bezier(.4, 0, .2, 1);
}

.bottombar-slide-fade-enter-from {
    opacity: 0;
    transform: translateY(100%);
}

.bottombar-slide-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.bottombar-slide-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.bottombar-slide-fade-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.bottombar-fade-enter-active,
.bottombar-fade-leave-active {
    transition: opacity 0.3s;
}

.bottombar-fade-enter-from,
.bottombar-fade-leave-to {
    opacity: 0;
}

.bottombar-fade-enter-to,
.bottombar-fade-leave-from {
    opacity: 1;
}
</style>
