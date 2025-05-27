<template>
    <div class="flex flex-col min-h-screen h-screen">
        <GlobalNotification />
        <Loader v-if="loadingStore.isLoading" />
        <TopBar>
            <template #topbar>
                <slot name="topbar"></slot>
            </template>
        </TopBar>
        <div class="flex flex-1 min-h-0">
            <Sidebar class="h-full">
                <template #sidebar>
                    <slot name="sidebar"></slot>
                </template>
            </Sidebar>
            <PreviewContent class="flex-1 overflow-auto bg-white">
                <div
                    class="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-white-100 to-gray-200">
                    <Run />
                    <DownloadButton />
                </div>
                <slot>
                    <PreviewTable />
                </slot>
            </PreviewContent>
        </div>
    </div>
</template>

<script setup>
import TopBar from "../Layouts/TopBar.vue";
import Sidebar from "../Layouts/SideBar.vue";
import PreviewContent from "../Layouts/CenterBar.vue";
import DownloadButton from "../Components/DownloadButton.vue";
import Run from "../Components/Run.vue";
import PreviewTable from "../Components/PreviewTable.vue";
import GlobalNotification from "../Components/GlobalNotification.vue";
import Loader from "../Components/Loader.vue";
import { useLoadingStore } from '../stores/useLoadingStore'

const loadingStore = useLoadingStore()
</script>
