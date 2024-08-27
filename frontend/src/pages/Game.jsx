import { useEffect, useState } from "react";
import { useSocket } from "../socketContext.jsx";
import { useLocation } from "react-router-dom";


const Game = () => {
  const [gameData, setGameData] = useState({
    board: Array(5)
      .fill()
      .map(() => Array(5).fill(null)), // 5x5 board initialization
    players: {
      A: {
        characters: [
          { type: "Pawn", position: { x: 0, y: 0 } },
          { type: "Pawn", position: { x: 0, y: 1 } },
          { type: "Pawn", position: { x: 0, y: 2 } },
          { type: "Hero1", position: { x: 0, y: 3 } },
          { type: "Hero2", position: { x: 0, y: 4 } },
        ],
      },
      B: {
        characters: [
          { type: "Pawn", position: { x: 4, y: 0 } },
          { type: "Pawn", position: { x: 4, y: 1 } },
          { type: "Pawn", position: { x: 4, y: 2 } },
          { type: "Hero1", position: { x: 4, y: 3 } },
          { type: "Hero2", position: { x: 4, y: 4 } },
        ],
      },
    },
    currentPlayer: "A",
    winner: null,
  });

  const location = useLocation();
  const passedState = location.state;

  const [selectedPosition, setSelectedPosition] = useState({x: 0, y: 0});
  const [selectedCharacter, setSelectedCharacter] = useState("");

const getCellLabel = (x, y) => {
    const PlayerA = gameData.players.A.characters;
    const PlayerB = gameData.players.B.characters;

    // Find if a character from Player A is at the given position
    const isThereA = PlayerA.findIndex((item) => item.position.x === x && item.position.y === y);

    if (isThereA !== -1) {
        return <span className="text-red-300">{PlayerA[isThereA].type}</span>;
    }

    // Find if a character from Player B is at the given position
    const isThereB = PlayerB.findIndex((item) => item.position.x === x && item.position.y === y);
    if (isThereB !== -1) {
        return <span className="text-blue-300">{PlayerB[isThereB].type}</span>;
    }

    // Return null or an appropriate value if no character is found at the position
    return null;
};



const handleCellClick = (x, y) => {
    setSelectedPosition({x,y})
  const currentPlayer = gameData.currentPlayer;
  const characters = gameData.players[currentPlayer].characters;
  const index = characters.findIndex((char) => char.position.x === x && char.position.y === y);

  if (index !== -1) {
    setSelectedCharacter(characters[index].type);
  } else {
    setSelectedCharacter(null); // Optionally clear selection if no character is found at the clicked cell
  }
};

const updatePosition = (direction) => {

    socket.emit('updatePosition', {direction, selectedCharacter, gameId: passedState.gameId})

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

    newX = Math.max(0, Math.min(gameData.board.length - 1, newX));
    newY = Math.max(0, Math.min(gameData.board[0].length - 1, newY));

    setSelectedPosition({ x: newX, y: newY }); // Update the selected position to the new one
};

const socket = useSocket();


  useEffect(() => {
    if(!socket) return;
    console.log("here");

    socket.on('stateUpdate', (data) => {
      console.log(data);
      setGameData({
        ...data,
        board: data.board, // Assuming board state is also sent
        currentPlayer: data.currentPlayer
      });
    })

    socket.emit('initializeGame', { gameId: Date.now() })

    return () => {
      console.log("Cleaning up socket events");
      socket.off('stateUpdate');
    };

  }, [socket])

  return (
    <div className="h-screen w-screen flex flex-col gap-2 items-center justify-center">
        {selectedPosition.x} {selectedPosition.y} {selectedCharacter}{socket && socket.id} {passedState.currentPlayer}
      <div className="grid grid-cols-5 gap-2">
        {gameData.board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div 
            onClick={() => handleCellClick(rowIndex, colIndex)}
              key={`${rowIndex}-${colIndex}`}
              className="w-[100px] h-[100px] rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-100 flex items-center justify-center"
            >
              {getCellLabel(rowIndex, colIndex)}
            </div>
          ))
        ))}
      </div>
      {
        (socket && (socket.id === passedState.currentPlayer)) && <h1>Your Turn</h1>
      }
      {(selectedCharacter === 'Pawn' || selectedCharacter==='Hero1') && <div className="flex flex-row gap-2">
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('L')}>L</button>
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('R')}>R</button>
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('U')}>U</button>
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('D')}>D</button>
      </div>}
      {selectedCharacter === 'Hero2'  && <div className="flex flex-row gap-2">
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('FL')}>FL</button>
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('FR')}>FR</button>
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('BL')}>BL</button>
        <button 
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100" onClick={()=>updatePosition('BR')}>BR</button>
      </div>}
    </div>
  );
};

export default Game;
