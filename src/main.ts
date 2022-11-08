import { createApp } from "vue";
import "./styles/style.css";
import "./styles/card.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
// import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { camelCaseToLine } from "@/util/str-util";
import "@/util/bluecrypt-acme.js";
const app = createApp(App);
// app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(`el-icon${camelCaseToLine(key)}`, component);
}
app.use(router);
app.use(createPinia());
app.mount("#app");
