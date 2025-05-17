<template>
    <header class="flex items-center bg-white text-gray-900 px-4 sm:px-6 min-h-16 py-2 sm:py-0 shadow relative">
        <div class="flex flex-col sm:flex-row items-center justify-center flex-1 w-full">
            <img src="/depdev-logo.png" alt="Logo" class="h-10 w-10" />
            <h1 class="hidden sm:block text-base sm:text-lg font-semibold text-center px-1">
                Department of Economy, Planning and Development
            </h1>
        </div>
        <button
            class="absolute right-16 top-1/2 -translate-y-1/2 bg-white-200  w-8 h-8 flex items-center justify-center "
            @click="toggleSidebar" title="Toggle sidebar" style="z-index:20">
            <img :src="sidebarStore.isOpen ? '/img/icons/toggle-sidebar-on.svg' : '/img/icons/toggle-sidebar-off.svg'"
                alt="Toggle sidebar" class="w-5 h-5" />
        </button>
        <button
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-white-200  w-8 h-8 flex items-center justify-center "
            @click="toggleBottomBar" title="Toggle bottombar" style="z-index:20">
            <img :src="bottomBarStore.isVisible ? '/img/icons/toggle-bottombar-on.svg' : '/img/icons/toggle-bottombar-off.svg'"
                alt="Toggle bottombar" class="w-5 h-5" />
        </button>
    </header>
</template>

<script setup>
import { useSidebarStore } from '../stores/sidebar'
import { useBottomBarStore } from '../stores/bottombarStore'
const sidebarStore = useSidebarStore()
const bottomBarStore = useBottomBarStore()
function toggleSidebar() {
    sidebarStore.toggle()
}
function toggleBottomBar() {
    bottomBarStore.toggle()
}
</script>
