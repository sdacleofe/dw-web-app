<template>
  <main class="preview-content flex-1 flex flex-col bg-gray-50 min-h-0 shadow-inner p-0">
    <div class="flex-1 pb-6 overflow-y-auto">
      <slot></slot>
    </div>
    <BottomBar />
  </main>
</template>

<script setup>
import BottomBar from '../Layouts/BottomBar.vue'
</script>
