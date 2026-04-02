// ─── Suits & Ranks ───────────────────────────────────────────────────────────

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type Color = "red" | "black";

// ─── Card ────────────────────────────────────────────────────────────────────

export type Card = {
  id: string;       // unique id e.g. "hearts-1", "spades-13"
  suit: Suit;
  rank: Rank;
  color: Color;
  faceUp: boolean;
};

// ─── Pile Types ──────────────────────────────────────────────────────────────

// One of the 7 columns in the middle of the board
export type TableauPile = Card[];

// One of the 4 ace piles in the top right (one per suit)
export type FoundationPile = Card[];

// The face-down draw pile in the top left
export type StockPile = Card[];

// The face-up cards next to the stock after drawing
export type WastePile = Card[];

// ─── Game State ──────────────────────────────────────────────────────────────

export type GameState = {
  tableau: TableauPile[];       // array of 7 piles
  foundations: FoundationPile[]; // array of 4 piles (one per suit)
  stock: StockPile;
  waste: WastePile;
  score: number;
  moves: number;
  startTime: number;            // Date.now() when game started
  isWon: boolean;
};

// ─── Move Types ──────────────────────────────────────────────────────────────

export type PileLocation =
  | { area: "tableau";     index: number }  // which column (0–6)
  | { area: "foundation";  index: number }  // which foundation (0–3)
  | { area: "waste" }
  | { area: "stock" };

export type Move = {
  cards: Card[];          // the card(s) being moved (can be a stack)
  from: PileLocation;
  to: PileLocation;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Human-readable rank labels
export const RANK_LABELS: Record<Rank, string> = {
  1:  "A",
  2:  "2",
  3:  "3",
  4:  "4",
  5:  "5",
  6:  "6",
  7:  "7",
  8:  "8",
  9:  "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts:   "♥",
  diamonds: "♦",
  clubs:    "♣",
  spades:   "♠",
};

export function getColor(suit: Suit): Color {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}

export function getCardId(suit: Suit, rank: Rank): string {
  return `${suit}-${rank}`;
}
export default Card;