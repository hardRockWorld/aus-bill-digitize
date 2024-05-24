import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

const ordersSessionStorage = useSessionStorage("orders", []);

export const useOrderStore = defineStore("orders", {
  state: () => ({
    orders: [],
  }),
  actions: {
    saveOrders(orders) {
      this.orders = orders ?? [];
      // Save orders to sessionStorage
      sessionStorage.setItem("orders", JSON.stringify(orders));
      ordersSessionStorage.value = orders;
    },

    pushOrder(order) {
      this.orders.unshift(order);
      // Save orders to sessionStorage
      sessionStorage.setItem("orders", JSON.stringify(this.orders));
      ordersSessionStorage.value = this.orders;
    },

    getOrders() {
      // Retrieve orders from sessionStorage
      const storedOrders = sessionStorage.getItem("orders");
      this.orders = storedOrders ? JSON.parse(storedOrders) : [];
      return this.orders;
    },

    clearOrders() {
      // Clear orders from sessionStorage
      sessionStorage.removeItem("orders");
      ordersSessionStorage.value = [];
      this.orders = [];
    },
  },
});
