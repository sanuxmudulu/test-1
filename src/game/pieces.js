// Piece shapes as [row, col] cell offsets, normalized so the top-left-most
// cell sits at (0, 0). Matches the shapes seen in the reference screenshots:
// a vertical/horizontal line, a domino, a 2x2 square, and T/J/L tromino-style
// caps (three across the top with one cell hanging off it).
const SHAPES = {
  single: [[0, 0]],
  domino_h: [[0, 0], [0, 1]],
  domino_v: [[0, 0], [1, 0]],
  triple_h: [[0, 0], [0, 1], [0, 2]],
  triple_v: [[0, 0], [1, 0], [2, 0]],
  quad_h: [[0, 0], [0, 1], [0, 2], [0, 3]],
  quad_v: [[0, 0], [1, 0], [2, 0], [3, 0]],
  square: [[0, 0], [0, 1], [1, 0], [1, 1]],
  t_cap: [[0, 0], [0, 1], [0, 2], [1, 1]],
  j_cap: [[0, 0], [0, 1], [0, 2], [1, 0]],
  l_cap: [[0, 0], [0, 1], [0, 2], [1, 2]],
};

// A single-row horizontal shape for each possible gap width. Used by the
// biasing heuristic below to close out a near-full row exactly.
const HORIZONTAL_SHAPE_BY_WIDTH = {
  1: "single",
  2: "domino_h",
  3: "triple_h",
  4: "quad_h",
};

const COLORS = ["pink", "blue", "yellow"];

// Probability that piece generation prefers a row-completing shape over a
// fully random one, when a completable row exists. Kept below 1 so play
// still feels organic rather than obviously scripted.
const BIAS_CHANCE = 0.6;

let pieceIdCounter = 0;

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function shapeDimensions(shape) {
  let maxRow = 0;
  let maxCol = 0;
  for (const [r, c] of shape) {
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }
  return { rows: maxRow + 1, cols: maxCol + 1 };
}

function createPiece(shapeKey) {
  const shape = SHAPES[shapeKey];
  const { rows, cols } = shapeDimensions(shape);
  pieceIdCounter += 1;
  return {
    id: `piece-${pieceIdCounter}`,
    shapeKey,
    shape,
    rows,
    cols,
    color: randomColor(),
  };
}

/**
 * Piece-generation bias heuristic.
 *
 * Scans the board for rows that are "close to full" — 1 to 4 empty cells
 * that are all contiguous — and collects the single horizontal shape that
 * would exactly plug that gap. Generation then has a BIAS_CHANCE probability
 * of handing out one of those completing shapes instead of a fully random
 * one. This is intentionally simple (no lookahead, no multi-row solving):
 * it just nudges the piece pool toward "finishable" rows so a player can
 * realistically clear several rows within a small move budget, without the
 * game ever guaranteeing a placement.
 */
function findRowCompletionShapes(board) {
  const candidates = [];

  for (const row of board) {
    const emptyCols = [];
    row.forEach((cell, colIndex) => {
      if (cell === null) emptyCols.push(colIndex);
    });

    if (emptyCols.length === 0 || emptyCols.length > 4) continue;

    const isContiguous = emptyCols.every(
      (col, i) => i === 0 || col === emptyCols[i - 1] + 1
    );

    const shapeKey = HORIZONTAL_SHAPE_BY_WIDTH[emptyCols.length];
    if (isContiguous && shapeKey) {
      candidates.push(shapeKey);
    }
  }

  return candidates;
}

export function generateBiasedPiece(board) {
  const candidates = findRowCompletionShapes(board);

  if (candidates.length > 0 && Math.random() < BIAS_CHANCE) {
    const shapeKey = candidates[Math.floor(Math.random() * candidates.length)];
    return createPiece(shapeKey);
  }

  const allShapeKeys = Object.keys(SHAPES);
  const shapeKey = allShapeKeys[Math.floor(Math.random() * allShapeKeys.length)];
  return createPiece(shapeKey);
}
