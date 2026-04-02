import { useGameStore } from "@/store/gameStore";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Stock() {
  const stock    = useGameStore((s) => s.game.stock);
  const waste    = useGameStore((s) => s.game.waste);
  const drawCard = useGameStore((s) => s.drawCard);

  const isEmpty   = stock.length === 0;
  const canRecycle = waste.length > 0;

  return (
    <div
      className="relative w-full rounded-lg cursor-pointer select-none"
      style={{ paddingTop: "140%" }}
      onClick={drawCard}
    >
      <div className="absolute inset-0 rounded-lg">
        {isEmpty ? (
          // Recycle indicator
          <div
            className={`
              absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center
              transition-all duration-200
              ${canRecycle
                ? "border-[#c8a84b]/50 hover:border-[#c8a84b] hover:bg-[#c8a84b]/5"
                : "border-white/10"
              }
            `}
          >
            {canRecycle ? (
              <svg
                className="w-8 h-8 text-[#c8a84b] opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            ) : (
              <span className="text-white/10 text-sm">Empty</span>
            )}
          </div>
        ) : (
          // Stack of face-down cards — show up to 3 layered for depth
          <div className="absolute inset-0">
            {/* Shadow cards for depth */}
            {stock.length >= 3 && (
              <div
                className="absolute inset-0 rounded-lg bg-[#1a2744] border border-[#c8a84b]/20"
                style={{ transform: "translate(2px, 2px)" }}
              />
            )}
            {stock.length >= 2 && (
              <div
                className="absolute inset-0 rounded-lg bg-[#1a2744] border border-[#c8a84b]/25"
                style={{ transform: "translate(1px, 1px)" }}
              />
            )}

            {/* Top card (actual card back) */}
            <div
              className="absolute inset-0 rounded-lg overflow-hidden bg-[#1a2744] border border-[#c8a84b]/30 hover:border-[#c8a84b]/60 transition-colors duration-200"
            >
              {/* Diamond pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      transparent, transparent 6px,
                      rgba(200,168,75,0.4) 6px, rgba(200,168,75,0.4) 7px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      transparent, transparent 6px,
                      rgba(200,168,75,0.4) 6px, rgba(200,168,75,0.4) 7px
                    )
                  `,
                }}
              />
              <div className="absolute inset-[4px] rounded-md border border-[#c8a84b] opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#c8a84b] opacity-40 text-xl">♠</span>
              </div>

              {/* Card count badge */}
              <div className="absolute bottom-2 right-2 bg-black/40 rounded px-1.5 py-0.5">
                <span className="text-[#c8a84b] text-xs font-medium opacity-70">
                  {stock.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}