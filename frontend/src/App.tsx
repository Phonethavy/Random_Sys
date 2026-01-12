import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Home, Upload, Trophy, History, Monitor } from 'lucide-react'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import DrawPage from './pages/DrawPage'
import HistoryPage from './pages/HistoryPage'
import DisplayPage from './pages/DisplayPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Trophy className="text-primary-600" size={32} />
                <h1 className="text-2xl font-bold text-primary-600">ລະບົບຈັບລາງວັນ Lucky Draw</h1>
              </div>
              <div className="flex space-x-6">
                <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <Home size={20} />
                  <span>ໜ້າຫຼັກ</span>
                </Link>
                <Link to="/upload" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <Upload size={20} />
                  <span>ອັບໂຫຼດລາຍຊື່</span>
                </Link>
                <Link to="/draw" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <Trophy size={20} />
                  <span>ຈັບລາງວັນ</span>
                </Link>
                <Link to="/history" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <History size={20} />
                  <span>ປະວັດ</span>
                </Link>
                <Link to="/display" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <Monitor size={20} />
                  <span>ຈໍສະແດງຜົນ</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/draw" element={<DrawPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/display" element={<DisplayPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
