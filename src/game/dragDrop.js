// Vertical distance (px) the ghost piece is lifted above the actual pointer
// position while dragging, so a finger on a touchscreen doesn't cover the
// piece it's carrying.
const LIFT_OFFSET = 64;

/**
 * Wires up Pointer Events (covers mouse, touch, and pen with one code path)
 * so a piece element can be dragged from the tray onto the board grid.
 *
 * `callbacks`:
 *   - getCellSize(): current board cell size in px (recomputed per drag,
 *     since layout can change between renders)
 *   - getBoardRect(): board grid's bounding rect
 *   - canPlace(rowStart, colStart): board-aware validity check (bounds +
 *     cell occupancy), supplied by the caller since dragDrop knows nothing
 *     about board state
 *   - onPreview(rowStart, colStart, canPlace): called while dragging over
 *     the board so the caller can paint valid/invalid cell highlights
 *   - onClearPreview(): called when the pointer leaves the board or drag ends
 *   - onDrop(rowStart, colStart): called on release if the drop is valid
 *   - onDragStart() / onDragEnd(): lifecycle hooks for hiding/showing the
 *     source piece in the tray
 */
export function makePieceDraggable(pieceEl, piece, callbacks) {
  pieceEl.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    startDrag(event, pieceEl, piece, callbacks);
  });
}

function startDrag(startEvent, pieceEl, piece, callbacks) {
  const cellSize = callbacks.getCellSize();
  const ghost = buildGhost(piece, cellSize);
  document.body.appendChild(ghost);

  callbacks.onDragStart();
  positionGhost(ghost, startEvent.clientX, startEvent.clientY, piece, cellSize);

  let lastTarget = null;

  const handleMove = (event) => {
    positionGhost(ghost, event.clientX, event.clientY, piece, cellSize);

    const target = resolveBoardTarget(
      event.clientX,
      event.clientY,
      piece,
      cellSize,
      callbacks.getBoardRect(),
      callbacks.canPlace
    );

    if (target) {
      lastTarget = target;
      callbacks.onPreview(target.rowStart, target.colStart, target.canPlace);
    } else if (lastTarget) {
      lastTarget = null;
      callbacks.onClearPreview();
    }
  };

  const handleUp = () => {
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
    window.removeEventListener("pointercancel", handleUp);
    ghost.remove();
    callbacks.onClearPreview();
    callbacks.onDragEnd();

    if (lastTarget && lastTarget.canPlace) {
      callbacks.onDrop(lastTarget.rowStart, lastTarget.colStart);
    }
  };

  window.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleUp);
  window.addEventListener("pointercancel", handleUp);
}

function buildGhost(piece, cellSize) {
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.style.gridTemplateColumns = `repeat(${piece.cols}, ${cellSize}px)`;
  ghost.style.gridTemplateRows = `repeat(${piece.rows}, ${cellSize}px)`;

  const occupied = new Set(piece.shape.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < piece.rows; r++) {
    for (let c = 0; c < piece.cols; c++) {
      const cell = document.createElement("div");
      const isFilled = occupied.has(`${r},${c}`);
      cell.className = `piece-cell ${isFilled ? piece.color : "empty"}`;
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      ghost.appendChild(cell);
    }
  }

  return ghost;
}

function positionGhost(ghost, pointerX, pointerY, piece, cellSize) {
  const width = piece.cols * cellSize + (piece.cols - 1) * 4;
  const height = piece.rows * cellSize + (piece.rows - 1) * 4;
  const left = pointerX - width / 2;
  const top = pointerY - LIFT_OFFSET - height / 2;
  ghost.style.transform = `translate(${left}px, ${top}px)`;
}

function resolveBoardTarget(pointerX, pointerY, piece, cellSize, boardRect, canPlaceCheck) {
  const gap = 4;
  const virtualY = pointerY - LIFT_OFFSET;

  const relX = pointerX - boardRect.left;
  const relY = virtualY - boardRect.top;

  const pieceWidthPx = piece.cols * cellSize + (piece.cols - 1) * gap;
  const pieceHeightPx = piece.rows * cellSize + (piece.rows - 1) * gap;

  const colStart = Math.round((relX - pieceWidthPx / 2) / (cellSize + gap));
  const rowStart = Math.round((relY - pieceHeightPx / 2) / (cellSize + gap));

  // Only report a target while the pointer is roughly over the board —
  // avoids flashing preview highlights while dragging across the tray.
  const withinBoard =
    relX > -pieceWidthPx &&
    relX < boardRect.width + pieceWidthPx &&
    relY > -pieceHeightPx &&
    relY < boardRect.height + pieceHeightPx;

  if (!withinBoard) return null;

  return { rowStart, colStart, canPlace: canPlaceCheck(rowStart, colStart) };
}
