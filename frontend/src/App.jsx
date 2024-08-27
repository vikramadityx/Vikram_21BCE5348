import { Routes, Route } from 'react-router-dom'
import SearchOpponent from './pages/SearchOpponent'
import Game from './pages/Game'

function App() {
  return (
    <Routes>
        <Route path="/" element={<SearchOpponent/>} /> 
        <Route path="/game" element={<Game/>} /> 
    </Routes>
  )
}

export default App
