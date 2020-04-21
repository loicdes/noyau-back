let GAMES = {};
const GAME_STATUS = {
    NOT_STARTED: 0,
    PRELIM: 1,
    ASCENDING: 2,
    END: 3
};
const SIGN = ["coeur", "treffle", "pique", "carreau"];
const VALUES = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "valet", "reine", "roi"];
const QUESTIONS = [
    'Rouge ou noir ?',
    'Plus petit ou plus grand ?',
    'Intérieur ou extérieur ?',
    'Carreau, pique, coeur ou treffle ?'
];

exports.joinGame = (payload, io) => {
    try {    
    if (!GAMES[payload.room]){
        GAMES[payload.room] = { players: [], spectators: [], status: GAME_STATUS.NOT_STARTED };
    }
    if (GAMES[payload.room].status === GAME_STATUS.NOT_STARTED) {
        GAMES[payload.room].players.push(payload.user);
        io.emit('PYRAMIDE-JOINED-' + payload.room, 
        {news: payload.user + ' a rejoint la partie.', players: GAMES[payload.room].players});
    } else {
        // GAMES[payload.room].players.pop();
        // this.joinGame(payload, io);
         GAMES[payload.room].spectators.push(payload.user);
         io.emit('PYRAMIDE-JOINED-SPECTATOR-' + payload.room, {news: payload.user + ' observe le jeu.', players: GAMES[payload.room].players});
        
    }    
} catch (e) {}
};

exports.startGame = (payload, io) => {
    try {    
    GAMES[payload.room].status = GAME_STATUS.STARTED;
    let cards = [];
    SIGN.forEach( s=> VALUES.forEach( v=> cards.push({value: v, sign: s})));
    cards = shuffle(shuffle(shuffle(cards)));
    let hands = {};
    GAMES[payload.room].players.forEach( p=> {
        hands[p] = cards.splice(0, 4);
    });
    let board = [];
    for(let i = 0; i < payload.etages; i++){
        board.push(cards.splice(0, i + 1));
    }
    io.emit('PYRAMIDE-START-GAME-' + payload.room, { board, hands });
    io.emit('PYRAMIDE-PRELIM-' + payload.room, 
    { gameStep: GAME_STATUS.PRELIM, tour: 0, nextPlayer: GAMES[payload.room].players[0], question: QUESTIONS[0] });
    
} catch (e) {}
};

exports.play = (payload, io) => {
    try {    
    let playerIndex = GAMES[payload.room].players.findIndex(p => p === payload.player);
    playerIndex = playerIndex + 1 < GAMES[payload.room].players.length ? playerIndex + 1 : 0;
    if (playerIndex === 0) {
        payload.tour++;
    } 
    if (payload.tour < QUESTIONS.length) {
        io.emit('PYRAMIDE-PRELIM-' + payload.room, 
        { gameStep: GAME_STATUS.PRELIM, tour: payload.tour, nextPlayer: GAMES[payload.room].players[playerIndex], question: QUESTIONS[payload.tour] }); 
    } else {
        io.emit('PYRAMIDE-PRELIM-' + payload.room, 
        { gameStep: GAME_STATUS.ASCENDING, nextPlayer: GAMES[payload.room].players[playerIndex] }); 
    }    
} catch (e) {}
};

exports.showCard = (payload, io) => {
    try {    
    io.emit('PYRAMIDE-SHOW-' + payload.room, 
                { gameStep: GAME_STATUS.ASCENDING, news: `${payload.player} montre cette carte ${payload.msg} `, card: payload.card });
    
    } catch (e) {}
}
exports.reveal = (payload, io) => {
    try {    
    io.emit('PYRAMIDE-REVEAL-' + payload.room, 
                { cardToReveal: payload.card });    
            } catch (e) {}
}

exports.disconnect = (payload, io) => {
    try {    
    let playerIndex = GAMES[payload.room].players.findIndex(p => p === payload.player);
    GAMES[payload.room].players.splice(playerIndex, 1);
        io.emit('PYRAMIDE-JOINED-' + payload.room, 
        {news: payload.user + ' s\'est déconnecté.', players: GAMES[payload.room].players});    
    } catch (e) {}
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