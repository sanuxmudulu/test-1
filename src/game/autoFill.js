import { ROWS, COLS, canPlacePiece } from "./board.js";

// Small, varied shapes for the board's own "auto-fill" — deliberately not
// the row-spanning shapes pieces.js biases toward, so the board fills back
// up with odd little clusters rather than another neat completable line.
const AUTO_FILL_SHAPES = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [1, 1]],
  [[0, 0], [1, 0], [2, 0]],
];

const COLORS = ["pink", "blue", "yellow"];

function shapeDimensions(shape) {
  let maxRow = 0;
  let maxCol = 0;
  for (const [r, c] of shape) {
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }
  return { rows: maxRow + 1, cols: maxCol + 1 };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function countEmptyInRow(row) {
  return row.filter((cell) => cell === null).length;
}

function wouldCompleteAnyTouchedRow(board, shape, rowStart, colStart) {
  const touchedRows = new Set(shape.map(([dr]) => rowStart + dr));
  for (const r of touchedRows) {
    let filledCount = 0;
    for (let c = 0; c < COLS; c++) {
      const isNewCell = shape.some(([dr, dc]) => rowStart + dr === r && colStart + dc === c);
      if (board[r][c] !== null || isNewCell) filledCount++;
    }
    if (filledCount === COLS) return true;
  }
  return false;
}

/**
 * Picks a small random shape + position to auto-fill onto the board after a
 * row clears, so the board keeps feeling "alive" instead of getting wiped
 * clean every time the player clears a row. Two rules keep this from
 * fighting the player:
 *   1. It never completes a row itself — that would hand out an unearned
 *      reward and the player didn't place it.
 *   2. It prefers rows that are still mostly empty (>4 empty cells), so it
 *      doesn't eat into the near-full rows that pieces.js's bias heuristic
 *      is setting up for the player to finish.
 * Returns null (skip this round) if no safe spot is found.
 */
export function findAutoFillPlacement(board) {
  const shape = AUTO_FILL_SHAPES[Math.floor(Math.random() * AUTO_FILL_SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const { rows, cols } = shapeDimensions(shape);

  const positions = [];
  for (let r = 0; r <= ROWS - rows; r++) {
    for (let c = 0; c <= COLS - cols; c++) positions.push([r, c]);
  }
  shuffle(positions);

  const isSafe = (r, c) =>
    canPlacePiece(board, { shape }, r, c) && !wouldCompleteAnyTouchedRow(board, shape, r, c);

  for (const [r, c] of positions) {
    const touchedRows = new Set(shape.map(([dr]) => r + dr));
    const allMostlyEmpty = [...touchedRows].every((row) => countEmptyInRow(board[row]) > 4);
    if (allMostlyEmpty && isSafe(r, c)) {
      return { shape, color, rowStart: r, colStart: c };
    }
  }

  for (const [r, c] of positions) {
    if (isSafe(r, c)) return { shape, color, rowStart: r, colStart: c };
  }

  return null;
}
