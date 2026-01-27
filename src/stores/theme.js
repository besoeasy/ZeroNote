import { defineStore } from "pinia";
import { computed, ref } from "vue";

const STORAGE_KEY = "ZERONOTE_THEME";

export const useThemeStore = defineStore("theme", () => {
  const preference = ref("system"); // 'system' | 'light' | 'dark'

  const getSystemTheme = () => {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const resolvedTheme = computed(() => {
    if (preference.value === "system") return getSystemTheme();
    return preference.value;
  });

  const applyThemeToDom = () => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const isDark = resolvedTheme.value === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  };

  const setPreference = (next) => {
    preference.value = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyThemeToDom();
  };

  const toggle = () => {
    setPreference(resolvedTheme.value === "dark" ? "light" : "dark");
  };

  const init = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        preference.value = saved;
      }
    } catch {
      // ignore
    }

    applyThemeToDom();

    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (preference.value === "system") applyThemeToDom();
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleChange);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleChange);
      }
    }
  };

  return {
    preference,
    resolvedTheme,
    init,
    toggle,
    setPreference,
  };
});
