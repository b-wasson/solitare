import { GameState, PileLocation, Card } from "../types/card";
import { createNewGame, flipTopCard, getTopCard } from "./deck";

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * Returns a brand new GameState.
 * Thin wrapper around createNewGame() — your hooks/store call this.
 */
export function initGame(): GameState {
  return createNewGame();
}

// ─── Stock & Waste ───────────────────────────────────────────────────────────

/**
 * Draws one card from the stock onto the waste pile (face up).
 * If the stock is empty, recycles the waste back into the stock (face down).
 * Returns a new GameState — does not mutate.
 */
export function drawFromStock(state: GameState): GameState {
  // Recycle waste → stock when stock is empty
  if (state.stock.length === 0) {
    if (state.waste.length === 0) return state; // nothing to do
    return {
      ...state,
      stock: state.waste.map((c) => ({ ...c, faceUp: false })).reverse(),
      waste: [],
      moves: state.moves + 1,
    };
  }

  const stock = [...state.stock];
  const card  = { ...stock.pop()!, faceUp: true };

  return {
    ...state,
    stock,
    waste: [...state.waste, card],
    moves: state.moves + 1,
  };
}

// ─── Remove Cards From a Pile ────────────────────────────────────────────────

/**
 * Removes cards from their source pile and flips the new top card if needed.
 * Returns the updated full GameState with the cards removed.
 */
export function removeCards(
  state: GameState,
  from: PileLocation,
  cards: Card[]
): GameState {
  const cardIds = new Set(cards.map((c) => c.id));

  switch (from.area) {
    case "tableau": {
      const tableau = state.tableau.map((pile, i) => {
        if (i !== from.index) return pile;
        const remaining = pile.filter((c) => !cardIds.has(c.id));
        return flipTopCard(remaining);
      });
      return { ...state, tableau };
    }

    case "waste": {
      const waste = state.waste.filter((c) => !cardIds.has(c.id));
      return { ...state, waste };
    }

    case "foundation": {
      const foundations = state.foundations.map((pile, i) => {
        if (i !== from.index) return pile;
        return pile.filter((c) => !cardIds.has(c.id));
      });
      return { ...state, foundations };
    }

    case "stock":
      // Cards are not moved directly from stock (use drawFromStock)
      return state;
  }
}

// ─── Place Cards onto a Pile ─────────────────────────────────────────────────

/**
 * Places cards onto their destination pile.
 * Returns updated GameState — does not mutate.
 */
export function placeCards(
  state: GameState,
  to: PileLocation,
  cards: Card[]
): GameState {
  switch (to.area) {
    case "tableau": {
      const tableau = state.tableau.map((pile, i) => {
        if (i !== to.index) return pile;
        return [...pile, ...cards.map((c) => ({ ...c, faceUp: true }))];
      });
      return { ...state, tableau };
    }

    case "foundation": {
      const foundations = state.foundations.map((pile, i) => {
        if (i !== to.index) return pile;
        return [...pile, ...cards.map((c) => ({ ...c, faceUp: true }))];
      });
      return { ...state, foundations };
    }

    case "waste":
    case "stock":
      // Cards are never placed directly onto waste or stock by the player
      return state;
  }
}

// ─── Score ───────────────────────────────────────────────────────────────────

const SCORE_VALUES = {
  wasteToTableau:    5,
  wasteToFoundation: 10,
  tableauToFoundation: 10,
  foundationToTableau: -15,
  flipTableauCard:   5,
  recycleStock:      -100, // penalty for going through the deck again
} as const;

export function calculateScore(
  state: GameState,
  from: PileLocation,
  to: PileLocation
): number {
  let delta = 0;

  if (from.area === "waste" && to.area === "tableau")    delta = SCORE_VALUES.wasteToTableau;
  if (from.area === "waste" && to.area === "foundation") delta = SCORE_VALUES.wasteToFoundation;
  if (from.area === "tableau" && to.area === "foundation") delta = SCORE_VALUES.tableauToFoundation;
  if (from.area === "foundation" && to.area === "tableau") delta = SCORE_VALUES.foundationToTableau;

  return Math.max(0, state.score + delta);
}