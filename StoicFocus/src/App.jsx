import { useState } from 'react'
import './App.css'
import Timer from './Timer.jsx'
import { stoicQuotes } from './quotes'
import PlayButton from './PlayButton.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
     <Timer />
    
    </main> 
  )
}

export default App;
