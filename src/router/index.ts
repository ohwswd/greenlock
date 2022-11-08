import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Detail from "@/components/Detail.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Detail",
    component: Detail,
  },
  {
    path: "/Verify",
    name: "Verify",
    component: () => import("@/components/Verify.vue"),
  },
  {
    path: "/Success",
    name: "Success",
    component: () => import("@/components/Success.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
