import { useEffect , useState} from 'react';
import {useNavigate} from 'react-router-dom'
import { useSocket } from '../socketContext.jsx';

const SearchOpponent = () => {

  const navigate = useNavigate();

  const [status, setStatus] = useState('Click to find an opponent');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");


  const socket = useSocket();

  useEffect(() => {

    if(!socket) return;

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('searchingForOpponent', (message) => {
        setStatus(message);
        setLoading(true);
    });

    socket.on('gameStart', (data) => {
      console.log(data);
        setLoading(false);
        setStatus(`Opponent found! Game starting with opponent ID: ${data.opponentName}`);
        initializeGame(data.currentPlayer, data.gameId);
    });

    return () => {
        socket.off('connect');
        socket.off('searchingForOpponent');
        socket.off('gameStart');
        socket.disconnect();
    };
}, [socket]);


  const handleFindOpponent = () => {
      setStatus('Waiting for server...');
      socket.emit('findOpponent', {name : name});
  };

  const initializeGame = (currentPlayer, gameId) => {
      // Placeholder for game initialization logic
      console.log(`Starting game with opponent ${currentPlayer}`);
      navigate("/game", {state: {currentPlayer: currentPlayer, gameId: gameId}})
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2.5">
      <div className="w-[500px]">
        <div className="flex justify-between">
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Name
          </label>
          <span id="email-optional" className="text-sm leading-6 text-red-500">
            Required
          </span>
        </div>
        <div className="mt-2">
          <input
            onChange={(e) => setName(e.target.value)}
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            aria-describedby="email-optional"
            className="block px-5 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <button
  onClick={handleFindOpponent}
        type="button"
        disabled={loading}
        className="w-[500px] rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
      >
        Search Opponent
      </button>
      {status}
    </div>
  );
};

export default SearchOpponent;
