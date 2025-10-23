import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import SignIn from './pages/signin'
import DashBoard from './pages/dashboard'
import ThreadPage from './pages/ThreadPage'
function App() {


  return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element = {<SignIn />} />
        <Route path="/dashboard/:user_id" element = {<DashBoard />} />
        <Route path="/thread/:user_id/:threadId" element={<ThreadPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
