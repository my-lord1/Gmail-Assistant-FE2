import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import SignIn from './pages/signin'

function App() {


  return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element = {<SignIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
