import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import App from "./App.vue";
import "element-plus/dist/index.css";
import "@/assets/base.css";
import "vue-json-pretty/lib/styles.css";

import VueCodemirror from "vue-codemirror";
import { basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.provide("API_URL", import.meta.env.VITE_API_URL);
app.provide("WS_PORT", import.meta.env.VITE_WS_PORT);

app.use(createPinia());
app.use(ElementPlus);

app.use(VueCodemirror, {
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  placeholder: "Mocks goes here",
  extensions: [basicSetup, json()],
});

app.mount("#app");
