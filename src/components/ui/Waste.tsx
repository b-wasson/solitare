import { useGameStore, selectDragState, selectDropTarget } from "@/store/gameStore";
import { PileLocation } from "@/types/card";
import Card from "@/components/ui/Card";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Waste() {
  const waste      = useGameStore((s) => s.game.waste);
  const dragState  = useGameStore(selectDragState);
  const { autoMove } = useGameStore();

  const location: PileLocation = { area: "waste" };

  // Show up to the top 3 cards fanned slightly so the player can see recent draws
  const visibleCards = waste.slice(-3);
  const topCard      = waste.length > 0 ? waste[waste.length - 1] : null;

  if (waste.length === 0) {
    return (
      <div
        className="relative w-full rounded-lg"
        style={{ paddingTop: "140%" }}
      >
        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
          <span className="text-white/10 text-sm select-none">Draw</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      style={{ paddingTop: "140%" }}
    >
      <div className="absolute inset-0">
        {/* Fan the last 3 cards slightly for visual depth */}
        {visibleCards.map((card, i) => {
          const isTop    = i === visibleCards.length - 1;
          const offset   = (i - (visibleCards.length - 1)) * 16;

          return (
            <div
              key={card.id}
              className="absolute inset-0"
              style={{
                transform: `translateX(${offset}px)`,
                zIndex: i,
              }}
            >
              <Card
                card={card}
                from={location}
                index={i}
                isDraggable={isTop}
                onDoubleClick={
                  isTop ? () => autoMove(location) : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}