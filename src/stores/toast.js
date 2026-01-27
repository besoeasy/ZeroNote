import { defineStore } from "pinia";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: [],
  }),
  actions: {
    push({ type = "info", title = "", message = "", durationMs = 3500 } = {}) {
      const id = uid();
      const toast = { id, type, title, message, durationMs };
      this.toasts.push(toast);
      if (durationMs > 0) {
        setTimeout(() => this.remove(id), durationMs);
      }
      return id;
    },
    success(message, title = "Success") {
      return this.push({ type: "success", title, message });
    },
    error(message, title = "Error") {
      return this.push({ type: "error", title, message, durationMs: 6000 });
    },
    info(message, title = "Info") {
      return this.push({ type: "info", title, message });
    },
    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
    clear() {
      this.toasts = [];
    },
  },
});
