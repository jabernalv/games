import {
  createRouter,
  createWebHashHistory, // No cambiar a createWebHistory poque se rompe la  navegación
  type RouteRecordRaw,
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/buscaminas',
    name: 'buscaminas',
    component: () => import('@/components/MinesWeeper.vue'),
  },
  {
    path: '/tetris',
    name: 'tetris',
    component: () => import('@/components/Tetris.vue'),
  },
  {
    path: '/space-invaders',
    name: 'space-invaders',
    component: () => import('@/components/SpaceInvaders.vue'),
  },
  {
    path: '/pong',
    name: 'pong',
    component: () => import('@/components/Pong.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
