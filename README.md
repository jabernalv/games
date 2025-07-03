# Vue.js + TypeScript + Vite + Pinia + PrimeVue + Tailwind CSS 4 + Capacitor

Proyecto completo con todas las tecnologías modernas para desarrollo web y móvil.

## 🚀 Tecnologías Incluidas

- **Vue.js 3** - Framework progresivo de JavaScript
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Build tool rápida y moderna
- **Pinia** - Store de estado para Vue.js
- **PrimeVue** - Biblioteca de componentes UI
- **Prime Icons** - Iconos para PrimeVue
- **Tailwind CSS 4** - Framework CSS utility-first
- **Lucide Icons** - Iconos modernos y hermosos
- **Axios** - Cliente HTTP para navegador y Node.js
- **ExcelJS** - Biblioteca para trabajar con archivos Excel
- **Capacitor** - Framework para aplicaciones móviles nativas

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build

# Formatear código
pnpm format

# Linting
pnpm lint
```

## 🏗️ Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes Vue
├── router/          # Configuración de rutas
├── stores/          # Stores de Pinia
├── services/        # Servicios (API, etc.)
├── views/           # Vistas/páginas
└── main.ts          # Punto de entrada
```

## 📱 Desarrollo Móvil con Capacitor

### iOS

```bash
# Construir el proyecto
pnpm build

# Sincronizar con iOS
npx cap sync ios

# Abrir en Xcode
npx cap open ios
```

### Android

```bash
# Construir el proyecto
pnpm build

# Sincronizar con Android
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

## 🎨 Características del Proyecto

### Componente de Ejemplo

El proyecto incluye un componente de ejemplo (`ExampleComponent.vue`) que demuestra:

- **Pinia Store**: Contador reactivo con estado global
- **PrimeVue Components**: Botones, inputs, textarea, toast
- **Tailwind CSS 4**: Estilos modernos y responsivos
- **Lucide Icons**: Iconos hermosos y consistentes
- **ExcelJS**: Exportación de datos a Excel
- **Axios**: Configuración para llamadas API

### Configuración Incluida

- **PrimeVue**: Configurado con tema Lara Light Blue
- **Tailwind CSS 4**: Configurado sin archivo de configuración (nueva sintaxis)
- **Axios**: Instancia configurada con interceptores
- **Capacitor**: Inicializado para iOS y Android
- **TypeScript**: Configurado con Vue 3
- **ESLint + Prettier**: Configuración para código limpio

## 🔧 Scripts Disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Construir para producción
- `pnpm preview` - Vista previa de producción
- `pnpm lint` - Linting del código
- `pnpm format` - Formatear código
- `npx cap sync` - Sincronizar con plataformas móviles

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://tu-api.com
```

## 🎯 Próximos Pasos

1. Personalizar el tema de PrimeVue
2. Agregar más componentes según necesidades
3. Configurar autenticación
4. Implementar PWA features
5. Configurar CI/CD
6. Agregar tests unitarios

## 📄 Licencia

MIT
