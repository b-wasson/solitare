document.getElementById('start-button').addEventListener('click', function() {
    document.getElementById('startscreen').style.display = 'none';
    document.getElementById('gameboard').style.display = 'flex';

    const deck = new Deck();  
    const tableau = deal(deck);
    renderTableau(tableau);

});
