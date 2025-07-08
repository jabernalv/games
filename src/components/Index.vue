<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Fieldset from 'primevue/fieldset'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import { toolsMenu } from '@/data/toolsMenu'
import { computed } from 'vue'
import { Code, ShieldCheck, Table, Calendar, FileEdit, Key, Palette } from 'lucide-vue-next'

// Mapeo de categorías a íconos
const categoryIcons: { [key: string]: any } = {
  Codificación: Code,
  Conversión: Table,
  Colores: Palette,
  Generadores: Key,
  Seguridad: ShieldCheck,
  Texto: FileEdit,
  Utilidades: Calendar,
}

// Agrupar herramientas por categoría
const groupedTools = computed(() => {
  const groups: { [key: string]: typeof toolsMenu } = {}
  toolsMenu.forEach((tool) => {
    if (!groups[tool.category]) {
      groups[tool.category] = []
    }
    groups[tool.category].push(tool)
  })
  return groups
})

// Obtener categorías ordenadas
const categories = computed(() => {
  return Object.keys(groupedTools.value).sort()
})
</script>

<template>
  <div class="min-h-screen bg-surface-ground py-6 pt-25">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-extrabold text-primary-700 mb-2 flex items-center justify-center">
          🛠️ Caja de herramientas Web
        </h1>
        <p class="text-xl text-surface-600">Juegos web</p>
      </header>
    </div>
    <div class="flex justify-center h-screen">
      <div class="w-full md:w-4/5 mx-auto flex justify-center">
        <Accordion class="w-full" :value="[]">
          <AccordionPanel v-for="(category, idx) in categories" :key="category" :value="idx">
            <AccordionHeader>
              <div class="">
                <component
                  v-if="categoryIcons[category]"
                  :is="categoryIcons[category]"
                  class="w-5 h-5 mr-3 text-primary-600"
                />
                <span>{{ category }} ({{ groupedTools[category].length }})</span>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Fieldset v-for="tool in groupedTools[category]" :key="tool.route">
                  <template #legend>
                    <component
                      :is="tool.icon"
                      :class="['w-6 h-6 mr-3 flex-shrink-0', tool.iconColor]"
                    />
                    {{ tool.label }}
                  </template>
                  <RouterLink :to="tool.route" class="block p-6">
                    <p class="text-surface-700 text-sm">
                      {{ tool.description }}
                    </p>
                    <div :class="['mt-4 font-medium flex items-center', tool.linkColor]">
                      {{ tool.linkText }}
                      <i class="pi pi-arrow-right ml-1"></i>
                    </div>
                  </RouterLink>
                </Fieldset>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
