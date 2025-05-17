import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: []
    }),
    actions: {
        show({ title, message, type = 'info', duration = 3000 }) {
            const id = Date.now() + Math.random()
            this.notifications.push({ id, title, message, type })
            setTimeout(() => this.hide(id), duration)
        },
        hide(id) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        }
    }
    
})
