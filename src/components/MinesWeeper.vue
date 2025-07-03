<template>
  <div
    class="min-h-screen min-w-screen fixed inset-0 z-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 flex items-center justify-center"
  >
    <div class="app-container shadow-2xl relative z-10" :style="containerStyle">
      <h1
        class="text-xl font-bold mb-4 text-center"
        style="font-family: 'MS Sans Serif', 'Arial', sans-serif"
      >
        BUSCAMINAS
      </h1>
      <div class="control-panel flex justify-between items-center mb-4">
        <div class="text-xl font-bold text-red-600 digital-counter">
          {{ String(minesRemaining).padStart(3, '0') }}
        </div>
        <button @click="startGame(currentDifficulty)" class="face-button">
          <span v-if="gameWon">😎</span>
          <span v-else-if="gameOver">😵</span>
          <span v-else>🙂</span>
        </button>
        <div class="text-xl font-bold text-red-600 digital-counter">
          {{ String(timeElapsed).padStart(3, '0') }}
        </div>
      </div>
      <div class="mb-2 flex justify-center space-x-2">
        <button
          v-for="key in Object.keys(difficulties)"
          :key="key"
          @click="startGame(key)"
          class="difficulty-button"
        >
          {{ difficultyLabels[key] }}
        </button>
      </div>
      <div class="mb-2 flex justify-center space-x-2">
        <span v-if="bestRevealed[currentDifficulty] !== undefined" class="text-xs text-gray-700"
          >Récord: {{ bestRevealed[currentDifficulty] }} cuadros</span
        >
        <span v-else class="text-xs text-gray-700">Sin récord</span>
      </div>
      <div class="board-wrapper overflow-x-auto">
        <div class="minesweeper-grid" :style="gridStyle">
          <div
            v-for="(cell, index) in board"
            :key="index"
            :class="getCellClasses(cell)"
            @click="revealCell(index)"
            @contextmenu.prevent="toggleFlag(index)"
          >
            <template v-if="cell.revealed">
              <span v-if="cell.isMine" class="text-xl">💣</span>
              <span v-else-if="cell.minesAround > 0" :class="`text-xl`">{{
                cell.minesAround
              }}</span>
            </template>
            <template v-else-if="cell.flagged">
              <span class="text-xl">🚩</span>
            </template>
          </div>
        </div>
      </div>
      <div v-if="gameOver" class="mt-4 text-center">
        <p v-if="gameWon" class="text-2xl font-bold text-green-600">¡Ganaste!</p>
        <p v-else class="text-2xl font-bold text-red-600">¡Game Over!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Cell {
  isMine: boolean
  revealed: boolean
  flagged: boolean
  minesAround: number
}

interface Difficulty {
  rows: number
  cols: number
  mines: number
}

const difficulties: Record<string, Difficulty> = {
  '8x8': { rows: 8, cols: 8, mines: 10 },
  '16x16': { rows: 16, cols: 16, mines: 40 },
  '24x24': { rows: 24, cols: 24, mines: 99 },
  '24x32': { rows: 32, cols: 24, mines: 150 },
}

const difficultyLabels: Record<string, string> = {
  '8x8': '8x8',
  '16x16': '16x16',
  '24x24': '24x24',
  '24x32': '24x32',
}

const board = ref<Cell[]>([])
const rows = ref(8)
const cols = ref(8)
const mines = ref(10)
const minesRemaining = ref(10)
const gameOver = ref(false)
const gameWon = ref(false)
const timeElapsed = ref(0)
const currentDifficulty = ref('8x8')
const firstClick = ref(true)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const windowHeight = ref(window.innerHeight)
const bestRevealed = ref<Record<string, number>>({})

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols.value}, 25px)`,
  gap: '0',
  borderTop: '1px solid #808080',
  borderLeft: '1px solid #808080',
  borderRight: '1px solid #fff',
  borderBottom: '1px solid #fff',
}))

const containerStyle = computed(() => {
  // En móvil: 100vw menos padding, en desktop: auto
  return window.innerWidth < 640
    ? { width: '100vw', minWidth: '0', maxWidth: '100vw', borderRadius: 0 }
    : { minWidth: 'auto', maxWidth: 'unset', borderRadius: '8px' }
})

const handleResize = () => {
  windowHeight.value = window.innerHeight
}

const loadBestRevealed = () => {
  const stored = localStorage.getItem('minesweeper_best_revealed')
  if (stored) {
    try {
      bestRevealed.value = JSON.parse(stored)
    } catch {
      bestRevealed.value = {}
    }
  }
}

const saveBestRevealed = () => {
  localStorage.setItem('minesweeper_best_revealed', JSON.stringify(bestRevealed.value))
}

onMounted(() => {
  loadBestRevealed()
  startGame('8x8')
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
  window.removeEventListener('resize', handleResize)
})

const startGame = (difficulty: string) => {
  currentDifficulty.value = difficulty
  const config = difficulties[difficulty]
  rows.value = config.rows
  cols.value = config.cols
  mines.value = config.mines
  gameOver.value = false
  gameWon.value = false
  timeElapsed.value = 0
  firstClick.value = true
  minesRemaining.value = config.mines
  if (timerInterval.value) clearInterval(timerInterval.value)
  initializeBoard()
}

const initializeBoard = () => {
  board.value = []
  for (let i = 0; i < rows.value * cols.value; i++) {
    board.value.push({
      isMine: false,
      revealed: false,
      flagged: false,
      minesAround: 0,
    })
  }
}

const getNeighbors = (index: number): number[] => {
  const neighbors: number[] = []
  const row = Math.floor(index / cols.value)
  const col = index % cols.value
  for (let rOffset = -1; rOffset <= 1; rOffset++) {
    for (let cOffset = -1; cOffset <= 1; cOffset++) {
      if (rOffset === 0 && cOffset === 0) continue
      const newRow = row + rOffset
      const newCol = col + cOffset
      const newIndex = newRow * cols.value + newCol
      if (newRow >= 0 && newRow < rows.value && newCol >= 0 && newCol < cols.value) {
        neighbors.push(newIndex)
      }
    }
  }
  return neighbors
}

const placeMines = (firstClickIndex: number) => {
  let minesPlaced = 0
  const excludedIndices = getNeighbors(firstClickIndex).concat(firstClickIndex)
  while (minesPlaced < mines.value) {
    const randomIndex = Math.floor(Math.random() * board.value.length)
    if (!board.value[randomIndex].isMine && !excludedIndices.includes(randomIndex)) {
      board.value[randomIndex].isMine = true
      minesPlaced++
    }
  }
  calculateMinesAround()
}

const calculateMinesAround = () => {
  for (let i = 0; i < board.value.length; i++) {
    if (!board.value[i].isMine) {
      let count = 0
      const neighbors = getNeighbors(i)
      neighbors.forEach((neighborIndex) => {
        if (board.value[neighborIndex] && board.value[neighborIndex].isMine) {
          count++
        }
      })
      board.value[i].minesAround = count
    }
  }
}

const updateLiveBestRevealed = () => {
  const diff = currentDifficulty.value
  const revealedCount = board.value.filter((cell) => cell.revealed && !cell.isMine).length
  if (
    !gameOver.value &&
    !firstClick.value &&
    (bestRevealed.value[diff] === undefined || revealedCount > bestRevealed.value[diff])
  ) {
    bestRevealed.value[diff] = revealedCount
    saveBestRevealed()
  }
}

const revealCell = (index: number) => {
  if (gameOver.value || board.value[index].revealed || board.value[index].flagged) return
  if (firstClick.value) {
    placeMines(index)
    startTimer()
    firstClick.value = false
  }
  board.value[index].revealed = true
  if (board.value[index].isMine) {
    gameOver.value = true
    revealAllMines()
    if (timerInterval.value) clearInterval(timerInterval.value)
    return
  }
  if (board.value[index].minesAround === 0) {
    const neighbors = getNeighbors(index)
    neighbors.forEach((neighborIndex) => {
      setTimeout(() => revealCell(neighborIndex), 10)
    })
  }
  updateLiveBestRevealed()
  checkWinCondition()
}

const toggleFlag = (index: number) => {
  if (gameOver.value || board.value[index].revealed) return
  board.value[index].flagged = !board.value[index].flagged
  minesRemaining.value = mines.value - board.value.filter((cell) => cell.flagged).length
  if (minesRemaining.value < 0) minesRemaining.value = 0
  if (minesRemaining.value > mines.value) minesRemaining.value = mines.value
}

const revealAllMines = () => {
  board.value.forEach((cell) => {
    if (cell.isMine) cell.revealed = true
  })
}

const checkWinCondition = () => {
  const revealedNonMines = board.value.filter((cell) => cell.revealed && !cell.isMine).length
  const totalNonMines = rows.value * cols.value - mines.value
  if (revealedNonMines === totalNonMines) {
    gameOver.value = true
    gameWon.value = true
    if (timerInterval.value) clearInterval(timerInterval.value)
    board.value.forEach((cell) => {
      if (cell.isMine && !cell.flagged) cell.flagged = true
    })
  }
}

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (!gameOver.value) {
      timeElapsed.value++
    }
  }, 1000)
}

const getCellClasses = (cell: Cell) => {
  return [
    'minesweeper-cell',
    {
      revealed: cell.revealed,
      mine: cell.revealed && cell.isMine,
      flagged: cell.flagged && !cell.revealed,
    },
    cell.revealed && cell.minesAround > 0 && !cell.isMine ? `number-${cell.minesAround}` : '',
  ]
}
</script>

<style scoped>
.app-container {
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  background-color: #c0c0c0;
  box-shadow:
    0 8px 32px 0 rgba(60, 60, 60, 0.18),
    2px 2px 5px rgba(0, 0, 0, 0.3);
  padding: 8px;
  margin: 0;
}
@media (max-width: 640px) {
  .app-container {
    border-radius: 0 !important;
    min-width: 0 !important;
    max-width: 100vw !important;
    width: 100vw !important;
    margin: 0 !important;
  }
}
.board-wrapper {
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  background-color: #c0c0c0;
  padding: 3px;
  overflow-x: auto;
}
.control-panel {
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  padding: 5px;
  margin-bottom: 8px;
  background-color: #c0c0c0;
}
.difficulty-button {
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  background-color: #c0c0c0;
  padding: 4px 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.05s ease-in-out;
  outline: none;
}
.difficulty-button:active {
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: translate(1px, 1px);
}
.face-button {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  background-color: #c0c0c0;
  cursor: pointer;
}
.face-button:active {
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: translate(1px, 1px);
}
.minesweeper-cell {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  background-color: #c0c0c0;
  cursor: pointer;
  user-select: none;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
}
.minesweeper-cell.revealed {
  background-color: #d1d1d1;
  border: 1px solid #999;
  box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.2);
}
.minesweeper-cell.revealed.mine {
  background-color: #ff0000;
  color: #fff;
}
.minesweeper-cell.flagged {
  color: #ff0000;
}
.minesweeper-cell.number-1 {
  color: #0000ff;
}
.minesweeper-cell.number-2 {
  color: #008000;
}
.minesweeper-cell.number-3 {
  color: #ff0000;
}
.minesweeper-cell.number-4 {
  color: #000080;
}
.minesweeper-cell.number-5 {
  color: #800000;
}
.minesweeper-cell.number-6 {
  color: #008080;
}
.minesweeper-cell.number-7 {
  color: #000000;
}
.minesweeper-cell.number-8 {
  color: #808080;
}
.digital-counter {
  font-family: 'Courier New', Courier, monospace;
}
</style>
