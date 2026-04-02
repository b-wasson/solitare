import { useState, useCallback, useRef } from "react";
import { Card, PileLocation } from "../types/card";

// ─── Types ───────────────────────────────────────────────────────────────────

type DragState = {
  cards:       Card[];         // the card(s) being dragged (can be a stack)
  from:        PileLocation;   // where the drag started
  cardId:      string;         // the id of the bottom card in the drag
} | null;

type DropTarget = {
  location:   PileLocation;
  isValid:    boolean;         // true = green highlight, false = red/none
} | null;

type UseDragAndDropReturn = {
  dragState:    DragState;
  dropTarget:   DropTarget;
  isDragging:   boolean;

  // Call these from your card/pile components
  onDragStart:  (cards: Card[], from: PileLocation, cardId: string) => void;
  onDragEnter:  (location: PileLocation, isValid: boolean) => void;
  onDragLeave:  () => void;
  onDrop:       (to: PileLocation) => { from: PileLocation; cardId: string } | null;
  onDragEnd:    () => void;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Manages drag-and-drop state for the game board.
 *
 * Usage pattern in components:
 *
 *   // In Card.tsx — make a card draggable
 *   <div
 *     draggable
 *     onDragStart={() => onDragStart([card], from, card.id)}
 *     onDragEnd={onDragEnd}
 *   />
 *
 *   // In Pile.tsx — make a pile a drop target
 *   <div
 *     onDragOver={(e) => { e.preventDefault(); onDragEnter(location, isValidMove); }}
 *     onDragLeave={onDragLeave}
 *     onDrop={() => { const result = onDrop(location); if (result) move(...); }}
 *   />
 */
export function useDragAndDrop(): UseDragAndDropReturn {
  const [dragState, setDragState]   = useState<DragState>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  // Track drag state in a ref too so onDrop can read it synchronously
  // (setState is async, so reading state inside onDrop can be stale)
  const dragRef = useRef<DragState>(null);

  const onDragStart = useCallback((
    cards: Card[],
    from: PileLocation,
    cardId: string
  ) => {
    const next: DragState = { cards, from, cardId };
    dragRef.current = next;
    setDragState(next);
  }, []);

  const onDragEnter = useCallback((location: PileLocation, isValid: boolean) => {
    setDropTarget({ location, isValid });
  }, []);

  const onDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  /**
   * Called when the user drops onto a pile.
   * Returns the { from, cardId } needed to call move() in useGameState,
   * or null if there's nothing being dragged.
   */
  const onDrop = useCallback((to: PileLocation): { from: PileLocation; cardId: string } | null => {
    const current = dragRef.current;
    if (!current) return null;

    const result = { from: current.from, cardId: current.cardId };

    // Clear drag state
    dragRef.current = null;
    setDragState(null);
    setDropTarget(null);

    return result;
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
    setDragState(null);
    setDropTarget(null);
  }, []);

  return {
    dragState,
    dropTarget,
    isDragging: dragState !== null,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragEnd,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Checks if two PileLocations refer to the same pile.
 * Useful in components to avoid dropping a card onto its own pile.
 */
export function isSamePile(a: PileLocation, b: PileLocation): boolean {
  if (a.area !== b.area) return false;
  if (a.area === "tableau"   && b.area === "tableau")   return a.index === b.index;
  if (a.area === "foundation" && b.area === "foundation") return a.index === b.index;
  return true; // waste/stock have no index
}