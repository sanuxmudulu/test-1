import {
  ROWS,
  COLS,
  createBoard,
  canPlacePiece,
  placePiece,
  getFullRows,
  clearRows,
} from "../game/board.js";
import { generateBiasedPiece } from "../game/pieces.js";
import { findAutoFillPlacement } from "../game/autoFill.js";
import { makePieceDraggable } from "../game/dragDrop.js";

const STARTING_MOVES = 6;
const TRAY_SIZE = 3;
const ROW_REWARD_BASE = 10;
const BOOST_MULTIPLIER = 2;
const ROW_CLEAR_ANIMATION_MS = 400;
const REWARD_POPUP_VISIBLE_MS = 1500;
const GAP_PX = 4;

function formatMoney(amount) {
  return amount === 0 ? "$0" : `$${amount.toFixed(2)}`;
}

/**
 * Screen 2 — the block-drop mini game. Calls `onComplete({ baseEarned })`
 * once all starting moves are used, handing off the unboosted total earned
 * so the final screen can compute the boosted breakdown.
 */
export function renderGameScreen(container, { onComplete }) {
  const initialBoard = createBoard();
  const state = {
    board: initialBoard,
    moves: STARTING_MOVES,
    baseEarned: 0,
    tray: Array.from({ length: TRAY_SIZE }, () => generateBiasedPiece(initialBoard)),
    // Flips true the instant moves hit 0 so no further drag can sneak in a
    // placement (or double-fire onComplete) during the clear/handoff delay.
    gameOver: false,
  };

  container.innerHTML = `
    <section class="screen game-screen">
      <h1 class="game-title">Testerup</h1>
      <div class="boost-badge">✦ 2x BOOST ACTIVE</div>

      <div class="stats-row">
        <div class="stat-pill" id="moves-pill">Moves ${state.moves}</div>
        <div class="stat-pill money" id="money-pill">${formatMoney(0)}</div>
      </div>

      <div class="board-panel">
        <div class="board-grid" id="board-grid"></div>
        <div class="reward-popup" id="reward-popup">
          <div class="reward-amounts">
            <span class="reward-base" id="reward-base"></span>
            <span class="reward-boosted" id="reward-boosted"></span>
          </div>
          <div class="reward-banner">2x Premium Boost Applied</div>
        </div>
      </div>

      <div class="tray" id="tray"></div>
    </section>
  `;

  const boardGridEl = container.querySelector("#board-grid");
  const trayEl = container.querySelector("#tray");
  const movesPillEl = container.querySelector("#moves-pill");
  const moneyPillEl = container.querySelector("#money-pill");
  const rewardPopupEl = container.querySelector("#reward-popup");
  const rewardBaseEl = container.querySelector("#reward-base");
  const rewardBoostedEl = container.querySelector("#reward-boosted");

  const cellEls = buildBoardGrid(boardGridEl, state.board);
  const traySlotEls = [];

  for (let slot = 0; slot < TRAY_SIZE; slot++) {
    const slotEl = document.createElement("div");
    slotEl.className = "tray-slot";
    trayEl.appendChild(slotEl);
    traySlotEls.push(slotEl);
    renderTraySlot(slot);
  }

  function getCellSize() {
    const rect = boardGridEl.getBoundingClientRect();
    return (rect.width - (COLS - 1) * GAP_PX) / COLS;
  }

  function renderTraySlot(slotIndex) {
    const slotEl = traySlotEls[slotIndex];
    const piece = state.tray[slotIndex];
    slotEl.innerHTML = "";

    const pieceEl = document.createElement("div");
    pieceEl.className = "piece";
    pieceEl.style.gridTemplateColumns = `repeat(${piece.cols}, 22px)`;
    pieceEl.style.gridTemplateRows = `repeat(${piece.rows}, 22px)`;

    const occupied = new Set(piece.shape.map(([r, c]) => `${r},${c}`));
    for (let r = 0; r < piece.rows; r++) {
      for (let c = 0; c < piece.cols; c++) {
        const cellEl = document.createElement("div");
        const isFilled = occupied.has(`${r},${c}`);
        cellEl.className = `piece-cell ${isFilled ? piece.color : "empty"}`;
        pieceEl.appendChild(cellEl);
      }
    }

    slotEl.appendChild(pieceEl);

    makePieceDraggable(pieceEl, piece, {
      getCellSize,
      getBoardRect: () => boardGridEl.getBoundingClientRect(),
      canPlace: (rowStart, colStart) =>
        !state.gameOver && canPlacePiece(state.board, piece, rowStart, colStart),
      onPreview: (rowStart, colStart, canPlace) =>
        paintPreview(cellEls, piece, rowStart, colStart, canPlace),
      onClearPreview: () => clearPreview(cellEls),
      onDragStart: () => {
        pieceEl.classList.add("dragging");
      },
      onDragEnd: () => {
        pieceEl.classList.remove("dragging");
      },
      onDrop: (rowStart, colStart) => commitPlacement(slotIndex, piece, rowStart, colStart),
    });
  }

  function commitPlacement(slotIndex, piece, rowStart, colStart) {
    if (state.gameOver) return;

    placePiece(state.board, piece, rowStart, colStart);
    syncBoardCells(cellEls, state.board);

    state.moves -= 1;
    movesPillEl.textContent = `Moves ${state.moves}`;

    state.tray[slotIndex] = generateBiasedPiece(state.board);
    renderTraySlot(slotIndex);

    const fullRows = getFullRows(state.board);
    if (fullRows.length > 0) {
      handleRowClears(fullRows);
    } else if (state.moves <= 0) {
      finishGame();
    }
  }

  function handleRowClears(fullRows) {
    for (const r of fullRows) {
      for (let c = 0; c < COLS; c++) cellEls[r][c].classList.add("clearing");
    }

    const base = fullRows.length * ROW_REWARD_BASE;
    const boosted = base * BOOST_MULTIPLIER;
    state.baseEarned += base;
    moneyPillEl.textContent = formatMoney(state.baseEarned * BOOST_MULTIPLIER);
    showRewardPopup(base, boosted);

    setTimeout(() => {
      clearRows(state.board, fullRows);

      // Backfill a small random shape elsewhere on the board so it doesn't
      // read as wiped clean after every clear — see autoFill.js for the
      // placement heuristic (never completes a row, prefers empty rows).
      const autoFill = findAutoFillPlacement(state.board);
      if (autoFill) {
        placePiece(state.board, autoFill, autoFill.rowStart, autoFill.colStart);
      }

      syncBoardCells(cellEls, state.board);

      if (autoFill) {
        for (const [dr, dc] of autoFill.shape) {
          cellEls[autoFill.rowStart + dr][autoFill.colStart + dc].classList.add("auto-fill-in");
        }
      }

      if (state.moves <= 0) {
        finishGame();
      }
    }, ROW_CLEAR_ANIMATION_MS);
  }

  function showRewardPopup(base, boosted) {
    rewardBaseEl.textContent = `+$${base}`;
    rewardBoostedEl.textContent = `+$${boosted}`;
    rewardPopupEl.classList.add("show");
    setTimeout(() => rewardPopupEl.classList.remove("show"), REWARD_POPUP_VISIBLE_MS);
  }

  function finishGame() {
    if (state.gameOver) return;
    state.gameOver = true;
    setTimeout(() => onComplete({ baseEarned: state.baseEarned }), 500);
  }
}

function buildBoardGrid(boardGridEl, board) {
  const cellEls = [];
  for (let r = 0; r < ROWS; r++) {
    const rowEls = [];
    for (let c = 0; c < COLS; c++) {
      const cellEl = document.createElement("div");
      cellEl.className = "cell";
      cellEl.dataset.row = String(r);
      cellEl.dataset.col = String(c);
      boardGridEl.appendChild(cellEl);
      rowEls.push(cellEl);
    }
    cellEls.push(rowEls);
  }
  syncBoardCells(cellEls, board);
  return cellEls;
}

function syncBoardCells(cellEls, board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellEl = cellEls[r][c];
      const color = board[r][c];
      cellEl.classList.remove("filled", "pink", "blue", "yellow", "clearing", "auto-fill-in");
      if (color) {
        cellEl.classList.add("filled", color);
      }
    }
  }
}

function paintPreview(cellEls, piece, rowStart, colStart, canPlace) {
  clearPreview(cellEls);
  const cls = canPlace ? "preview-valid" : "preview-invalid";

  for (const [dr, dc] of piece.shape) {
    const r = rowStart + dr;
    const c = colStart + dc;
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      cellEls[r][c].classList.add(cls);
    }
  }
}

function clearPreview(cellEls) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cellEls[r][c].classList.remove("preview-valid", "preview-invalid");
    }
  }
}
