import { useState } from 'react'
import HomePage from './pages/HomePage'
import SigninPage from './pages/SigninPage'
import SignupPage from './pages/SignupPage'
import {  Routes , Route} from 'react-router-dom'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
    </Routes>
    </div>
  )
}

export default App
