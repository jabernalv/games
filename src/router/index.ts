import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/buscaminas',
      name: 'buscaminas',
      component: () => import('../components/MinesWeeper.vue'),
    },
    {
      path: '/tetris',
      name: 'tetris',
      component: () => import('../components/Tetris.vue'),
    },
    {
      path: '/space-invaders',
      name: 'space-invaders',
      component: () => import('../components/SpaceInvaders.vue'),
    },
    {
      path: '/pong',
      name: 'pong',
      component: () => import('../components/Pong.vue'),
    },
  ],
})

export default router
