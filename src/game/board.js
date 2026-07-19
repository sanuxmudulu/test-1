export const ROWS = 8;
export const COLS = 8;

/**
 * Creates the 8x8 board pre-filled to roughly match the reference
 * screenshots' starting state: two dense rows near the top (pink, then
 * blue) and a third staggered pink row below them, each missing a small
 * gap so the first couple of moves have an obvious near-complete row.
 */
export function createBoard() {
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const prefill = [
    { row: 2, color: "pink", cols: [0, 1, 2, 3, 4, 5] },
    { row: 3, color: "blue", cols: [0, 1, 2, 3, 4, 5] },
    { row: 5, color: "pink", cols: [2, 3, 4, 5, 6, 7] },
  ];

  for (const { row, color, cols } of prefill) {
    for (const col of cols) board[row][col] = color;
  }

  return board;
}

export function canPlacePiece(board, piece, rowStart, colStart) {
  return piece.shape.every(([dr, dc]) => {
    const r = rowStart + dr;
    const c = colStart + dc;
    return r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === null;
  });
}

export function placePiece(board, piece, rowStart, colStart) {
  for (const [dr, dc] of piece.shape) {
    board[rowStart + dr][colStart + dc] = piece.color;
  }
}

export function getFullRows(board) {
  const fullRows = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every((cell) => cell !== null)) fullRows.push(r);
  }
  return fullRows;
}

export function clearRows(board, rowIndices) {
  for (const r of rowIndices) {
    for (let c = 0; c < COLS; c++) board[r][c] = null;
  }
}
