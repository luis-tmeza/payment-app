import { createRouter, createWebHistory } from 'vue-router';
import ProductPage from '../views/ProductPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'product',
      component: ProductPage,
    },
  ],
});
