import { Code, SquareStack, Rocket, Zap } from 'lucide-vue-next'

export interface ToolMenuItem {
  label: string
  icon: any
  iconColor?: string
  route: string
  description: string
  linkText: string
  linkColor: string
  category: string
}

export const toolsMenu: ToolMenuItem[] = [
  {
    label: 'Buscaminas',
    icon: Code,
    iconColor: 'text-teal-500',
    route: '/buscaminas',
    description: 'Juego de Buscaminas clásico.',
    linkText: 'Ir al juego',
    linkColor: 'text-teal-600 hover:text-teal-800',
    category: 'Clásicos',
  },
  {
    label: 'Tetris',
    icon: SquareStack,
    iconColor: 'text-indigo-500',
    route: '/tetris',
    description: 'Juego de Tetris clásico.',
    linkText: 'Ir al juego',
    linkColor: 'text-indigo-600 hover:text-indigo-800',
    category: 'Clásicos',
  },
  {
    label: 'Space Invaders',
    icon: Rocket,
    iconColor: 'text-pink-500',
    route: '/space-invaders',
    description: 'Juego clásico de marcianitos.',
    linkText: 'Ir al juego',
    linkColor: 'text-pink-600 hover:text-pink-800',
    category: 'Clásicos',
  },
  {
    label: 'Pong',
    icon: Zap,
    iconColor: 'text-yellow-500',
    route: '/pong',
    description: 'Juego clásico de Pong.',
    linkText: 'Ir al juego',
    linkColor: 'text-yellow-600 hover:text-yellow-800',
    category: 'Clásicos',
  },
]
