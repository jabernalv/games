// ./src/router/index.ts
// ⚠️ ADVERTENCIA: NO CAMBIAR createWebHashHistory por createWebHistory
// Rompe la navegación en producción y desarrollo. Consulta con el responsable antes de modificar esto.
import {
  createRouter,
  createWebHashHistory, // ⚠️ NO CAMBIAR a createWebHistory: ROMPE la navegación. ¡Consulta antes de tocar esto!
  type RouteRecordRaw,
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/Index.vue'),
  },
  // { // Eliminada la ruta /about porque el archivo AboutView.vue no existe
  //   path: '/about',
  //   name: 'about',
  //   component: () => import('@/views/AboutView.vue'),
  // },
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
