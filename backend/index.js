const express = require('express')
const http = require('http')
const path = require('path')
const {Server} = require("socket.io")
const {Game} = require("./Game")


const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

let playersWaiting = [];

const games = {};

io.on('connection', (socket) => {
    // console.log('A user connected: ' + socket.id);

    socket.on('findOpponent', ({name}) => {
        console.log('User looking for opponent: ' + socket.id);
        playersWaiting.push({socket:socket, name: name});
        socket.emit('searchingForOpponent', 'Searching for an opponent...');
        checkPairPlayers();
    });

    socket.on('initializeGame', (id) => {
        // games[id] = new Game('A');
        console.log(games[id]);
        console.log("initializeGame");
        socket.emit('stateUpdate', games[id]);
    })

    socket.on('updatePosition', ({direction, selectedCharacter, gameId}) => {
        console.log("updatePosition");
        let game = games[gameId];
        game.updatePosition(direction, selectedCharacter)
        console.log(game);
        socket.emit('stateUpdate', games[id]);
    })

    socket.on('disconnect', () => {
        // console.log('User disconnected: ' + socket.id);
        const index = playersWaiting.indexOf(socket);
        if (index !== -1) {
            playersWaiting.splice(index, 1);
        }
    });
});

function checkPairPlayers() {
    console.log("Pairing is triggered");
    if (playersWaiting.length >= 2) {
        // Randomly choose who starts
        const firstIndex = Math.floor(Math.random() * playersWaiting.length);
        const secondIndex = (firstIndex + 1) % playersWaiting.length;

        const player1 = playersWaiting[firstIndex];
        const player2 = playersWaiting[secondIndex];

        // Remove players from the waiting list
        playersWaiting.splice(firstIndex, 1);
        secondIndex > firstIndex ? playersWaiting.splice(secondIndex - 1, 1) : playersWaiting.splice(secondIndex, 1);

        console.log(`Pairing players ${player1.socket.id} and ${player2.socket.id}`);

        // Initialize the game with one of the players starting
        const gameId = `game-${Date.now()}`;
        const startingPlayer = player1;
        games[gameId] = new Game(startingPlayer.socket.id, player1.socket.id, player2.socket.id);

        // Notify both players that the game is starting
        player1.socket.emit('gameStart', {
            opponentName: player2.name,
            opponentId: player2.socket.id,
            playerId: player1.socket.id,
            currentPlayer: startingPlayer.socket.id,
            gameId: gameId
        });
        player2.socket.emit('gameStart', {
            opponentName: player1.name,
            opponentId: player1.socket.id,
            playerId: player2.socket.id,
            currentPlayer: startingPlayer.socket.id,
            gameId: gameId
        });

        console.log(`Game ${gameId} started with current player: ${startingPlayer.socket.id}`);
    }
}
app.use(express.static(path.resolve("./public")))

app.get('/', (req, res) => {
    return res.sendFile("/public/index.html")
})

server.listen(4000, () => {
    console.log("Server started at port 4000");
})