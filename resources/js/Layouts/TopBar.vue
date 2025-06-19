<template>
    <!-- Header bar with flex layout, background, and shadow -->
    <header class="flex items-center bg-white text-gray-900 px-4 sm:px-6 min-h-16 py-2 sm:py-0 shadow">
        <!-- Container for logo and title, responsive flex direction -->
        <div class="flex flex-col sm:flex-row items-center justify-center flex-1 w-full">
            <!-- Logo image -->
            <img src="/depdev-logo.png" alt="Logo" class="h-10 w-10" />
            <!-- Department title, hidden on small screens -->
            <h1 class="hidden sm:block text-base sm:text-lg font-semibold text-center px-1">
                Department of Economy, Planning and Development
            </h1>
        </div>
    </header>
</template>
<script setup>
    // No script logic needed for this header
</script>
