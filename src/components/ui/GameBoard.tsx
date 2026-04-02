import { useEffect } from "react";
import { useGameStore, selectIsWon, selectIsStuck, selectScore, selectMoves, selectElapsed } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import Stock from "./Stock";
import Waste from "./Waste";
import Foundation from "./Foundation";
import Pile from "./Pile";

// ─── Timer display ───────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Win Overlay ─────────────────────────────────────────────────────────────

function WinOverlay({ onNewGame }: { onNewGame: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
      <div className="flex flex-col items-center gap-6 text-center px-8">
        <div className="flex gap-3 text-4xl">
          {["♠", "♥", "♦", "♣"].map((s) => (
            <span
              key={s}
              className="animate-bounce"
              style={{
                color: s === "♥" || s === "♦" ? "#e05252" : "#f0ece3",
                animationDelay: `${["♠","♥","♦","♣"].indexOf(s) * 0.15}s`,
              }}
            >
              {s}
            </span>
          ))}
        </div>
        <div>
          <h2
            className="text-[#f0ece3] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 400 }}
          >
            You Win
          </h2>
          <p className="text-[#c8a84b] text-sm tracking-widest uppercase opacity-80">
            Well played
          </p>
        </div>
        <Button
          onClick={onNewGame}
          variant="outline"
          size="lg"
          className="px-12 tracking-[0.2em] uppercase border-[#c8a84b] text-[#c8a84b] bg-transparent hover:bg-[#c8a84b] hover:text-[#0d1f0f] transition-all duration-300 rounded-sm"
        >
          Deal Again
        </Button>
      </div>
    </div>
  );
}

// ─── Stuck Banner ─────────────────────────────────────────────────────────────

function StuckBanner({ onNewGame }: { onNewGame: () => void }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-[#1a1a2e]/90 border border-[#c8a84b]/40 rounded-lg px-5 py-3 backdrop-blur-sm">
      <span className="text-[#c8a84b] text-sm tracking-wide">No moves available</span>
      <Button
        onClick={onNewGame}
        variant="outline"
        size="sm"
        className="text-xs tracking-widest uppercase border-[#c8a84b]/60 text-[#c8a84b] bg-transparent hover:bg-[#c8a84b] hover:text-[#0d1f0f] rounded-sm transition-all duration-200"
      >
        New Game
      </Button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function GameBoard() {
  const isWon    = useGameStore(selectIsWon);
  const isStuck  = useGameStore(selectIsStuck);
  const score    = useGameStore(selectScore);
  const moves    = useGameStore(selectMoves);
  const elapsed  = useGameStore(selectElapsed);
  const { newGame, tickTimer, checkStuck } = useGameStore();

  // ── Timer ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(id);
  }, [tickTimer]);

  // ── Stuck check (debounced) ───────────────────────────────────────────────

  useEffect(() => {
    const id = setTimeout(() => checkStuck(), 150);
    return () => clearTimeout(id);
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-[#0d1f0f]">

      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(34,85,34,0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(20,60,20,0.5) 0%, transparent 55%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)
          `,
        }}
      />

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-white/5">
        {/* Left: title */}
        <h1
          className="text-[#c8a84b] tracking-[0.3em] uppercase text-sm opacity-80"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Solitaire
        </h1>

        {/* Center: stats */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-white/30 text-[10px] tracking-widest uppercase">Score</span>
            <span className="text-[#f0ece3] text-sm font-medium tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/30 text-[10px] tracking-widest uppercase">Moves</span>
            <span className="text-[#f0ece3] text-sm font-medium tabular-nums">{moves}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/30 text-[10px] tracking-widest uppercase">Time</span>
            <span className="text-[#f0ece3] text-sm font-medium tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Right: actions */}
        <Button
          onClick={newGame}
          variant="ghost"
          size="sm"
          className="text-xs tracking-widest uppercase text-[#8a9e8a] hover:text-[#c8a84b] hover:bg-transparent"
        >
          New Game
        </Button>
      </div>

      {/* ── Game area ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col gap-4 px-4 py-4 overflow-hidden">

        {/* Top row: stock, waste, gap, foundations */}
        <div className="grid grid-cols-7 gap-3">
          {/* Stock */}
          <div className="col-span-1">
            <Stock />
          </div>

          {/* Waste */}
          <div className="col-span-1">
            <Waste />
          </div>

          {/* Empty spacer */}
          <div className="col-span-1" />

          {/* Foundations (4) */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="col-span-1">
              <Foundation index={i} />
            </div>
          ))}
        </div>

        {/* Tableau: 7 columns */}
        <div className="grid grid-cols-7 gap-3 flex-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-span-1">
              <Pile index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {isWon   && <WinOverlay   onNewGame={newGame} />}
      {isStuck && !isWon && <StuckBanner onNewGame={newGame} />}
    </div>
  );
}