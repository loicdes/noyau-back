let players = [];
let spectators = [];
const maxPlayers = 3;


exports.joinGame = (payload, io) => {
    if (players.length < maxPlayers) {
        players.push(payload);
        io.emit('DOMINOS-JOINED', {news: payload + ' has joined the game.', players, spectators});
        if (players.length === maxPlayers) {
            board = [];
            hands = generateHands();
            let playerHands = {};
            playerHands[players[0]] = hands[0];
            playerHands[players[1]] = hands[1];
            playerHands[players[2]] = hands[2];
            io.emit('DOMINOS-START-GAME', { board, nextPlayer: players[0], hands: playerHands});
        }
    } else {
        // players.pop();
        // this.joinGame(payload, io);
        spectators.push(payload);
        io.emit('DOMINOS-JOINED-SPECTATOR', {news: payload + ' watches the game.', players, spectators});
        
    }
};

exports.play = (payload, io) => {
    let playerIndex = players.findIndex(p => p === payload.player);
    playerIndex = playerIndex + 1 < players.length ? playerIndex + 1 : 0;
    io.emit('DOMINOS-NEXT-PLAYER', { board: payload.board, nextPlayer: players[playerIndex]});
};

generateHands = () => {
    let dominos = [];
    for(let i = 0; i < 7; i++) {
        for(let j = 0; j < 7; j++) {
            dominos.push({left: i, right: j});
        }
    }
    dominos = shuffle(dominos);
    return [
        dominos.slice(0, 7),
        dominos.slice(7, 14),
        dominos.slice(14, 21)
    ]
};
shuffle = (arra1) => {
    var ctr = arra1.length, temp, index;

// While there are elements in the array
    while (ctr > 0) {
// Pick a random index
        index = Math.floor(Math.random() * ctr);
// Decrease ctr by 1
        ctr--;
// And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}