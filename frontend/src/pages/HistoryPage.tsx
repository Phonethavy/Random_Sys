import { useEffect, useState } from 'react'
import { Search, Download, Trophy, Calendar } from 'lucide-react'
import { getDrawHistory, exportWinnersToExcel, Winner } from '../api'

export default function HistoryPage() {
  const [history, setHistory] = useState<Winner[]>([])
  const [filteredHistory, setFilteredHistory] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRank, setSelectedRank] = useState<number | 'all'>('all')

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterHistory()
  }, [searchTerm, selectedRank, history])

  const loadHistory = async () => {
    try {
      const data = await getDrawHistory()
      setHistory(data.history)
      setFilteredHistory(data.history)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = [...history]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (w) =>
          w.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by rank
    if (selectedRank !== 'all') {
      filtered = filtered.filter((w) => w.prize_rank === selectedRank)
    }

    setFilteredHistory(filtered)
  }

  const uniqueRanks = Array.from(new Set(history.map((w) => w.prize_rank))).sort((a, b) => b - a)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
          <Trophy className="text-primary-600" size={36} />
          <span>ປະວັດການຈັບລາງວັນ</span>
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">ລາງວັນທັງໝົດ</p>
            <p className="text-3xl font-bold">{history.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">ຜູ້ໂຊກດີທັງໝົດ</p>
            <p className="text-3xl font-bold">{new Set(history.map((w) => w.employee_id)).size}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">ລໍາດັບລາງວັນ</p>
            <p className="text-3xl font-bold">{uniqueRanks.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ຄົ່ນຫາຊື່, ລະຫັດພະນັກງານ, ຫຼືບໍລິສັດ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="input"
          >
            <option value="all">ທຸກລໍາດັບລາງວັນ</option>
            {uniqueRanks.map((rank) => (
              <option key={rank} value={rank}>
                ລໍາດັບທີ່ {rank}
              </option>
            ))}
          </select>
          <button
            onClick={exportWinnersToExcel}
            className="btn-primary flex items-center space-x-2"
          >
            <Download size={18} />
            <span>ສົ່ງອອກ Excel</span>
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">ກໍາລັງໂຫຼດ...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500">ບໍ່ພົບຂໍ້ມູນ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ລໍາດັບລາງວັນ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ຊື່ລາງວັນ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ຊື່ພະນັກງານ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ລະຫັດພະນັກງານ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ບໍລິສັດ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ວັນທີ່</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((winner, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
                        {winner.prize_rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{winner.prize_name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{winner.employee_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{winner.employee_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{winner.company}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{new Date(winner.draw_timestamp).toLocaleString('th-TH')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredHistory.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            ສະແດງ {filteredHistory.length} ຈາກທັງໝົດ {history.length} ລາຍການ
          </div>
        )}
      </div>
    </div>
  )
}
