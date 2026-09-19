import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FarmProvider } from './context/FarmContext'
import Landing from './pages/Landing'
import FarmSelection from './pages/FarmSelection'
import Dashboard from './pages/Dashboard'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <FarmProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/select" element={<FarmSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </FarmProvider>
    </BrowserRouter>
  )
}

export default App
