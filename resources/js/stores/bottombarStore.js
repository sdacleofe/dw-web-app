import { defineStore } from 'pinia'

export const useBottomBarStore = defineStore('bottomBar', {
    state: () => ({
        isVisible: false,
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
