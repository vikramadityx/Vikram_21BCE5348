class Game {
    constructor(currentPlayer, player1, player2) {
        this.board = Array(5)
            .fill()
            .map(() => Array(5).fill(null));
        this.players = {
            [player1]: {
                characters: [
                    { type: "Pawn", position: { x: 0, y: 0 } },
                    { type: "Pawn", position: { x: 0, y: 1 } },
                    { type: "Pawn", position: { x: 0, y: 2 } },
                    { type: "Hero1", position: { x: 0, y: 3 } },
                    { type: "Hero2", position: { x: 0, y: 4 } },
                ],
            },
            [player2]: {
                characters: [
                    { type: "Pawn", position: { x: 4, y: 0 } },
                    { type: "Pawn", position: { x: 4, y: 1 } },
                    { type: "Pawn", position: { x: 4, y: 2 } },
                    { type: "Hero1", position: { x: 4, y: 3 } },
                    { type: "Hero2", position: { x: 4, y: 4 } },
                ],
            },
        };
        this.currentPlayer = currentPlayer;
        this.winner = null;
    }

    initializeBoard() {
        for (const playerKey in this.players) {
            const player = this.players[playerKey];
            player.characters.forEach(char => {
                const { x, y } = char.position;
                this.board[x][y] = { ...char, owner: playerKey };
            });
        }
    }

    updatePosition(direction, selectedCharacter){

        if (!selectedPosition) return;
        console.log(selectedCharacter);
        const { x, y } = selectedPosition;
    
        let newX = x;
        let newY = y;
      
        switch (selectedCharacter) {
          case 'Pawn':
            switch (direction) {
              case 'L': newY = y - 1; break;
              case 'R': newY = y + 1; break;
              case 'U': newX = x - 1; break;
              case 'D': newX = x + 1; break;
            }
            break;
          case 'Hero1':
            switch (direction) {
              case 'L': newY = y - 2; break;
              case 'R': newY = y + 2; break;
              case 'U': newX = x - 2; break;
              case 'D': newX = x + 2; break;
            }
            break;
          case 'Hero2':
            switch (direction) {
              case 'FL': newX = x - 2; newY = y - 2; break;
              case 'FR': newX = x - 2; newY = y + 2; break;
              case 'BL': newX = x + 2; newY = y - 2; break;
              case 'BR': newX = x + 2; newY = y + 2; break;
            }
            break;
        }
    
        newX = Math.max(0, Math.min(this.board.length - 1, newX));
        newY = Math.max(0, Math.min(this.board[0].length - 1, newY));
    
        console.log(newX, newY);
        // First, determine which player and character this is
        const currentPlayer = this.currentPlayer;
        const characters = this.players[currentPlayer].characters;
        const charIndex = characters.findIndex(char => char.position.x === x && char.position.y === y);
      
        if (charIndex === -1) {
          console.error("Selected position has no character.");
          return;
        }
      
        // Update the character's position
        const updatedCharacters = [...characters];
        updatedCharacters[charIndex] = {
          ...updatedCharacters[charIndex],
          position: { x: newX, y: newY }
        };
    
        console.log(updatedCharacters);

        this.players = {
            ...this.players,
            [currentPlayer]: {
              ...this.players[currentPlayer],
              characters: updatedCharacters
            }
          }
    }

    moveCharacter(playerId, characterIndex, newX, newY) {
        if (playerId !== this.currentPlayer || this.winner) {
            return false;
        }

        const character = this.players[playerId].characters[characterIndex];
        const { x, y } = character.position;

        if (this.isValidMove(x, y, newX, newY, character.type)) {
            this.board[x][y] = null;
            this.board[newX][newY] = { ...character, position: { x: newX, y: newY } };
            character.position = { x: newX, y: newY };
            this.switchPlayer();
            this.checkWinCondition();
            return true;
        }
        return false;
    }

    isValidMove(x, y, newX, newY, type) {
        const dx = Math.abs(newX - x);
        const dy = Math.abs(newY - y);

        switch (type) {
            case 'Pawn':
                return dx + dy === 1;
            case 'Hero1':
                return (dx === 2 && dy === 0) || (dy === 2 && dx === 0);
            case 'Hero2':
                return dx === 2 && dy === 2;
            default:
                return false;
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'A' ? 'B' : 'A';
    }

    checkWinCondition() {
        const players = Object.keys(this.players);
        players.forEach(playerKey => {
            if (!this.players[playerKey].characters.some(char => this.board[char.position.x][char.position.y])) {
                this.winner = this.currentPlayer;
            }
        });
    }

    resetGame() {
        this.board = Array(5).fill().map(() => Array(5).fill(null));
        this.currentPlayer = "A";
        this.winner = null;
        this.initializeBoard();
    }
}

module.exports = {Game}