<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { toolsMenu } from '../data/toolsMenu'

// Construir los items del menú a partir del repositorio centralizado
type PrimeMenuItem = {
  label: string
  icon?: string
  command?: () => void
  items?: PrimeMenuItem[]
}

const router = useRouter()
const mobileMenu = ref<InstanceType<typeof Menu> | null>(null)
const isMobileMenuVisible = ref(false)

const toggleMobileMenu = (event: MouseEvent) => {
  mobileMenu.value?.toggle(event)
  isMobileMenuVisible.value = !isMobileMenuVisible.value
}

// Generar los subitems de herramientas desde toolsMenu
const herramientasSubItems: PrimeMenuItem[] = toolsMenu.map((tool) => ({
  label: tool.label,
  // icon: '', // Si quieres mapear a iconos pi, aquí
  command: () => router.push(tool.route),
}))

const menuItems: PrimeMenuItem[] = [
  {
    label: 'Inicio',
    icon: 'pi pi-home',
    command: () => router.push('/'),
  },
  ...herramientasSubItems,
]

const items: PrimeMenuItem[] = [
  {
    label: 'Inicio',
    icon: 'pi pi-home',
    command: () => router.push('/'),
  },
  {
    label: 'Juegos',
    icon: 'pi pi-star',
    items: herramientasSubItems,
  },
]
</script>

<template>
  <header class="fixed top-0 left-0 right-0 nav-gradient z-50">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-white">🎮 Juegos web</span>
        </div>

        <!-- Menú de escritorio -->
        <nav class="hidden md:block">
          <Menubar :model="items" class="bg-transparent border-none">
            <template #item="{ item, props }">
              <a v-bind="props.action" class="p-menuitem-link flex items-center">
                <span class="p-menuitem-icon">
                  <!-- Icono SVG para subitems de herramientas -->
                  <template v-if="items[1].items && (items[1].items as any[]).includes(item)">
                    <component
                      v-if="item.label && toolsMenu.find((t) => t.label === item.label)?.icon"
                      :is="toolsMenu.find((t) => t.label === item.label)?.icon"
                      :class="[
                        'w-4 h-4',
                        toolsMenu.find((t) => t.label === item.label)?.iconColor || '',
                      ]"
                    />
                  </template>
                  <!-- Icono PrimeVue para Inicio y Herramientas -->
                  <template v-else-if="item.icon">
                    <i :class="item.icon"></i>
                  </template>
                </span>
                <span class="p-menuitem-text">{{ item.label }}</span>
              </a>
            </template>
          </Menubar>
        </nav>

        <!-- Botón de menú móvil -->
        <div class="block md:hidden">
          <Button
            icon="pi pi-bars"
            @click="toggleMobileMenu"
            class="p-button-text p-button-white"
          />

          <Menu ref="mobileMenu" :model="menuItems" :popup="true" class="w-full mobile-menu" />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
:deep(.p-menubar) {
  background: transparent;
  border: none;
  padding: 0;
}

:deep(.p-menuitem-text) {
  color: black !important;
}

/* Texto oscuro solo en los submenús */
:deep(.p-menubar .p-submenu-list .p-menuitem-text) {
  color: #222 !important;
}

:deep(.p-menuitem-icon) {
  color: white !important;
}

:deep(.p-submenu-icon) {
  color: white !important;
}

:deep(.p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.p-button-text.p-button-white) {
  color: white !important;
}

:deep(.p-button-text.p-button-white:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.mobile-menu) {
  width: 100vw !important;
  position: fixed !important;
  top: 4rem !important;
  left: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  background: #1e40af !important;

  .p-menuitem {
    width: 100%;

    .p-menuitem-link {
      padding: 1rem !important;
      color: white !important;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .p-menuitem-icon,
      .p-menuitem-text {
        color: white !important;
      }
    }
  }
}

.container {
  max-width: 1280px;
}
.nav-gradient {
  /* fallback for old browsers */
  background: #6a11cb;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right, rgba(72, 107, 173, 0.9), rgba(7, 9, 255, 1));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(
    75deg,
    rgba(72, 107, 173, 1) 0%,
    rgba(15, 28, 184, 1) 25%,
    rgba(86, 58, 235, 1) 50%,
    rgba(43, 101, 162, 1) 75%,
    rgba(7, 9, 255, 1) 100%
  );
}
</style>
