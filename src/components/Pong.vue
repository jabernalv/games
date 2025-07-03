<template>
  <div
    class="min-h-screen min-w-screen fixed inset-0 z-0 bg-gradient-to-br from-[#222] via-[#444] to-[#222] flex items-center justify-center"
  >
    <div class="pong-container relative z-10">
      <div class="score left">{{ scoreLeft }}</div>
      <canvas ref="gameCanvas" width="400" height="300"></canvas>
      <div class="score right">{{ scoreRight }}</div>

      <div class="controls">
        <button
          class="button"
          @mousedown="moveLeftPaddleUp"
          @mouseup="stopLeftPaddleUp"
          @touchstart.prevent="moveLeftPaddleUp"
          @touchend.prevent="stopLeftPaddleUp"
        >
          ↑ Izq
        </button>
        <button
          class="button"
          @mousedown="moveLeftPaddleDown"
          @mouseup="stopLeftPaddleDown"
          @touchstart.prevent="moveLeftPaddleDown"
          @touchend.prevent="stopLeftPaddleDown"
        >
          ↓ Izq
        </button>
        <button
          class="button"
          @mousedown="moveRightPaddleUp"
          @mouseup="stopRightPaddleUp"
          @touchstart.prevent="moveRightPaddleUp"
          @touchend.prevent="stopRightPaddleUp"
        >
          ↑ Der
        </button>
        <button
          class="button"
          @mousedown="moveRightPaddleDown"
          @mouseup="stopRightPaddleDown"
          @touchstart.prevent="moveRightPaddleDown"
          @touchend.prevent="stopRightPaddleDown"
        >
          ↓ Der
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const canvasWidth = 400
const canvasHeight = 300
const paddleHeight = 60
const paddleWidth = 10
const paddleSpeed = 5
const ballRadius = 10
const frameRate = 30

const gameCanvas = ref<HTMLCanvasElement | null>(null)
const scoreLeft = ref(0)
const scoreRight = ref(0)

// Posiciones de las paletas
let leftPaddleY = canvasHeight / 2 - paddleHeight / 2
let rightPaddleY = canvasHeight / 2 - paddleHeight / 2

// Posición y velocidad de la pelota
let ballX = canvasWidth / 2
let ballY = canvasHeight / 2
let ballSpeedX = 3
let ballSpeedY = 3

// Controles
let leftPaddleUp = false
let leftPaddleDown = false
let rightPaddleUp = false
let rightPaddleDown = false

let gameInterval: number | null = null

function drawPaddle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#fff'
  ctx.fillRect(x, y, paddleWidth, paddleHeight)
}

function drawBall(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.closePath()
}

function updateGame() {
  // Mover paletas
  if (leftPaddleUp && leftPaddleY > 0) {
    leftPaddleY -= paddleSpeed
  }
  if (leftPaddleDown && leftPaddleY < canvasHeight - paddleHeight) {
    leftPaddleY += paddleSpeed
  }
  if (rightPaddleUp && rightPaddleY > 0) {
    rightPaddleY -= paddleSpeed
  }
  if (rightPaddleDown && rightPaddleY < canvasHeight - paddleHeight) {
    rightPaddleY += paddleSpeed
  }

  // Mover la pelota
  ballX += ballSpeedX
  ballY += ballSpeedY

  // Colisión con los bordes superior e inferior
  if (ballY + ballRadius > canvasHeight || ballY - ballRadius < 0) {
    ballSpeedY *= -1
  }

  // Colisión con las paletas
  if (
    ballX - ballRadius < paddleWidth &&
    ballY > leftPaddleY &&
    ballY < leftPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1
    // Aumentar ligeramente la velocidad después de golpear la paleta
    ballSpeedX *= 1.05
  }
  if (
    ballX + ballRadius > canvasWidth - paddleWidth &&
    ballY > rightPaddleY &&
    ballY < rightPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1
    ballSpeedX *= 1.05
  }

  // Puntuación
  if (ballX - ballRadius < 0) {
    scoreRight.value++
    resetBall()
  }
  if (ballX + ballRadius > canvasWidth) {
    scoreLeft.value++
    resetBall()
  }

  // Dibujar todo
  const ctx = gameCanvas.value?.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  drawPaddle(ctx, 0, leftPaddleY)
  drawPaddle(ctx, canvasWidth - paddleWidth, rightPaddleY)
  drawBall(ctx)
}

function resetBall() {
  ballX = canvasWidth / 2
  ballY = canvasHeight / 2
  ballSpeedX *= -1 // Invertir dirección al sacar
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1) // Dirección vertical aleatoria
  ballSpeedX = Math.sign(ballSpeedX) * 3 // Asegurar velocidad inicial
}

// Controles de paleta izquierda
function moveLeftPaddleUp() {
  leftPaddleUp = true
}

function stopLeftPaddleUp() {
  leftPaddleUp = false
}

function moveLeftPaddleDown() {
  leftPaddleDown = true
}

function stopLeftPaddleDown() {
  leftPaddleDown = false
}

// Controles de paleta derecha
function moveRightPaddleUp() {
  rightPaddleUp = true
}

function stopRightPaddleUp() {
  rightPaddleUp = false
}

function moveRightPaddleDown() {
  rightPaddleDown = true
}

function stopRightPaddleDown() {
  rightPaddleDown = false
}

// Controles de teclado
function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'w':
    case 'W':
      leftPaddleUp = true
      break
    case 's':
    case 'S':
      leftPaddleDown = true
      break
    case 'ArrowUp':
      rightPaddleUp = true
      break
    case 'ArrowDown':
      rightPaddleDown = true
      break
  }
}

function handleKeyUp(e: KeyboardEvent) {
  switch (e.key) {
    case 'w':
    case 'W':
      leftPaddleUp = false
      break
    case 's':
    case 'S':
      leftPaddleDown = false
      break
    case 'ArrowUp':
      rightPaddleUp = false
      break
    case 'ArrowDown':
      rightPaddleDown = false
      break
  }
}

function startGame() {
  scoreLeft.value = 0
  scoreRight.value = 0
  leftPaddleY = canvasHeight / 2 - paddleHeight / 2
  rightPaddleY = canvasHeight / 2 - paddleHeight / 2
  ballX = canvasWidth / 2
  ballY = canvasHeight / 2
  ballSpeedX = 3
  ballSpeedY = 3
  leftPaddleUp = false
  leftPaddleDown = false
  rightPaddleUp = false
  rightPaddleDown = false

  if (gameInterval) clearInterval(gameInterval)
  gameInterval = window.setInterval(updateGame, 1000 / frameRate)
}

function stopGame() {
  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = null
  }
}

onMounted(() => {
  nextTick(() => {
    startGame()
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })
})

onUnmounted(() => {
  stopGame()
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped>
.pong-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.score {
  position: absolute;
  font-size: 20px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px #fff;
}

.score.left {
  top: 10px;
  left: 30px;
}

.score.right {
  top: 10px;
  right: 30px;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.button {
  background: #333;
  color: #fff;
  border: 2px solid #fff;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s;
  user-select: none;
}

.button:hover {
  background: #fff;
  color: #000;
}

.button:active {
  transform: scale(0.95);
}

canvas {
  border: 2px solid #fff;
  border-radius: 5px;
  background: #000;
}

@media (max-width: 768px) {
  .score {
    font-size: 18px;
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
