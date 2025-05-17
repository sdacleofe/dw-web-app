import { defineStore } from 'pinia';

export const useBottomBarStore = defineStore('bottomBar', {
    state: () => ({
        isVisible: true,
    }),
    actions: {
        toggle() {
            this.isVisible = !this.isVisible;
        },
        hide() {
            this.isVisible = false;
        },
        show() {
            this.isVisible = true;
        },
    },
});
