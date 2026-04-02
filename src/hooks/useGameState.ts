import { useState, useCallback, useEffect, useRef } from "react";
import { GameState, PileLocation } from "../types/card";
import { initGame, drawFromStock } from "../lib/gameState";
import { executeMove, autoMoveToFoundation, MoveResult } from "../lib/moves";
import { checkWin, hasLegalMove, getGameResult, GameResult } from "../lib/win";

// ─── Types ───────────────────────────────────────────────────────────────────

type UseGameStateReturn = {
  state:          GameState;
  isStuck:        boolean;
  elapsedSeconds: number;

  // Actions
  newGame:        () => void;
  drawCard:       () => void;
  move:           (from: PileLocation, to: PileLocation, cardId: string) => boolean;
  autoMove:       (from: PileLocation) => boolean;
  getResult:      () => GameResult;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameState(): UseGameStateReturn {
  const [state, setState]               = useState<GameState>(() => initGame());
  const [isStuck, setIsStuck]           = useState(false);
  const [elapsedSeconds, setElapsed]    = useState(0);
  const timerRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ─────────────────────────────────────────────────────────────────

  // Start a 1-second interval to track elapsed time
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.startTime]); // restarts when a new game begins

  // Stop timer when the game is won
  useEffect(() => {
    if (state.isWon && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [state.isWon]);

  // ── Stuck Detection ───────────────────────────────────────────────────────

  // Re-check after every state change (debounced to avoid blocking renders)
  useEffect(() => {
    const id = setTimeout(() => {
      setIsStuck(!state.isWon && !hasLegalMove(state));
    }, 100);
    return () => clearTimeout(id);
  }, [state]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const newGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsed(0);
    setIsStuck(false);
    setState(initGame());
  }, []);

  const drawCard = useCallback(() => {
    setState((prev) => drawFromStock(prev));
  }, []);

  /**
   * Attempts to move card(s) from `from` to `to`.
   * Returns true if the move was valid and applied.
   */
  const move = useCallback((
    from: PileLocation,
    to: PileLocation,
    cardId: string
  ): boolean => {
    let success = false;

    setState((prev) => {
      const result: MoveResult = executeMove(prev, from, to, cardId);
      if (result.success) {
        success = true;
        return result.state;
      }
      return prev;
    });

    return success;
  }, []);

  /**
   * Attempts to auto-move the top card from `from` to its correct foundation.
   * Triggered on double-click. Returns true if a move was made.
   */
  const autoMove = useCallback((from: PileLocation): boolean => {
    let success = false;

    setState((prev) => {
      const result = autoMoveToFoundation(prev, from);
      if (result?.success) {
        success = true;
        return result.state;
      }
      return prev;
    });

    return success;
  }, []);

  const getResult = useCallback((): GameResult => {
    return getGameResult(state);
  }, [state]);

  return {
    state,
    isStuck,
    elapsedSeconds,
    newGame,
    drawCard,
    move,
    autoMove,
    getResult,
  };
}