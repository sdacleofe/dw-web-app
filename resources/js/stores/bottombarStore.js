import { defineStore } from 'pinia'

export const useBottomBarStore = defineStore('bottomBar', {
    state: () => ({
        isVisible: true,
    }),
    actions: {
        toggle() {
            this.isVisible = !this.isVisible
        },
        show() {
            this.isVisible = true
        },
        hide() {
            this.isVisible = false
        },
    },
})
