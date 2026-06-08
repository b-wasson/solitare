class Deck {
    constructor() {
        this.build();
    }

    build() { 
        this.cards = [];
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // 11=J, 12=Q, 13=K
        for (let suit of suits) {
            for (let value of values) {
                this.cards.push({ suit, value, faceUp: false});
            }
        }
    }
}