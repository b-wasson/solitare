import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const SUITS = ["♠", "♥", "♦", "♣"];

function FloatingCard({ suit, delay, x }: { suit: string; delay: number; x: number }) {
  const isRed = suit === "♥" || suit === "♦";
  return (
    <div
      className="absolute select-none pointer-events-none text-4xl opacity-0"
      style={{
        left: `${x}%`,
        bottom: "-60px",
        color: isRed ? "#e05252" : "#f0ece3",
        animation: `floatUp 8s ease-in infinite`,
        animationDelay: `${delay}s`,
        textShadow: isRed
          ? "0 0 20px rgba(224,82,82,0.3)"
          : "0 0 20px rgba(240,236,227,0.15)",
      }}
    >
      {suit}
    </div>
  );
}

export default function IntroScreen({ onPlay }: { onPlay?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const floatingCards = [
    { suit: "♠", delay: 0, x: 8 },
    { suit: "♥", delay: 1.5, x: 22 },
    { suit: "♦", delay: 3, x: 42 },
    { suit: "♣", delay: 0.8, x: 60 },
    { suit: "♠", delay: 2.3, x: 75 },
    { suit: "♥", delay: 4.1, x: 88 },
    { suit: "♦", delay: 1.1, x: 33 },
    { suit: "♣", delay: 3.7, x: 55 },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#0d1f0f]">

      {/* Felt texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(34,85,34,0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(20,60,20,0.5) 0%, transparent 55%)
          `,
        }}
      />

      {/* Subtle grid/felt weave */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)
          `,
        }}
      />

      {/* Floating suit icons */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingCards.map((card, i) => (
          <FloatingCard key={i} {...card} />
        ))}
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center gap-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        {/* Top suit row */}
        <div
          className="flex gap-5 text-2xl"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease 0.3s",
          }}
        >
          {["♠", "♥", "♦", "♣"].map((s, i) => (
            <span
              key={s}
              className="transition-transform duration-500 hover:scale-125"
              style={{
                color: s === "♥" || s === "♦" ? "#c8534a" : "#c8bfa8",
                opacity: 0,
                animation: `fadeSlideIn 0.6s ease forwards`,
                animationDelay: `${0.4 + i * 0.12}s`,
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-serif tracking-[0.18em] uppercase text-[#f0ece3] mb-1"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textShadow: "0 2px 30px rgba(240,236,227,0.08)",
              opacity: 0,
              animation: "fadeSlideIn 0.8s ease forwards",
              animationDelay: "0.6s",
            }}
          >
            Solitaire
          </h1>
          <div
            className="flex items-center gap-3 justify-center mt-2"
            style={{
              opacity: 0,
              animation: "fadeSlideIn 0.7s ease forwards",
              animationDelay: "0.85s",
            }}
          >
          </div>
        </div>

        {/* Play button */}
        <Button
          onClick={onPlay}
          variant="outline"
          size="lg"
          className="mt-4 px-16 tracking-[0.25em] uppercase rounded-sm border-[#c8a84b] text-[#c8a84b] bg-transparent hover:bg-[#c8a84b] hover:text-[#0d1f0f] hover:shadow-[0_0_30px_rgba(200,168,75,0.25)] transition-all duration-300"
          style={{
            opacity: 0,
            animation: "fadeSlideIn 0.7s ease forwards",
            animationDelay: "1.1s",
          }}
        >
          Deal Cards
        </Button>

        {/* Secondary actions */}
        <div
          className="flex gap-4 mt-2"
          style={{
            opacity: 0,
            animation: "fadeSlideIn 0.6s ease forwards",
            animationDelay: "1.3s",
          }}
        >
          {["Settings", "Statistics"].map((label) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              className="text-xs tracking-widest uppercase text-[#8a9e8a] hover:text-[#c8a84b] hover:bg-transparent transition-colors duration-200"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom card art */}
      <div
        className="absolute bottom-10 flex gap-2"
        style={{
          opacity: visible ? 0.18 : 0,
          transition: "opacity 1.2s ease 1s",
        }}
      >
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-14 rounded border border-[#c8a84b] flex items-center justify-center"
            style={{
              background: "rgba(200,168,75,0.05)",
              transform: `rotate(${(i - 3) * 4}deg) translateY(${Math.abs(i - 3) * 4}px)`,
            }}
          >
            <span className="text-[#c8a84b] text-lg">♠</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) rotate(-8deg); }
          10%  { opacity: 0.18; }
          80%  { opacity: 0.10; }
          100% { opacity: 0; transform: translateY(-110vh) rotate(8deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}