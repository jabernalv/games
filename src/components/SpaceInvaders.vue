<template>
  <div
    class="min-h-screen min-w-screen fixed inset-0 z-0 bg-gradient-to-br from-[#222] via-[#444] to-[#222] flex items-center justify-center"
  >
    <div class="spaceinvaders-container relative z-10">
      <canvas ref="gameCanvas" width="480" height="320"></canvas>
      <div class="info-panel">
        <span>Puntaje: {{ score }}</span>
        <span>Vidas: {{ lives }}</span>
      </div>
      <div class="controls">
        <button
          class="button"
          @mousedown="moveLeftStart"
          @mouseup="moveLeftStop"
          @touchstart.prevent="moveLeftStart"
          @touchend.prevent="moveLeftStop"
        >
          Izquierda
        </button>
        <button class="button" @click="fire">Disparar</button>
        <button
          class="button"
          @mousedown="moveRightStart"
          @mouseup="moveRightStop"
          @touchstart.prevent="moveRightStart"
          @touchend.prevent="moveRightStop"
        >
          Derecha
        </button>
      </div>
      <div v-if="gameOver" class="game-over">
        <div class="game-over-content">
          <h2>¡Juego Terminado!</h2>
          <p>Puntaje Final: {{ score }}</p>
          <button class="button" @click="restart">Jugar de Nuevo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const canvasWidth = 480
const canvasHeight = 320
const playerWidth = 30
const playerHeight = 20
const playerY = canvasHeight - playerHeight - 10
const playerSpeed = 5
const bulletRadius = 5
const bulletSpeed = 10
const alienRows = 3
const alienCols = 6
const alienWidth = 20
const alienHeight = 15
const alienPadding = 10
const alienOffsetTop = 30
const alienOffsetLeft = 30
const alienSpeedY = 10

const gameCanvas = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const lives = ref(3)
const gameOver = ref(false)

let playerX = canvasWidth / 2 - playerWidth / 2
let movingLeft = false
let movingRight = false
let playerBullets: { x: number; y: number }[] = []
let aliens: { x: number; y: number; visible: boolean }[][] = []
let alienSpeedX = 1
let alienDirection = 1
let animationId: number | null = null

// Animación de marcianos (dos frames)
const alienFrames = [
  // Frame 1: abierto
  [
    [0, 1, 0],
    [1, 1, 1],
    [1, 1, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  // Frame 2: cerrado
  [
    [0, 1, 0],
    [1, 1, 1],
    [1, 1, 1],
    [0, 1, 0],
    [1, 0, 1],
  ],
]
let alienFrameIdx = 0
let alienAnimTimer: number | null = null

// Disparos enemigos
let alienBullets: { x: number; y: number }[] = []
const alienBulletSpeed = 4
const alienFireInterval = 60 // frames
let alienFireCounter = 0

function createAliens() {
  aliens = []
  for (let c = 0; c < alienCols; c++) {
    aliens[c] = []
    for (let r = 0; r < alienRows; r++) {
      const alienX = c * (alienWidth + alienPadding) + alienOffsetLeft
      const alienY = r * (alienHeight + alienPadding) + alienOffsetTop
      aliens[c][r] = { x: alienX, y: alienY, visible: true }
    }
  }
}

function drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const frame = alienFrames[alienFrameIdx]
  for (let row = 0; row < frame.length; row++) {
    for (let col = 0; col < frame[row].length; col++) {
      if (frame[row][col]) {
        ctx.fillStyle = 'red'
        ctx.fillRect(x + col * 3, y + row * 3, 3, 3)
      }
    }
  }
}

function draw() {
  const ctx = gameCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  // Fondo
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // Jugador
  ctx.fillStyle = 'lime'
  ctx.fillRect(playerX, playerY, playerWidth, playerHeight)
  // Balas jugador
  for (const bullet of playerBullets) {
    ctx.beginPath()
    ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'yellow'
    ctx.fill()
    ctx.closePath()
  }
  // Balas alien
  for (const bullet of alienBullets) {
    ctx.beginPath()
    ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.closePath()
  }
  // Aliens
  for (let c = 0; c < alienCols; c++) {
    for (let r = 0; r < alienRows; r++) {
      if (aliens[c][r].visible) {
        drawAlien(ctx, aliens[c][r].x, aliens[c][r].y)
      }
    }
  }
}

function movePlayer() {
  if (movingLeft && playerX > 0) {
    playerX -= playerSpeed
  }
  if (movingRight && playerX < canvasWidth - playerWidth) {
    playerX += playerSpeed
  }
}

function moveBullets() {
  for (let i = 0; i < playerBullets.length; i++) {
    playerBullets[i].y -= bulletSpeed
    if (playerBullets[i].y < 0) {
      playerBullets.splice(i, 1)
      i--
    }
  }
}

function moveAliens() {
  let hitEdge = false
  for (let c = 0; c < alienCols; c++) {
    for (let r = 0; r < alienRows; r++) {
      if (aliens[c][r].visible) {
        aliens[c][r].x += alienSpeedX * alienDirection
        if (aliens[c][r].x + alienWidth > canvasWidth || aliens[c][r].x < 0) {
          hitEdge = true
        }
      }
    }
  }
  if (hitEdge) {
    alienDirection *= -1
    for (let c = 0; c < alienCols; c++) {
      for (let r = 0; r < alienRows; r++) {
        if (aliens[c][r].visible) {
          aliens[c][r].y += alienSpeedY
        }
      }
    }
  }
}

function moveAlienBullets() {
  for (let i = 0; i < alienBullets.length; i++) {
    alienBullets[i].y += alienBulletSpeed
    if (alienBullets[i].y > canvasHeight) {
      alienBullets.splice(i, 1)
      i--
    }
  }
}

function fireAlienBullet() {
  // Elegir una columna aleatoria con alien visible en la fila más baja
  const columns = []
  for (let c = 0; c < alienCols; c++) {
    for (let r = alienRows - 1; r >= 0; r--) {
      if (aliens[c][r].visible) {
        columns.push({ x: aliens[c][r].x + alienWidth / 2, y: aliens[c][r].y + alienHeight })
        break
      }
    }
  }
  if (columns.length > 0) {
    const idx = Math.floor(Math.random() * columns.length)
    alienBullets.push({ x: columns[idx].x, y: columns[idx].y })
  }
}

function checkCollisions() {
  // Bala jugador vs alien
  for (let i = 0; i < playerBullets.length; i++) {
    const bullet = playerBullets[i]
    for (let c = 0; c < alienCols; c++) {
      for (let r = 0; r < alienRows; r++) {
        const alien = aliens[c][r]
        if (
          alien.visible &&
          bullet.x > alien.x &&
          bullet.x < alien.x + alienWidth &&
          bullet.y > alien.y &&
          bullet.y < alien.y + alienHeight
        ) {
          alien.visible = false
          playerBullets.splice(i, 1)
          i--
          score.value += 10
          return
        }
      }
    }
  }
  // Alien vs jugador
  for (let c = 0; c < alienCols; c++) {
    for (let r = 0; r < alienRows; r++) {
      const alien = aliens[c][r]
      if (
        alien.visible &&
        alien.x < playerX + playerWidth &&
        alien.x + alienWidth > playerX &&
        alien.y < playerY + playerHeight &&
        alien.y + alienHeight > playerY
      ) {
        loseLife()
        return
      }
    }
  }
  // Aliens llegan abajo
  for (let c = 0; c < alienCols; c++) {
    for (let r = 0; r < alienRows; r++) {
      const alien = aliens[c][r]
      if (alien.visible && alien.y + alienHeight >= playerY) {
        loseLife()
        return
      }
    }
  }
  // Bala alien vs jugador
  for (let i = 0; i < alienBullets.length; i++) {
    const bullet = alienBullets[i]
    if (
      bullet.x > playerX &&
      bullet.x < playerX + playerWidth &&
      bullet.y > playerY &&
      bullet.y < playerY + playerHeight
    ) {
      alienBullets.splice(i, 1)
      i--
      loseLife()
      return
    }
  }
}

function loseLife() {
  lives.value--
  if (lives.value <= 0) {
    gameOver.value = true
    stopGame()
  } else {
    resetPlayer()
  }
}

function resetPlayer() {
  playerX = canvasWidth / 2 - playerWidth / 2
  playerBullets = []
}

function fire() {
  if (gameOver.value) return
  if (playerBullets.length < 1) {
    playerBullets.push({ x: playerX + playerWidth / 2, y: playerY })
  }
}

function moveLeftStart() {
  movingLeft = true
}
function moveLeftStop() {
  movingLeft = false
}
function moveRightStart() {
  movingRight = true
}
function moveRightStop() {
  movingRight = false
}

function handleKey(e: KeyboardEvent) {
  if (gameOver.value) return
  if (e.key === 'ArrowLeft') movingLeft = true
  else if (e.key === 'ArrowRight') movingRight = true
  else if (e.key === ' ' || e.key === 'ArrowUp') fire()
}
function handleKeyUp(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') movingLeft = false
  else if (e.key === 'ArrowRight') movingRight = false
}

function gameLoop() {
  if (gameOver.value) return
  movePlayer()
  moveBullets()
  moveAliens()
  moveAlienBullets()
  checkCollisions()
  draw()
  // Animación de marcianos
  if (alienAnimTimer === null) {
    alienAnimTimer = window.setInterval(() => {
      alienFrameIdx = (alienFrameIdx + 1) % 2
    }, 300)
  }
  // Disparos enemigos
  alienFireCounter++
  if (alienFireCounter >= alienFireInterval) {
    fireAlienBullet()
    alienFireCounter = 0
  }
  if (aliens.flat().every((a) => !a.visible)) {
    createAliens()
    alienSpeedX += 0.5
    lives.value++ // Gana una vida extra por cada tablero completado
  }
  animationId = requestAnimationFrame(gameLoop)
}

function startGame() {
  score.value = 0
  lives.value = 3
  gameOver.value = false
  playerX = canvasWidth / 2 - playerWidth / 2
  playerBullets = []
  alienBullets = []
  alienSpeedX = 1
  alienDirection = 1
  alienFrameIdx = 0
  alienFireCounter = 0
  if (alienAnimTimer) clearInterval(alienAnimTimer)
  alienAnimTimer = null
  createAliens()
  draw()
  if (animationId) cancelAnimationFrame(animationId)
  animationId = requestAnimationFrame(gameLoop)
}

function stopGame() {
  if (animationId) cancelAnimationFrame(animationId)
  if (alienAnimTimer) clearInterval(alienAnimTimer)
  alienAnimTimer = null
}

function restart() {
  startGame()
}

onMounted(() => {
  nextTick(() => {
    startGame()
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKeyUp)
  })
})

onUnmounted(() => {
  stopGame()
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped>
.spaceinvaders-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.info-panel {
  display: flex;
  gap: 30px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  color: lime;
  text-shadow: 0 0 10px lime;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 5px;
  border: 2px solid lime;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.button {
  background: #333;
  color: lime;
  border: 2px solid lime;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s;
  user-select: none;
}

.button:hover {
  background: lime;
  color: #000;
}

.button:active {
  transform: scale(0.95);
}

.game-over {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.game-over-content {
  text-align: center;
  color: lime;
  font-family: 'Courier New', monospace;
}

.game-over-content h2 {
  font-size: 24px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px lime;
}

.game-over-content p {
  font-size: 18px;
  margin-bottom: 20px;
}

canvas {
  border: 2px solid lime;
  border-radius: 5px;
  background: #000;
}

@media (max-width: 768px) {
  .info-panel {
    font-size: 16px;
    padding: 8px 16px;
  }

  .controls {
    gap: 8px;
  }

  .button {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
