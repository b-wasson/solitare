document.getElementById('start-button').addEventListener('click', function() {
    document.getElementById('startscreen').style.display = 'none';
    document.getElementById('gameboard').style.display = 'flex';

    const deck = new Deck();  
    const tableau = deal(deck);
    renderTableau(tableau);

    let cursorIndex = 0;
    const cards = document.querySelectorAll('.card');
    

    cards[cursorIndex].classList.add('card-cursor');

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            cards[cursorIndex].classList.remove('card-cursor');
            cursorIndex = (cursorIndex + 1) % cards.length;
            cards[cursorIndex].classList.add('card-cursor');
        }
    });

});
