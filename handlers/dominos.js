const maxPlayers = 3;
let GAMES = {};

exports.joinGame = (payload, io) => {
    if (!GAMES[payload.room]){
        GAMES[payload.room] = { players: [], spectators: [] };
    }
    if (GAMES[payload.room].players.length < maxPlayers) {
        GAMES[payload.room].players.push(payload.user);
        io.emit('DOMINOS-JOINED-' + payload.room, 
        {news: payload.user + ' has joined the game.', players: GAMES[payload.room].players, spectators: GAMES[payload.room].spectators});
        
        if (GAMES[payload.room].players.length === maxPlayers) {
            board = [];
            hands = generateHands();
            let playerHands = {};
            playerHands[GAMES[payload.room].players[0]] = hands[0];
            playerHands[GAMES[payload.room].players[1]] = hands[1];
            playerHands[GAMES[payload.room].players[2]] = hands[2];
            io.emit('DOMINOS-START-GAME-' + payload.room, { board, nextPlayer: GAMES[payload.room].players[0], hands: playerHands});
        }
    } else {
        // players.pop();
        // this.joinGame(payload, io);
        GAMES[payload.room].spectators.push(payload.user);
        io.emit('DOMINOS-JOINED-SPECTATOR-' + payload.room, {news: payload.user + ' watches the game.', players: GAMES[payload.room].players, spectators: GAMES[payload.room].spectators});
        
    }
};

exports.play = (payload, io) => {
    let playerIndex = GAMES[payload.room].players.findIndex(p => p === payload.player);
    playerIndex = playerIndex + 1 < GAMES[payload.room].players.length ? playerIndex + 1 : 0;
    if (payload.hand.length === 0) {
        io.emit('DOMINOS-GAME-OVER-' + payload.room, { board: payload.board, winner: payload.player});
    } else {
        io.emit('DOMINOS-NEXT-PLAYER-' + payload.room, { board: payload.board, nextPlayer: GAMES[payload.room].players[playerIndex]});
    }
};

exports.disconnect = (payload, io) => {
    let playerIndex = GAMES[payload.room].players.findIndex(p => p === payload.player);
    GAMES[payload.room].players.splice(playerIndex, 1);
        io.emit('DOMINOS-JOINED-' + payload.room, 
        {news: payload.user + ' disconnected.', players: GAMES[payload.room].players, spectators: GAMES[payload.room].spectators});
};

generateHands = () => {
    let dominos = [];
    for(let i = 0; i < 7; i++) {
        for(let j = i; j < 7; j++) {
            dominos.push({left: i, right: j});
        }
    }
    dominos = shuffle(shuffle(shuffle(dominos)));
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