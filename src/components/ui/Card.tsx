import { Card as CardType, RANK_LABELS, SUIT_SYMBOLS, PileLocation } from "@/types/card";
import { useGameStore, selectDragState } from "@/store/gameStore";
import { canMoveToTableau, canMoveToFoundation } from "@/lib/moves";

// ─── Types ───────────────────────────────────────────────────────────────────

type CardProps = {
  card:        CardType;
  from:        PileLocation;
  index?:      number;        // position in pile, used for z-index
  isDraggable?: boolean;
  onDoubleClick?: () => void;
};

// ─── Card Back Pattern ───────────────────────────────────────────────────────

function CardBack() {
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden">
      {/* Deep navy base */}
      <div className="absolute inset-0 bg-[#1a2744]" />
      {/* Diamond pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 6px,
              rgba(200,168,75,0.4) 6px,
              rgba(200,168,75,0.4) 7px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 6px,
              rgba(200,168,75,0.4) 6px,
              rgba(200,168,75,0.4) 7px
            )
          `,
        }}
      />
      {/* Inner border */}
      <div className="absolute inset-[4px] rounded-md border border-[#c8a84b] opacity-40" />
      {/* Center motif */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#c8a84b] opacity-50 text-xl">♠</span>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Card({
  card,
  from,
  index = 0,
  isDraggable = true,
  onDoubleClick,
}: CardProps) {
  const { startDrag, endDrag, game } = useGameStore();
  const dragState = useGameStore(selectDragState);

  const isRed      = card.color === "red";
  const rankLabel  = RANK_LABELS[card.rank];
  const suitSymbol = SUIT_SYMBOLS[card.suit];

  const isBeingDragged = dragState?.cardId === card.id;

  // ── Drag Handlers ──────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent) {
    if (!card.faceUp || !isDraggable) {
      e.preventDefault();
      return;
    }

    // Build the stack of cards being dragged (this card + any on top)
    let cards = [card];
    if (from.area === "tableau") {
      const pile  = game.tableau[from.index];
      const idx   = pile.findIndex((c) => c.id === card.id);
      cards       = pile.slice(idx);
    }

    e.dataTransfer.effectAllowed = "move";
    // Store card info in dataTransfer for cross-component access
    e.dataTransfer.setData("cardId", card.id);
    e.dataTransfer.setData("fromArea", from.area);
    e.dataTransfer.setData("fromIndex", String("index" in from ? from.index : -1));

    startDrag(cards, from, card.id);
  }

  function handleDragEnd() {
    endDrag();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!card.faceUp) {
    return (
      <div
        className="relative w-full"
        style={{ paddingTop: "140%", zIndex: index }}
      >
        <div className="absolute inset-0 rounded-lg shadow-md">
          <CardBack />
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={isDraggable && card.faceUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={onDoubleClick}
      className={`
        relative w-full select-none rounded-lg
        transition-all duration-150
        ${isDraggable && card.faceUp ? "cursor-grab active:cursor-grabbing" : "cursor-default"}
        ${isBeingDragged ? "opacity-40" : "opacity-100"}
      `}
      style={{ paddingTop: "140%", zIndex: index }}
    >
      <div
        className={`
          absolute inset-0 rounded-lg shadow-md
          bg-[#f5f0e8] border border-[#d4c9b0]
          hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-150
        `}
      >
        {/* Top-left rank + suit */}
        <div
          className="absolute top-1.5 left-2 flex flex-col items-center leading-none"
          style={{ color: isRed ? "#c0392b" : "#1a1a2e" }}
        >
          <span className="text-sm font-bold leading-none">{rankLabel}</span>
          <span className="text-xs leading-none">{suitSymbol}</span>
        </div>

        {/* Center suit */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: isRed ? "#c0392b" : "#1a1a2e" }}
        >
          <span
            className="select-none"
            style={{ fontSize: "clamp(1rem, 3vw, 1.75rem)" }}
          >
            {suitSymbol}
          </span>
        </div>

        {/* Bottom-right rank + suit (rotated) */}
        <div
          className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180"
          style={{ color: isRed ? "#c0392b" : "#1a1a2e" }}
        >
          <span className="text-sm font-bold leading-none">{rankLabel}</span>
          <span className="text-xs leading-none">{suitSymbol}</span>
        </div>
      </div>
    </div>
  );
}