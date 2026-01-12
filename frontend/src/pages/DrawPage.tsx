import { useState, useEffect } from 'react'
import { Trophy, Sparkles, Download, Users, Loader } from 'lucide-react'
import {
  getEligibleParticipants,
  conductDraw,
  exportEligibleToExcel,
  exportEligibleToPDF,
  Participant,
  Winner,
} from '../api'

export default function DrawPage() {
  const [eligibleCount, setEligibleCount] = useState(0)
  const [numberOfWinners, setNumberOfWinners] = useState(1)
  const [prizeRank, setPrizeRank] = useState(10)
  const [prizeName, setPrizeName] = useState('')
  const [drawing, setDrawing] = useState(false)
  const [winners, setWinners] = useState<Winner[]>([])
  const [showAnimation, setShowAnimation] = useState(false)
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0)

  // BroadcastChannel for cross-tab communication
  const drawChannel = new BroadcastChannel('lucky-draw-channel')

  useEffect(() => {
    loadEligibleCount()
  }, [])

  const loadEligibleCount = async () => {
    try {
      const data = await getEligibleParticipants()
      setEligibleCount(data.total)
    } catch (error) {
      console.error('Failed to load eligible count:', error)
    }
  }

  const handleDraw = async () => {
    if (numberOfWinners < 1 || numberOfWinners > eligibleCount) {
      alert('ຈໍານວນຜູ່ໂຊກດີບໍ່ຖືກຕ້ອງ')
      return
    }

    setDrawing(true)
    setShowAnimation(true)
    setCurrentAnimationIndex(0)
    setWinners([])

    try {
      // Simulate drawing animation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get all eligible participants for rolling animation
      const eligibleData = await getEligibleParticipants()
      const allParticipants = eligibleData.eligible.map((p: Participant) => p.employee_name)

      const result = await conductDraw(numberOfWinners, prizeRank, prizeName)
      setWinners(result.winners)

      // Send result to display page with all participants
      drawChannel.postMessage({
        type: 'DRAW_RESULT',
        winners: result.winners,
        prizeName: prizeName || `ລາງວັນລໍາດັບທີ່ ${prizeRank}`,
        allParticipants: allParticipants,
      })

      // Show winners one by one
      for (let i = 0; i < result.winners.length; i++) {
        setCurrentAnimationIndex(i)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      await loadEligibleCount()
    } catch (error: any) {
      alert(error.response?.data?.error || '່ເກິດຂໍ້ຜິດພາດການຈັບລາງວັນ')
      setShowAnimation(false)
    } finally {
      setDrawing(false)
    }
  }

  const resetDraw = () => {
    setWinners([])
    setShowAnimation(false)
    setCurrentAnimationIndex(0)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!showAnimation ? (
        <>
          {/* Configuration Card */}
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
              <Trophy className="text-primary-600" size={36} />
              <span>ຈັບລາງວັນ Lucky Draw</span>
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Users className="text-blue-600" size={20} />
                <span className="text-blue-900 font-medium">
                  ຜູ້ມີສິດລຸ່ນລາງວັນໃນນີ້: {eligibleCount.toLocaleString()} ຄົນ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລໍາດັບລາງວັນ (Rank)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={prizeRank}
                  onChange={(e) => setPrizeRank(parseInt(e.target.value) || 1)}
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ຮອງຮັບການຈັບອັດຕະໂນມັດສໍາລັບລາງວັນລໍາດັບທີ່8 7-10
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຊື່ລາງວັນ (ບໍ່ບັງຄັບ)  
                </label>
                <input
                  type="text"
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  placeholder="່ຕົວຢ່າງ: ທຶນການສຶກສາ, ໂທລະສັບ, ບັດນ້ຳມັນ etc."
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຈໍານວນຜູ້ໂຊກດີ
                </label>
                <input
                  type="number"
                  min="1"
                  max={eligibleCount}
                  value={numberOfWinners}
                  onChange={(e) => setNumberOfWinners(parseInt(e.target.value) || 1)}
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ສູງສຸດ {eligibleCount} ຄົນ
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDraw}
                disabled={drawing || eligibleCount === 0}
                className="btn-primary px-8 py-3 text-lg flex items-center space-x-2"
              >
                <Sparkles size={20} />
                <span>ສຸ່ມຈັບລາງວັນ</span>
              </button>
            </div>
          </div>

          {/* Export Card */}
          <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <h3 className="text-xl font-bold mb-4">ສົ່ງອອກລາຍຊື່ຜູ້ທີ່ຍັງບໍ່ໄດ້ຮັບລາງວັນ</h3>
            <p className="mb-4">ສໍາລັບການຈັບສະຼາກດ່ວຍມື (ລາງວັນລໍາດັບທີ່ 1-6)</p>
            <div className="flex space-x-4">
              <button
                onClick={exportEligibleToExcel}
                className="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
              >
                <Download size={18} />
                <span>ດາວໂຫຼດ Excel</span>
              </button>
              <button
                onClick={exportEligibleToPDF}
                className="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
              >
                <Download size={18} />
                <span>ດາວໂຫຼດ PDF</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Drawing Animation */}
          <div className="card min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            {drawing ? (
              <div className="text-center">
                <Loader className="animate-spin mx-auto mb-4" size={64} />
                <h2 className="text-4xl font-bold mb-2">ກໍາລັງຈັບລາງວັນ...</h2>
                <p className="text-xl">ກະລຸນາລໍຖ້າ</p>
              </div>
            ) : (
              <div className="text-center w-full max-w-4xl">
                <div className="mb-8">
                  <Sparkles className="mx-auto mb-4 animate-bounce" size={64} />
                  <h2 className="text-3xl font-bold mb-2">
                    {prizeName || `ລາງວັນລໍາດັບທີ່ ${prizeRank}`}
                  </h2>
                  <p className="text-xl">ຜູໂຊກດີ {winners.length} ຄົນ</p>
                </div>

                <div className="space-y-4">
                  {winners.slice(0, currentAnimationIndex + 1).map((winner, index) => (
                    <div
                      key={index}
                      className="bg-white text-gray-900 rounded-lg p-6 shadow-2xl transform animate-bounce-slow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-2xl font-bold text-primary-600">
                            {winner.employee_name}
                          </p>
                          <p className="text-gray-600">ລະຫັດ: {winner.employee_id}</p>
                          <p className="text-gray-600">ບໍລິສັດ: {winner.company}</p>
                        </div>
                        <Trophy className="text-yellow-500" size={48} />
                      </div>
                    </div>
                  ))}
                </div>

                {currentAnimationIndex === winners.length - 1 && (
                  <div className="mt-8">
                    <button
                      onClick={resetDraw}
                      className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                    >
                      ຈັບລາງວັນຕໍ່
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
