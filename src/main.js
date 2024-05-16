import { createApp } from "vue";
import "./style.css";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import Password from "primevue/password";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Column from "primevue/column";
import Lara from "./presets/lara"; // import the Aura preset
import router from "./router/index";
import App from "./App.vue";

const app = createApp(App);

// use the vue plugin for primeVue
app.use(PrimeVue, {
  unstyled: true,
  pt: Lara, // use the Aura preset
});

// Register PrimeVue components globally
app.component("Card", Card);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Button", Button);
app.component("Dropdown", Dropdown);
app.component("FloatLabel", FloatLabel);
app.component("InputText", InputText);
app.component("InputNumber", InputNumber);
app.component("Tag", Tag);
app.component("Password", Password);

// use the router
app.use(router);

app.mount("#app");
