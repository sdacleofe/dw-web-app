<template>
    <transition name="sidebar-fade">
        <div v-if="visible && isMobile" class="fixed inset-0 bg-black bg-opacity-40 z-30" @click="toggleSidebar"></div>
    </transition>
    <transition name="sidebar-slide">
        <aside v-if="visible" v-bind="$attrs" :class="[
            'bg-white text-gray-900 p-6 flex flex-col shadow-lg border border-gray-200 transition-all duration-200',
            isMobile
                ? 'fixed top-0 left-0 h-full w-4/5 max-w-xs min-w-[200px] z-40'
                : 'relative min-w-[300px] flex-shrink-0 h-full',
            $attrs.class
        ]" :style="!isMobile ? { width: sidebarWidth + 'px' } : {}">
            <div class="flex justify-end mb-2">
                <button
                    class="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow"
                    @click="toggleSidebar" style="z-index:20" title="Hide sidebar">&#10005;</button>
            </div>
            <!-- Make Explorer scrollable and fix its height -->
            <div class="mb-8 flex-1 min-h-0">
                <div class="h-full overflow-y-auto pr-2">
                    <Explorer ref="explorerRef" />
                </div>
            </div>
            <slot></slot>
            <div v-if="!isMobile"
                class="resizer-handle absolute top-0 right-0 h-full w-3 flex items-center justify-center cursor-ew-resize z-10"
                @mousedown="startResize" style="user-select: none;">
                <span class="resizer-bar"></span>
            </div>
        </aside>
    </transition>
    <transition name="sidebar-fade">
        <button v-if="!visible" class="fixed left-0 top-4 bg-gray-200 rounded-r-lg px-3 py-2 shadow"
            @click="toggleSidebar" style="z-index:20" title="Show sidebar">&#9776;</button>
    </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Explorer from '../Components/Explorer.vue'
import { useSidebarStore } from '../stores/sidebar'
import { useAttrs } from 'vue'

const $attrs = useAttrs()

const explorerRef = ref(null)
const sidebarWidth = ref(240)
let isResizing = false

const isMobile = ref(window.innerWidth < 1024)
const sidebarStore = useSidebarStore()

const visible = ref(sidebarStore.isOpen)

watch(() => sidebarStore.isOpen, (newVal) => {
    visible.value = newVal
})

function toggleSidebar() {
    sidebarStore.toggle()
}

function startResize(e) {
    if (isMobile.value) return
    isResizing = true
    document.body.style.cursor = 'ew-resize'
}

function stopResize() {
    isResizing = false
    document.body.style.cursor = ''
}

function handleResize(e) {
    if (!isResizing || isMobile.value) return
    const minWidth = 180
    const maxWidth = 680
    const newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX))
    sidebarWidth.value = newWidth
    if (newWidth <= minWidth + 5) {
        sidebarStore.close()
        isResizing = false
        document.body.style.cursor = ''
    }
}

function handleWindowResize() {
    isMobile.value = window.innerWidth < 1024
    if (!isMobile.value) {
        sidebarStore.open()
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

<script>
export default {
    inheritAttrs: false
}
</script>

<style scoped>
aside {
    transition: width 0.2s, left 0.2s;
}

.resizer-handle {
    background: transparent;
    transition: background 0.2s;
}

.resizer-handle:hover,
.resizer-handle:active {
    background: rgba(0, 0, 0, 0.04);
}

.resizer-bar {
    width: 6px;
    height: 40px;
    background: #cbd5e1;
    border-radius: 3px;
    box-shadow: 0 0 2px #888;
    display: block;
    transition: background 0.2s;
}

.resizer-handle:hover .resizer-bar,
.resizer-handle:active .resizer-bar {
    background: #64748b;
}

/* Sidebar slide transition */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
    transition: all 0.3s cubic-bezier(.4, 0, .2, 1);
}

.sidebar-slide-enter-from {
    transform: translateX(-120%);
    opacity: 0;
}

.sidebar-slide-enter-to {
    transform: translateX(0);
    opacity: 1;
}

.sidebar-slide-leave-from {
    transform: translateX(0);
    opacity: 1;
}

.sidebar-slide-leave-to {
    transform: translateX(-120%);
    opacity: 0;
}

/* Fade for backdrop and button */
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
    transition: opacity 0.3s;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
    opacity: 0;
}

.sidebar-fade-enter-to,
.sidebar-fade-leave-from {
    opacity: 1;
}
</style>
