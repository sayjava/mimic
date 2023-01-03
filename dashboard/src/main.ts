import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import App from "./App.vue";
import router from "./router";
import "element-plus/dist/index.css";
import "@/assets/base.css";
import "vue-json-pretty/lib/styles.css";

import VueCodemirror from "vue-codemirror";
import { basicSetup } from "codemirror";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.provide("API_URL", import.meta.env.VITE_API_URL);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.use(VueCodemirror, {
  // optional default global options
  autofocus: true,
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  placeholder: "Code goes here...",
  extensions: [basicSetup],
  // ...
});

app.mount("#app");
