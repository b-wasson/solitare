function deal(deck) { 
    let tableau = [
        [deck.cards.pop()],
        [deck.cards.pop(), deck.cards.pop()],
        [deck.cards.pop(), deck.cards.pop(), deck.cards.pop()],
        [deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop()],
        [deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop()],
        [deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop()],
        [deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop(), deck.cards.pop()]
    ];

    return tableau;
}

function draw(deck) { 
    if(deck.cards.length < 3) {
        deck.cards = waste.concat(deck.cards);
        waste = [];
    }
    let waste = [deck.cards.pop(), deck.cards.pop(), deck.cards.pop()]; // Draw 3 cards to waste
    return waste;
}

function createBackCardElement() {
    const top =   "┌─────────┐";
    const bottom = "└─────────┘";
    const back = "│░░░░░░░░░│";
    
    const pre = document.createElement('pre');
    pre.classList.add('card');
    pre.textContent = [top, back, back, back, back, back, bottom].join('\n');
    return pre;

}

function createCardElement(rank, suit, isHalf = false) {
    const top =    "┌─────────┐";
    const bottom = "└─────────┘";
    const side =   "│         │";
    
    let rankLineLeft, rankLineRight;
    if (rank === '10') {
        rankLineLeft =  `│${rank}${suit}      │`;
        rankLineRight = `│      ${suit}${rank}│`;
    } else {
        rankLineLeft =  `│${rank}${suit}       │`;
        rankLineRight = `│       ${suit}${rank}│`;
    }

    const lines = isHalf
        ? [top, rankLineLeft]
        : [top, rankLineLeft, side, side, side, rankLineRight, bottom];

    const pre = document.createElement('pre');
    const isRed = suit === '♥' || suit === '♦';
    pre.classList.add('card');
    pre.classList.add(isRed ? 'card-red' : 'card-black');
    pre.textContent = lines.join('\n');
    return pre;
}

function getCardDisplay(card) {
    const rankNames = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    const suitSymbols = { Hearts: '♥', Diamonds: '♦', Clubs: '♣', Spades: '♠' };
    const rank = rankNames[card.value] || String(card.value);
    const suit = suitSymbols[card.suit];
    return { rank, suit };
}

function renderTableau(tableau) {
    for(let i = 0; i < tableau.length; i++) {
        const column = tableau[i];

        for(let j = 0; j < column.length; j++) {
            const card = column[j];
            const isHalf = (j !== column.length - 1); // Only the last card is fully visible
            const { rank, suit } = getCardDisplay(card);
            const cardElement = createCardElement(rank, suit, isHalf);
            document.getElementById('tableau-' + i).appendChild(cardElement);
        }
    }
}    

function renderDrawingDeck(deck) {



}

function flipCard(card) {
    card.faceUp = !card.faceUp;
}

