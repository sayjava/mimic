import { createRouter, createWebHistory } from 'vue-router'
import Records from '../views/Records.vue'
import Mocks from '../views/Mocks.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "records",
      component: Records,
    },
    {
      path: "/mocks",
      name: "mocks",
      component: Mocks,
    },
  ],
});

export default router
