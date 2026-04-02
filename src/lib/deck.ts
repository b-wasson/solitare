import {
    Card,
    GameState,
    Suit,
    Rank,
    SUITS,
    RANKS,
    getColor,
    getCardId,
  } from "../types/card";
  
  // ─── Create Deck ─────────────────────────────────────────────────────────────
  
  /**
   * Builds a full 52-card deck, all face down.
   * Cards are in a predictable order — suits × ranks.
   */
  export function createDeck(): Card[] {
    const deck: Card[] = [];
  
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id:     getCardId(suit, rank),
          suit,
          rank,
          color:  getColor(suit),
          faceUp: false,
        });
      }
    }
  
    return deck;
  }
  
  // ─── Shuffle ─────────────────────────────────────────────────────────────────
  
  /**
   * Fisher-Yates shuffle — returns a new array, does not mutate the input.
   */
  export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
  
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  
    return shuffled;
  }
  
  // ─── Deal ─────────────────────────────────────────────────────────────────────
  
  /**
   * Deals a shuffled deck into the classic Klondike layout:
   *
   *  Tableau column 0 → 1 card  (top card face up)
   *  Tableau column 1 → 2 cards (top card face up)
   *  ...
   *  Tableau column 6 → 7 cards (top card face up)
   *
   *  Remaining 24 cards → stock (all face down)
   */
  export function dealCards(deck: Card[]): Pick<GameState, "tableau" | "stock" | "waste" | "foundations"> {
    const cards = [...deck];
    const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  
    // Deal into tableau columns
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = cards.shift()!;
        // Only the top (last) card in each column starts face up
        card.faceUp = row === col;
        tableau[col].push(card);
      }
    }
  
    // Remaining cards go to the stock, all face down
    const stock = cards.map((c) => ({ ...c, faceUp: false }));
  
    return {
      tableau,
      foundations: [[], [], [], []], // one empty pile per suit
      stock,
      waste: [],
    };
  }
  
  // ─── New Game ────────────────────────────────────────────────────────────────
  
  /**
   * Creates a complete fresh GameState ready to play.
   * This is the single entry point your UI should call to start a game.
   */
  export function createNewGame(): GameState {
    const deck    = createDeck();
    const shuffled = shuffleDeck(deck);
    const piles   = dealCards(shuffled);
  
    return {
      ...piles,
      score:     0,
      moves:     0,
      startTime: Date.now(),
      isWon:     false,
    };
  }
  
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  
  /**
   * Returns the top card of a pile, or null if empty.
   */
  export function getTopCard(pile: Card[]): Card | null {
    return pile.length > 0 ? pile[pile.length - 1] : null;
  }
  
  /**
   * Flips the top card of a pile face up.
   * Returns a new pile array — does not mutate.
   */
  export function flipTopCard(pile: Card[]): Card[] {
    if (pile.length === 0) return pile;
    const flipped = [...pile];
    flipped[flipped.length - 1] = { ...flipped[flipped.length - 1], faceUp: true };
    return flipped;
  }