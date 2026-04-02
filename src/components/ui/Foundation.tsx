import { useGameStore, selectDragState, selectDropTarget } from "@/store/gameStore";
import { PileLocation, SUIT_SYMBOLS, Suit } from "@/types/card";
import { canMoveToFoundation } from "@/lib/moves";
import Card from "./Card";

// ─── Types ───────────────────────────────────────────────────────────────────

type FoundationProps = {
  index: number; // 0–3
};

// Suit order matches the foundations array: hearts, diamonds, clubs, spades
const FOUNDATION_SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Foundation({ index }: FoundationProps) {
  const pile       = useGameStore((s) => s.game.foundations[index]);
  const dragState  = useGameStore(selectDragState);
  const dropTarget = useGameStore(selectDropTarget);
  const { move, autoMove, setDropTarget, endDrag } = useGameStore();

  const location: PileLocation = { area: "foundation", index };
  const suit     = FOUNDATION_SUITS[index];
  const topCard  = pile.length > 0 ? pile[pile.length - 1] : null;
  const isRed    = suit === "hearts" || suit === "diamonds";

  const isHovered =
    dropTarget?.area === "foundation" &&
    "index" in dropTarget &&
    dropTarget.index === index;

  // ── Drop Validation ────────────────────────────────────────────────────────

  function getIsValidDrop(): boolean {
    if (!dragState || dragState.cards.length > 1) return false;
    return canMoveToFoundation(dragState.cards[0], pile);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(location, getIsValidDrop());
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null, false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragState) return;
    if (getIsValidDrop()) {
      move(dragState.from, location, dragState.cardId);
    }
    endDrag();
  }

  // ── Highlight ─────────────────────────────────────────────────────────────

  const highlightClass = isHovered
    ? getIsValidDrop()
      ? "ring-2 ring-emerald-400 ring-opacity-70"
      : "ring-2 ring-red-400 ring-opacity-50"
    : "";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={`relative w-full rounded-lg transition-all duration-150 ${highlightClass}`}
      style={{ paddingTop: "140%" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 rounded-lg">
        {topCard ? (
          // Show the top card of the foundation
          <div className="absolute inset-0">
            <Card
              card={topCard}
              from={location}
              isDraggable={false}
            />
          </div>
        ) : (
          // Empty placeholder showing the suit
          <div
            className="absolute inset-0 rounded-lg border-2 border-dashed border-white/15 flex items-center justify-center"
          >
            <span
              className="text-3xl select-none opacity-30"
              style={{ color: isRed ? "#e05252" : "#f0ece3" }}
            >
              {SUIT_SYMBOLS[suit]}
            </span>
          </div>
        )}

        {/* Completion glow when foundation is complete */}
        {pile.length === 13 && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow: "0 0 20px rgba(200,168,75,0.5), inset 0 0 20px rgba(200,168,75,0.1)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}