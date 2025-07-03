<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavHeader from './components/NavHeader.vue'
import FooterComponent from './components/FooterComponent.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavHeader />

    <main class="flex-1">
      <RouterView />
    </main>

    <FooterComponent class="fixed bottom-0 left-0 w-full z-50" />
  </div>
</template>

<style>
/* Estilos globales si son necesarios */
</style>
