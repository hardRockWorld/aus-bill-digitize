import client from "pocketbase";
import { createRouter, createWebHistory } from "vue-router";
import pbClient from "../pocketbase";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      meta: { requiresAuth: true },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/Home.vue"),
    },
    {
      path: "/login",
      name: "Login",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../components/Login.vue"),
    },
    {
      path: "/orders",
      name: "Order Entry",
      meta: { requiresAuth: true },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/OrderEntry.vue"),
    },
    // {
    //   path: "/orders/:id",
    //   name: "Order Detail",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/OrderDetail.vue"),
    // },
    // {
    //   path: "/orders/:id/edit",
    //   name: "Order Edit",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/OrderEdit.vue"),
    // },
  ],
});
router.beforeEach((to, from, next) => {
  const isAuthenticated = pbClient.authStore.isValid;

  if (to.name !== "Login" && !isAuthenticated) {
    next({ name: "Login" });
  } else if (to.name === "Login" && isAuthenticated) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
