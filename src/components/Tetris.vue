<template>
  <div
    class="min-h-screen min-w-screen fixed inset-0 z-0 bg-gradient-to-br from-[#c0c0c0] via-[#e0e0e0] to-[#c0c0c0] flex items-center justify-center"
  >
    <div class="game-container relative z-10">
      <div class="game-header">
        <h1>Tetris</h1>
        <div class="game-info">
          <span>Puntaje: {{ score }}</span>
          <span>Récord: {{ bestScore }}</span>
          <span>Nivel: {{ level }}</span>
          <span>Líneas: {{ lines }}</span>
        </div>
      </div>
      <div class="game-area">
        <div class="main-board">
          <canvas ref="gameBoard" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
        <div class="side-panel">
          <div class="next-piece">
            <h3>Siguiente</h3>
            <canvas ref="nextPieceCanvas" width="80" height="80"></canvas>
          </div>
          <div class="controls">
            <h3>Controles</h3>
            <div class="control-buttons">
              <button class="control-btn rotate-btn" @click="rotate">⟳</button>
              <button class="control-btn left-btn" @click="moveLeft">←</button>
              <button class="control-btn down-btn" @click="moveDown">↓</button>
              <button class="control-btn right-btn" @click="moveRight">→</button>
              <button class="control-btn drop-btn" @click="drop">⤓</button>
            </div>
            <div class="keyboard-controls">
              <h4>Teclado</h4>
              <p>← → : Mover</p>
              <p>↑ : Rotar</p>
              <p>↓ : Bajar</p>
              <p>Espacio: Caída rápida</p>
              <p>P : Pausa</p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="gameOver" class="game-over">
        <div class="game-over-content">
          <h2>¡Game Over!</h2>
          <p>Puntaje: {{ score }}</p>
          <button @click="restart">Jugar de nuevo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Configuración
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 30
const canvasWidth = BOARD_WIDTH * CELL_SIZE
const canvasHeight = BOARD_HEIGHT * CELL_SIZE

// Estado reactivo
const score = ref(0)
const level = ref(1)
const lines = ref(0)
const gameOver = ref(false)
const paused = ref(false)
const board = ref<number[][]>([])
const currentPiece = ref<any>(null)
const nextPiece = ref<any>(null)
const dropInterval = ref(1000)
let dropTimer: number | null = null
const bestScore = ref(0)

const gameBoard = ref<HTMLCanvasElement | null>(null)
const nextPieceCanvas = ref<HTMLCanvasElement | null>(null)

// Piezas
const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f5ff' },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffff00',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#800080',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#00ff00',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ff0000',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#0000ff',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#ffa500',
  },
}
const PIECE_TYPES = Object.keys(PIECES)

function getRandomPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)] as keyof typeof PIECES
  const piece = PIECES[type]
  return {
    shape: piece.shape.map((row: number[]) => [...row]),
    color: piece.color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
    y: 0,
    type,
  }
}

function resetBoard() {
  board.value = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))
}

function drawBoard() {
  const ctx = gameBoard.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  // Fondo
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // Celdas
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board.value[y][x]) {
        ctx.fillStyle = board.value[y][x] as any
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        ctx.strokeStyle = '#444'
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }
  }
  // Pieza actual
  if (currentPiece.value) {
    drawPiece(ctx, currentPiece.value)
  }
}

function drawPiece(ctx: CanvasRenderingContext2D, piece: any) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        ctx.fillStyle = piece.color
        ctx.fillRect((piece.x + x) * CELL_SIZE, (piece.y + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        ctx.strokeStyle = '#444'
        ctx.strokeRect((piece.x + x) * CELL_SIZE, (piece.y + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }
  }
}

function drawNextPiece() {
  const ctx = nextPieceCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, 80, 80)
  if (!nextPiece.value) return
  const shape = nextPiece.value.shape
  const offsetX = Math.floor((4 - shape[0].length) / 2)
  const offsetY = Math.floor((4 - shape.length) / 2)
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        ctx.fillStyle = nextPiece.value.color
        ctx.fillRect((x + offsetX) * 16, (y + offsetY) * 16, 16, 16)
        ctx.strokeStyle = '#444'
        ctx.strokeRect((x + offsetX) * 16, (y + offsetY) * 16, 16, 16)
      }
    }
  }
}

function checkCollision(piece: any, dx = 0, dy = 0, newShape = null) {
  const shape = newShape || piece.shape
  const newX = piece.x + dx
  const newY = piece.y + dy
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = newX + x
        const boardY = newY + y
        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY >= BOARD_HEIGHT ||
          (boardY >= 0 && board.value[boardY][boardX])
        ) {
          return true
        }
      }
    }
  }
  return false
}

function mergePiece() {
  for (let y = 0; y < currentPiece.value.shape.length; y++) {
    for (let x = 0; x < currentPiece.value.shape[y].length; x++) {
      if (currentPiece.value.shape[y][x]) {
        const boardX = currentPiece.value.x + x
        const boardY = currentPiece.value.y + y
        if (boardY >= 0) {
          board.value[boardY][boardX] = currentPiece.value.color
        }
      }
    }
  }
}

function clearLines() {
  let linesCleared = 0
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board.value[y].every((cell) => cell)) {
      board.value.splice(y, 1)
      board.value.unshift(Array(BOARD_WIDTH).fill(0))
      linesCleared++
      y++
    }
  }
  if (linesCleared > 0) {
    score.value += [0, 40, 100, 300, 1200][linesCleared] * level.value
    lines.value += linesCleared
    if (lines.value >= level.value * 10) {
      level.value++
      dropInterval.value = Math.max(100, 1000 - (level.value - 1) * 50)
    }
    updateBestScore()
  }
}

function spawnPiece() {
  currentPiece.value = nextPiece.value || getRandomPiece()
  nextPiece.value = getRandomPiece()
  if (checkCollision(currentPiece.value)) {
    gameOver.value = true
    stopGame()
  }
}

function move(dx: number, dy: number) {
  if (!currentPiece.value || gameOver.value || paused.value) return
  if (!checkCollision(currentPiece.value, dx, dy)) {
    currentPiece.value.x += dx
    currentPiece.value.y += dy
    drawBoard()
  }
}

function moveLeft() {
  move(-1, 0)
}
function moveRight() {
  move(1, 0)
}
function moveDown() {
  move(0, 1)
}

function rotate() {
  if (!currentPiece.value || gameOver.value || paused.value) return
  const newShape = currentPiece.value.shape[0]
    .map((_: unknown, i: number) => currentPiece.value.shape.map((row: number[]) => row[i]))
    .reverse()
  if (!checkCollision(currentPiece.value, 0, 0, newShape)) {
    currentPiece.value.shape = newShape
    drawBoard()
  }
}

function drop() {
  if (!currentPiece.value || gameOver.value || paused.value) return
  while (!checkCollision(currentPiece.value, 0, 1)) {
    currentPiece.value.y++
  }
  step()
}

function step() {
  if (!currentPiece.value || gameOver.value || paused.value) return
  if (!checkCollision(currentPiece.value, 0, 1)) {
    currentPiece.value.y++
  } else {
    mergePiece()
    clearLines()
    spawnPiece()
  }
  drawBoard()
  drawNextPiece()
}

function gameLoop() {
  if (gameOver.value || paused.value) return
  step()
  dropTimer = window.setTimeout(gameLoop, dropInterval.value)
}

function startGame() {
  score.value = 0
  level.value = 1
  lines.value = 0
  dropInterval.value = 1000
  gameOver.value = false
  paused.value = false
  resetBoard()
  nextPiece.value = getRandomPiece()
  spawnPiece()
  drawBoard()
  drawNextPiece()
  if (dropTimer) clearTimeout(dropTimer)
  dropTimer = window.setTimeout(gameLoop, dropInterval.value)
  updateBestScore()
}

function stopGame() {
  if (dropTimer) clearTimeout(dropTimer)
}

function restart() {
  startGame()
}

function handleKey(e: KeyboardEvent) {
  if (gameOver.value) return
  if (e.key === 'ArrowLeft') moveLeft()
  else if (e.key === 'ArrowRight') moveRight()
  else if (e.key === 'ArrowDown') moveDown()
  else if (e.key === 'ArrowUp') rotate()
  else if (e.key === ' ') drop()
  else if (e.key.toLowerCase() === 'p') paused.value = !paused.value
}

const loadBestScore = () => {
  const stored = localStorage.getItem('tetris_best_score')
  if (stored) {
    try {
      bestScore.value = parseInt(stored)
    } catch {
      bestScore.value = 0
    }
  }
}

const saveBestScore = () => {
  localStorage.setItem('tetris_best_score', String(bestScore.value))
}

function updateBestScore() {
  if (score.value > bestScore.value) {
    bestScore.value = score.value
    saveBestScore()
  }
}

onMounted(() => {
  nextTick(() => {
    loadBestScore()
    startGame()
    window.addEventListener('keydown', handleKey)
    drawBoard()
    drawNextPiece()
  })
})

onUnmounted(() => {
  stopGame()
  window.removeEventListener('keydown', handleKey)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.game-container {
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  box-shadow:
    0 8px 32px 0 rgba(60, 60, 60, 0.18),
    2px 2px 5px rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  max-width: 600px;
  width: 100%;
  margin: 0;
}
@media (max-width: 640px) {
  .game-container {
    border-radius: 0 !important;
    min-width: 0 !important;
    max-width: 100vw !important;
    width: 100vw !important;
    margin: 0 !important;
  }
}
.game-header {
  text-align: center;
  color: #222;
  margin-bottom: 20px;
}
.game-header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Press Start 2P', Arial, sans-serif;
}
.game-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: #222;
  font-size: 1.2em;
}
.game-area {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}
.main-board {
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid #fff;
  border-radius: 10px;
  overflow: hidden;
}
canvas {
  display: block;
  background: #000;
}
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 150px;
}
.next-piece {
  background: #d1d1d1;
  border: 2px solid #fff;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  color: #222;
}
.next-piece h3 {
  margin-bottom: 10px;
  font-size: 1.1em;
}
#nextPieceCanvas {
  background: #222;
  border-radius: 5px;
}
.controls {
  margin-top: 20px;
  color: #222;
  text-align: center;
}
.controls h3 {
  margin-bottom: 15px;
  font-size: 1.3em;
}
.control-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 10px;
  max-width: 200px;
  margin: 0 auto 20px;
}
.control-btn {
  background: #e0e0e0;
  border: 2px solid #b0b0b0;
  border-radius: 10px;
  color: #222;
  font-size: 1.2em;
  font-weight: bold;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  touch-action: manipulation;
}
.control-btn:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}
.control-btn:active {
  background: #d0d0d0;
  transform: scale(0.95);
}
.rotate-btn {
  grid-column: 2;
  grid-row: 1;
}
.left-btn {
  grid-column: 1;
  grid-row: 2;
}
.down-btn {
  grid-column: 2;
  grid-row: 2;
}
.right-btn {
  grid-column: 3;
  grid-row: 2;
}
.drop-btn {
  grid-column: 2;
  grid-row: 3;
  background: #b0b0b0;
}
.keyboard-controls {
  background: #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
}
.keyboard-controls h4 {
  margin-bottom: 10px;
  color: #222;
}
.keyboard-controls p {
  margin: 5px 0;
  color: #444;
  font-size: 0.9em;
}
.game-over {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.game-over-content {
  background: #fff;
  color: #222;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.game-over-content h2 {
  font-size: 2em;
  margin-bottom: 10px;
}
.game-over-content button {
  margin-top: 20px;
  padding: 10px 30px;
  font-size: 1.1em;
  border-radius: 8px;
  border: none;
  background: #808080;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.game-over-content button:hover {
  background: #b0b0b0;
}
</style>
