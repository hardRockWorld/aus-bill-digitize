import { createApp } from "vue";
import "./style.css";
import PrimeVue from "primevue/config";
import Aura from "./presets/aura"; // import the Aura preset
import router from "./router/index";
import App from "./App.vue";

const app = createApp(App);

// use the vue plugin for primeVue
app.use(PrimeVue, {
  unstyled: true,
  pt: Aura, // use the Aura preset
});

// use the router
app.use(router);

app.mount("#app");
