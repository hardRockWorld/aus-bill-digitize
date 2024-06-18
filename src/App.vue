<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, RouterView, useRouter, useRoute } from "vue-router";
import { useSessionStore } from "./stores/user";
import { useOrderStore } from "./stores/orders";
import pb from "./pocketbase";

const sessionStore = useSessionStore();
const orderStore = useOrderStore();
const router = useRouter();
const route = useRoute();
const routePath = computed(() => route.path);

const proxyIsLoggedIn = ref(sessionStore.getUserLoggedIn());
const currentUser = ref(null);
const showLogout = ref(false); // State to show/hide logout option

const checkAuthState = async () => {
  showLogout.value = false; // Reset showLogout state on auth state check
  if (pb.authStore.isValid) {
    const user = pb.authStore.model;
    proxyIsLoggedIn.value = true;
    currentUser.value = user;
    sessionStore.setUser(user, user.email, true, new Date().getTime());
  } else {
    sessionStore.removeUser();
    proxyIsLoggedIn.value = false;
    currentUser.value = null;
  }
};

onMounted(() => {
  checkAuthState();
  pb.authStore.onChange(checkAuthState); // Listen to auth state changes
});

const logout = async () => {
  try {
    await pb.authStore.clear(); // Clear the auth store
    console.log("Logged out");
    orderStore.clearOrders();
    sessionStorage.removeItem("dataFetched");
    sessionStore.removeUser();
    proxyIsLoggedIn.value = false;
    router.push("/login");
  } catch (error) {
    console.log(error);
  }
};

const toggleLogout = () => {
  showLogout.value = !showLogout.value;
};
</script>

<template>
  <header>
    <nav class="bg-gray-800">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                class="hidden h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
          >
            <div class="flex flex-shrink-0 items-center">
              <img
                class="h-8 w-auto"
                src="../src/assets/srinivas-logo-transparent.png"
                alt="Srinivas Ayurved"
              />
            </div>
            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <RouterLink
                  to="/"
                  class="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium"
                  aria-current="page"
                  v-if="proxyIsLoggedIn"
                  >Home
                </RouterLink>
                <RouterLink
                  to="/orders"
                  class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
                  v-if="proxyIsLoggedIn"
                  >Order Entry
                </RouterLink>
                <RouterLink
                  to="/login"
                  class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
                  v-if="!proxyIsLoggedIn && routePath !== '/login'"
                  >Login
                </RouterLink>
              </div>
            </div>
          </div>
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
          >
            <div class="relative ml-3">
              <div>
                <button
                  @click="toggleLogout"
                  type="button"
                  class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span class="sr-only">Open user menu</span>
                  <img
                    class="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </button>
              </div>
              <transition name="fade">
                <div
                  v-if="showLogout && proxyIsLoggedIn"
                  class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabindex="-1"
                >
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabindex="-1"
                    id="user-menu-item-2"
                    @click.prevent="logout"
                    >Logout</a
                  >
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
      <div class="sm:hidden" id="mobile-menu">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <RouterLink
            to="/"
            class="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium"
            aria-current="page"
            v-if="proxyIsLoggedIn"
            >Home
          </RouterLink>
          <RouterLink
            to="/orders"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            v-if="proxyIsLoggedIn"
            >Order Entry
          </RouterLink>
          <RouterLink
            to="/login"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            v-if="!proxyIsLoggedIn && routePath !== '/login'"
            >Login
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
  <main class="flex items-center justify-center">
    <RouterView class="m-6 w-3/4" />
  </main>
  <footer class="text-center">
    <div>
      <small>Made with 💛 by <span class="author-name">Gourab</span></small>
    </div>
  </footer>
</template>

<style scoped>
.router-view {
  width: 60%;
  margin: auto;
}

.author-name {
  font-weight: 200;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
