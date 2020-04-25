const maxPlayers = 3;
let GAMES = {};

exports.joinGame = (payload, io) => {
    try {    
    if (!GAMES[payload.room]){
        GAMES[payload.room] = { players: [], boude: 0};
    }
    if (GAMES[payload.room].players.includes(payload.user)) { // refresh page
        io.emit('DOMINOS-JOINED-' + payload.room, 
        {news: payload.user + ' a rejoint la partie.', players: GAMES[payload.room].players, board: GAMES[payload.room].board,
        nextPlayer: GAMES[payload.room].nextPlayer });
    }
    else if (GAMES[payload.room].players.length < maxPlayers) {
        GAMES[payload.room].players.push(payload.user);
        io.emit('DOMINOS-JOINED-' + payload.room, 
        {news: payload.user + ' a rejoint la partie.', players: GAMES[payload.room].players });
        
        if (GAMES[payload.room].players.length === maxPlayers) {
            startGame(payload, io);
        }
    } else {
        // GAMES[payload.room].players.pop();
        // this.joinGame(payload, io);
         io.emit('DOMINOS-JOINED-SPECTATOR-' + payload.room, {news: payload.user + ' observe le jeu.', players: GAMES[payload.room].players});
        
    }    
} catch (e) {}
};

startGame = (payload, io) => {
    try {
        GAMES[payload.room].board = [];
        GAMES[payload.room].nextPlayer = GAMES[payload.room].players[0];
        hands = generateHands();
        let playerHands = {};
        playerHands[GAMES[payload.room].players[0]] = hands[0];
        playerHands[GAMES[payload.room].players[1]] = hands[1];
        playerHands[GAMES[payload.room].players[2]] = hands[2];
        io.emit('DOMINOS-START-GAME-' + payload.room, { board: [], nextPlayer: GAMES[payload.room].players[0], hands: playerHands});
    } catch(e) {}
};

exports.play = (payload, io) => {
    try {
    GAMES[payload.room].boude = payload.boude ? GAMES[payload.room].boude + 1 : 0;
    if (GAMES[payload.room].boude === maxPlayers) {
        GAMES[payload.room].boude = 0;
        io.emit('DOMINOS-JOINED-' + payload.room, 
        {news: 'Tous les joueurs sont boudés, une partie a été relancée', boude: true, players: GAMES[payload.room].players });
        startGame(payload, io);
    } else {
        let playerIndex = GAMES[payload.room].players.findIndex(p => p === payload.player);
        playerIndex = playerIndex + 1 < GAMES[payload.room].players.length ? playerIndex + 1 : 0;
        GAMES[payload.room].nextPlayer = GAMES[payload.room].players[playerIndex];
        GAMES[payload.room].board = payload.board;
        if (payload.hand.length === 0) {
            io.emit('DOMINOS-GAME-OVER-' + payload.room, { board: payload.board, winner: payload.player});
            startGame(payload, io);
        } else {
            io.emit('DOMINOS-NEXT-PLAYER-' + payload.room, { board: payload.board, nextPlayer: GAMES[payload.room].players[playerIndex]});
        }   
    }
} catch (e) {}
};

exports.disconnect = (payload, io) => {
    try {    
        let playerIndex = GAMES[payload.room].players.findIndex(p => p === payload.player);
        GAMES[payload.room].players.splice(playerIndex, 1);
            io.emit('DOMINOS-JOINED-' + payload.room, 
            {news: payload.user + ' s\'est déconnecté.', players: GAMES[payload.room].players});
    
    } catch (e) {}
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