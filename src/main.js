import "./assets/main.css";

import { createApp } from "vue";

import { createPinia } from "pinia";

import App from "./App.vue";

import router from "./router.js";
import { useThemeStore } from "./stores/theme.js";

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);

useThemeStore(pinia).init();

app.use(router);

app.mount("#app");
