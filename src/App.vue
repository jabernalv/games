<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavHeader from '@/components/NavHeader.vue'
import FooterComponent from '@/components/FooterComponent.vue'
</script>

<template>
  <NavHeader />
  <RouterView />
  <FooterComponent class="fixed bottom-0 left-0 w-full z-50" />
</template>

<style></style>
