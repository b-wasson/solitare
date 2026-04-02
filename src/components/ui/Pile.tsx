import { useGameStore, selectDragState, selectDropTarget } from "@/store/gameStore";
import { PileLocation } from "@/types/card";
import { canMoveToTableau } from "@/lib/moves";
import { getTopCard } from "@/lib/deck";
import Card from "./Card";

// ─── Types ───────────────────────────────────────────────────────────────────

type PileProps = {
  index: number; // 0–6, which tableau column this is
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Pile({ index }: PileProps) {
  const pile      = useGameStore((s) => s.game.tableau[index]);
  const dragState = useGameStore(selectDragState);
  const dropTarget = useGameStore(selectDropTarget);
  const { move, autoMove, setDropTarget, endDrag } = useGameStore();

  const location: PileLocation = { area: "tableau", index };

  // Is this pile currently being hovered as a drop target?
  const isHovered =
    dropTarget?.area === "tableau" &&
    "index" in dropTarget &&
    dropTarget.index === index;

  // ── Drop Validation ────────────────────────────────────────────────────────

  function getIsValidDrop(): boolean {
    if (!dragState) return false;
    const leadCard = dragState.cards[0];
    return canMoveToTableau(leadCard, pile);
  }

  // ── Drag Over / Drop Handlers ─────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const isValid = getIsValidDrop();
    setDropTarget(location, isValid);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the pile entirely (not just entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null, false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragState) return;

    const isValid = getIsValidDrop();
    if (isValid) {
      move(dragState.from, location, dragState.cardId);
    }
    endDrag();
  }

  // ── Highlight styles ──────────────────────────────────────────────────────

  const highlightClass = isHovered
    ? getIsValidDrop()
      ? "ring-2 ring-emerald-400 ring-opacity-70"
      : "ring-2 ring-red-400 ring-opacity-50"
    : "";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={`
        relative w-full rounded-lg min-h-[120px]
        transition-all duration-150
        ${highlightClass}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Empty pile placeholder */}
      {pile.length === 0 && (
        <div
          className="absolute inset-0 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center"
          style={{ minHeight: "120px" }}
        >
          <span className="text-white/10 text-2xl select-none">K</span>
        </div>
      )}

      {/* Stacked cards */}
      <div className="relative" style={{ minHeight: "120px" }}>
        {pile.map((card, i) => {
          const isFaceUp   = card.faceUp;
          // Face-down cards overlap tightly, face-up cards fan out more
          const offset     = i === 0 ? 0 : pile[i - 1].faceUp ? 28 : 14;
          const topOffset  = pile
            .slice(0, i)
            .reduce((acc, c, idx) => acc + (idx === 0 ? 0 : pile[idx - 1].faceUp ? 28 : 14), 0);

          return (
            <div
              key={card.id}
              className="absolute w-full"
              style={{ top: `${topOffset}px` }}
            >
              <Card
                card={card}
                from={location}
                index={i}
                isDraggable={isFaceUp}
                onDoubleClick={
                  isFaceUp && i === pile.length - 1
                    ? () => autoMove(location)
                    : undefined
                }
              />
            </div>
          );
        })}

        {/* Spacer to ensure the container is tall enough */}
        {pile.length > 0 && (
          <div
            style={{
              height: `${
                pile.reduce((acc, c, i) =>
                  acc + (i === 0 ? 0 : pile[i - 1].faceUp ? 28 : 14), 0
                ) + 90
              }px`,
            }}
          />
        )}
      </div>
    </div>
  );
}