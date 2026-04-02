import { Card, GameState, PileLocation, Rank } from "../types/card";
import { getTopCard } from "./deck";
import { removeCards, placeCards, calculateScore } from "./gameState";
import { checkWin } from "./win";

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * A card can go onto a tableau pile if:
 *  - The pile is empty and the card is a King (rank 13)
 *  - The card is one rank lower than the top card AND opposite in color
 */
export function canMoveToTableau(card: Card, targetPile: Card[]): boolean {
  if (targetPile.length === 0) {
    return card.rank === 13; // only Kings on empty columns
  }

  const top = getTopCard(targetPile)!;

  if (!top.faceUp) return false;

  const isOppositeColor = card.color !== top.color;
  const isOneLower      = card.rank === top.rank - 1;

  return isOppositeColor && isOneLower;
}

/**
 * A card can go onto a foundation pile if:
 *  - The pile is empty and the card is an Ace (rank 1)
 *  - The card is the same suit and one rank higher than the top card
 */
export function canMoveToFoundation(card: Card, targetPile: Card[]): boolean {
  if (targetPile.length === 0) {
    return card.rank === 1; // only Aces start foundations
  }

  const top = getTopCard(targetPile)!;

  const isSameSuit  = card.suit === top.suit;
  const isOneHigher = card.rank === top.rank + 1;

  return isSameSuit && isOneHigher;
}

/**
 * Returns which foundation index a card belongs on (matched by suit order).
 * suits order: hearts=0, diamonds=1, clubs=2, spades=3
 */
export function getFoundationIndex(card: Card): number {
  const order = ["hearts", "diamonds", "clubs", "spades"];
  return order.indexOf(card.suit);
}

/**
 * Given a source location, returns the cards that would be moved.
 * From tableau: returns the card AND all cards stacked beneath it (a sub-stack).
 * From waste/foundation: returns only the single top card.
 */
export function getMovableCards(state: GameState, from: PileLocation, cardId: string): Card[] {
  switch (from.area) {
    case "tableau": {
      const pile  = state.tableau[from.index];
      const index = pile.findIndex((c) => c.id === cardId);
      if (index === -1) return [];
      return pile.slice(index); // card + everything on top of it
    }

    case "waste": {
      const top = getTopCard(state.waste);
      return top && top.id === cardId ? [top] : [];
    }

    case "foundation": {
      const top = getTopCard(state.foundations[from.index]);
      return top && top.id === cardId ? [top] : [];
    }

    case "stock":
      return [];
  }
}

// ─── Auto-move to Foundation ─────────────────────────────────────────────────

/**
 * Checks whether a card can be auto-moved to any foundation.
 * Returns the foundation index if valid, or -1 if not.
 */
export function findAutoFoundation(state: GameState, card: Card): number {
  for (let i = 0; i < state.foundations.length; i++) {
    if (canMoveToFoundation(card, state.foundations[i])) {
      return i;
    }
  }
  return -1;
}

// ─── Execute Move ─────────────────────────────────────────────────────────────

export type MoveResult =
  | { success: true;  state: GameState }
  | { success: false; reason: string };

/**
 * Attempts to move cards from `from` to `to`.
 * Validates the move, updates state, increments move counter, updates score.
 * Returns a MoveResult — never throws.
 */
export function executeMove(
  state: GameState,
  from: PileLocation,
  to: PileLocation,
  cardId: string
): MoveResult {
  // 1. Get the cards being moved
  const cards = getMovableCards(state, from, cardId);
  if (cards.length === 0) {
    return { success: false, reason: "No movable card found" };
  }

  const leadCard = cards[0]; // the bottom card of the moving stack

  // 2. Validate destination
  if (to.area === "tableau") {
    const targetPile = state.tableau[to.index];
    if (!canMoveToTableau(leadCard, targetPile)) {
      return { success: false, reason: "Invalid tableau move" };
    }
  }

  if (to.area === "foundation") {
    if (cards.length > 1) {
      return { success: false, reason: "Cannot move a stack to a foundation" };
    }
    const targetPile = state.foundations[to.index];
    if (!canMoveToFoundation(leadCard, targetPile)) {
      return { success: false, reason: "Invalid foundation move" };
    }
  }

  // 3. Apply the move
  const newScore    = calculateScore(state, from, to);
  let   newState    = removeCards(state, from, cards);
  newState          = placeCards(newState, to, cards);
  newState          = { ...newState, score: newScore, moves: newState.moves + 1 };

  // 4. Check win
  newState = { ...newState, isWon: checkWin(newState) };

  return { success: true, state: newState };
}

/**
 * Convenience: auto-move the top card of waste or a tableau pile to its
 * correct foundation. Returns null if no auto-move is possible.
 */
export function autoMoveToFoundation(
  state: GameState,
  from: PileLocation
): MoveResult | null {
  let card: Card | null = null;

  if (from.area === "waste") {
    card = getTopCard(state.waste);
  } else if (from.area === "tableau") {
    card = getTopCard(state.tableau[from.index]);
  }

  if (!card) return null;

  const foundationIndex = findAutoFoundation(state, card);
  if (foundationIndex === -1) return null;

  return executeMove(state, from, { area: "foundation", index: foundationIndex }, card.id);
}