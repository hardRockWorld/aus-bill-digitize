import { createApp } from "vue";
import "./style.css";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import Password from "primevue/password";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Column from "primevue/column";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Aura from "./presets/aura"; // import the Aura preset
import router from "./router/index";
// import client from "pocketbase";
import pbClient from "./pocketbase";
import { createPinia } from "pinia";
import App from "./App.vue";

// Import PrimeVue CSS files
// import "primevue/resources/themes/md-light-indigo/theme.css"; // Choose the theme you like
// import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);

// use the vue plugin for primeVue
app.use(PrimeVue, {
  unstyled: true,
  pt: Aura, // use the Aura preset
});

app.use(ToastService);

// Register PrimeVue components globally
app.component("Card", Card);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Button", Button);
app.component("Dropdown", Dropdown);
app.component("Dialog", Dialog);
app.component("FloatLabel", FloatLabel);
app.component("InputText", InputText);
app.component("InputNumber", InputNumber);
app.component("Tag", Tag);
app.component("Password", Password);
app.component("Calendar", Calendar);
app.component("Toast", Toast);

// Make PocketBase instance available globally
// app.config.globalProperties.$pb = pbClient;

app.use(createPinia());

// use the router
app.use(router);
app.provide(pbClient);

app.mount("#app");
