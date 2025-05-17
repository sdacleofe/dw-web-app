<template>
  <div class="fixed bottom-8 right-8 z-50 flex flex-col-reverse gap-4 max-w-lg w-full">
    <transition-group name="fade" tag="div">
      <Notification v-for="notif in notifications" :key="notif.id" :title="notif.title" :message="notif.message"
        :type="notif.type" :visible="true" @close="hide(notif.id)" />
    </transition-group>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notificationStore'
import Notification from './Notification.vue'
import { storeToRefs } from 'pinia'

const notification = useNotificationStore()
const { notifications } = storeToRefs(notification)
const { hide } = notification
</script>
