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
        ? [top, rankLineLeft, side]
        : [top, rankLineLeft, side, side, side, rankLineRight, bottom];

    const pre = document.createElement('pre');
    pre.classList.add('card');
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
    for(let i = 0; i < 1; i++) {
        const column = tableau[i];

        for(let j = 0; j < column.length; j++) {
            const card = column[j];
            const { rank, suit } = getCardDisplay(card);
            const cardElement = createCardElement(rank, suit);
            document.getElementById('tableau-' + i).appendChild(cardElement);
        }
    }
    
}    

function flipCard(card) {
    card.faceUp = !card.faceUp;
}

