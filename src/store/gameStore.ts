import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, PileLocation, Card } from "../types/card";
import { initGame, drawFromStock } from "../lib/gameState";
import { executeMove, autoMoveToFoundation, MoveResult } from "../lib/moves";
import { checkWin, hasLegalMove, getGameResult, GameResult } from "../lib/win";

// ─── Types ───────────────────────────────────────────────────────────────────

type DragState = {
  cards:  Card[];
  from:   PileLocation;
  cardId: string;
} | null;

type GameStore = {
  // ── Game State ─────────────────────────────────────────────────────────────
  game:           GameState;
  isStuck:        boolean;
  elapsedSeconds: number;

  // ── Drag State ─────────────────────────────────────────────────────────────
  dragState:      DragState;
  dropTarget:     PileLocation | null;
  isValidDrop:    boolean;

  // ── Game Actions ───────────────────────────────────────────────────────────
  newGame:        () => void;
  drawCard:       () => void;
  move:           (from: PileLocation, to: PileLocation, cardId: string) => boolean;
  autoMove:       (from: PileLocation) => boolean;
  getResult:      () => GameResult;
  tickTimer:      () => void;
  checkStuck:     () => void;

  // ── Drag Actions ───────────────────────────────────────────────────────────
  startDrag:      (cards: Card[], from: PileLocation, cardId: string) => void;
  setDropTarget:  (location: PileLocation | null, isValid: boolean) => void;
  endDrag:        () => void;
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({

    // ── Initial State ─────────────────────────────────────────────────────────

    game:           initGame(),
    isStuck:        false,
    elapsedSeconds: 0,
    dragState:      null,
    dropTarget:     null,
    isValidDrop:    false,

    // ── Game Actions ──────────────────────────────────────────────────────────

    newGame: () => {
      set({
        game:           initGame(),
        isStuck:        false,
        elapsedSeconds: 0,
        dragState:      null,
        dropTarget:     null,
        isValidDrop:    false,
      });
    },

    drawCard: () => {
      set((s) => ({ game: drawFromStock(s.game) }));
    },

    /**
     * Attempts to move card(s) from `from` to `to`.
     * Returns true if the move was valid and applied.
     */
    move: (from, to, cardId) => {
      const result: MoveResult = executeMove(get().game, from, to, cardId);
      if (!result.success) return false;
      set({ game: result.state });
      return true;
    },

    /**
     * Double-click auto-move: sends the top card of a pile to its foundation.
     * Returns true if a move was made.
     */
    autoMove: (from) => {
      const result = autoMoveToFoundation(get().game, from);
      if (!result?.success) return false;
      set({ game: result.state });
      return true;
    },

    getResult: () => getGameResult(get().game),

    /**
     * Called every second by the timer in GameBoard.
     * Stops incrementing once the game is won.
     */
    tickTimer: () => {
      if (get().game.isWon) return;
      set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
    },

    /**
     * Re-evaluates whether the game is stuck.
     * Call this after every move (debounce in GameBoard to avoid blocking renders).
     */
    checkStuck: () => {
      const { game } = get();
      set({ isStuck: !game.isWon && !hasLegalMove(game) });
    },

    // ── Drag Actions ──────────────────────────────────────────────────────────

    startDrag: (cards, from, cardId) => {
      set({ dragState: { cards, from, cardId } });
    },

    setDropTarget: (location, isValid) => {
      set({ dropTarget: location, isValidDrop: isValid });
    },

    endDrag: () => {
      set({ dragState: null, dropTarget: null, isValidDrop: false });
    },
  }))
);

// ─── Selectors ────────────────────────────────────────────────────────────────
// Use these in components to avoid re-renders from unrelated state changes.

export const selectTableau     = (s: GameStore) => s.game.tableau;
export const selectFoundations = (s: GameStore) => s.game.foundations;
export const selectStock       = (s: GameStore) => s.game.stock;
export const selectWaste       = (s: GameStore) => s.game.waste;
export const selectScore       = (s: GameStore) => s.game.score;
export const selectMoves       = (s: GameStore) => s.game.moves;
export const selectIsWon       = (s: GameStore) => s.game.isWon;
export const selectIsStuck     = (s: GameStore) => s.isStuck;
export const selectElapsed     = (s: GameStore) => s.elapsedSeconds;
export const selectDragState   = (s: GameStore) => s.dragState;
export const selectDropTarget  = (s: GameStore) => s.dropTarget;
export const selectIsValidDrop = (s: GameStore) => s.isValidDrop;