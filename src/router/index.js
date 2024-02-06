import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "screeningForm",
    component: () => import("../components/TheScreeningForm.vue"),
  },
  {
    path: "/results",
    name: "results",
    component: () => import("../components/TheResults.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
