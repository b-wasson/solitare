import { GameState, Card, SUITS } from "../types/card";

// ─── Win Condition ───────────────────────────────────────────────────────────

/**
 * The game is won when all 4 foundations each have 13 cards (A → K).
 * This is the simplest and most reliable check.
 */
export function checkWin(state: GameState): boolean {
  return state.foundations.every((pile) => pile.length === 13);
}

// ─── Progress ────────────────────────────────────────────────────────────────

/**
 * Returns how many cards have been moved to the foundations (0–52).
 * Useful for progress bars or percentage displays.
 */
export function getFoundationProgress(state: GameState): number {
  return state.foundations.reduce((total, pile) => total + pile.length, 0);
}

/**
 * Returns progress as a 0–1 float.
 */
export function getProgressPercent(state: GameState): number {
  return getFoundationProgress(state) / 52;
}

// ─── Stuck Detection ─────────────────────────────────────────────────────────

/**
 * Checks whether any legal move exists in the current state.
 * If false, the game is stuck (though not necessarily unwinnable).
 *
 * Checks in order:
 *  1. Can the top waste card move to any tableau or foundation?
 *  2. Can any face-up tableau card move to another tableau column?
 *  3. Can any face-up tableau card move to a foundation?
 *  4. Is there anything left in the stock to draw?
 */
export function hasLegalMove(state: GameState): boolean {
  const { tableau, foundations, waste, stock } = state;

  // 1. Stock can still be drawn
  if (stock.length > 0 || waste.length > 0) return true;

  // Helper: can this card go to any foundation?
  function canGoToAnyFoundation(card: Card): boolean {
    return foundations.some((pile) => {
      if (pile.length === 0) return card.rank === 1;
      const top = pile[pile.length - 1];
      return card.suit === top.suit && card.rank === top.rank + 1;
    });
  }

  // Helper: can this card go to any tableau column (excluding its own)?
  function canGoToAnyTableau(card: Card, ownColIndex: number): boolean {
    return tableau.some((pile, i) => {
      if (i === ownColIndex) return false;
      if (pile.length === 0) return card.rank === 13;
      const top = pile[pile.length - 1];
      if (!top.faceUp) return false;
      return card.color !== top.color && card.rank === top.rank - 1;
    });
  }

  // 2. Check top waste card
  if (waste.length > 0) {
    const topWaste = waste[waste.length - 1];
    if (canGoToAnyFoundation(topWaste)) return true;
    if (canGoToAnyTableau(topWaste, -1)) return true;
  }

  // 3. Check all face-up tableau cards
  for (let col = 0; col < tableau.length; col++) {
    const pile = tableau[col];
    for (const card of pile) {
      if (!card.faceUp) continue;
      if (canGoToAnyFoundation(card)) return true;
      if (canGoToAnyTableau(card, col)) return true;
    }
  }

  return false;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

/**
 * Returns elapsed seconds since the game started.
 */
export function getElapsedSeconds(state: GameState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

/**
 * Formats elapsed time as "MM:SS".
 */
export function formatTime(state: GameState): string {
  const total   = getElapsedSeconds(state);
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export type GameResult = {
  won:            boolean;
  isStuck:        boolean;
  score:          number;
  moves:          number;
  elapsedSeconds: number;
  foundationCards: number; // how many cards made it to foundations
};

/**
 * Returns a summary of the current game state.
 * Useful for end-of-game screens and saving stats to Rust.
 */
export function getGameResult(state: GameState): GameResult {
  return {
    won:             checkWin(state),
    isStuck:         !hasLegalMove(state),
    score:           state.score,
    moves:           state.moves,
    elapsedSeconds:  getElapsedSeconds(state),
    foundationCards: getFoundationProgress(state),
  };
}