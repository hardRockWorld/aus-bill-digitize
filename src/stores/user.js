// src/stores/userSessionStore.js
import { defineStore } from "pinia";

export const useSessionStore = defineStore("userSessionStore", {
  state: () => ({
    user: null,
    isLoggedIn: false,
  }),
  actions: {
    setUser(user, email, isLoggedIn, timestamp) {
      this.user = { ...user, email, timestamp };
      this.isLoggedIn = isLoggedIn;
    },
    removeUser() {
      this.user = null;
      this.isLoggedIn = false;
    },
    getUserLoggedIn() {
      return this.isLoggedIn;
    },
  },
});
