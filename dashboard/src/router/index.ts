import { createRouter, createWebHistory } from "vue-router";
import Records from "../views/Records.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "records",
      component: Records,
    }
  ],
});

export default router;
