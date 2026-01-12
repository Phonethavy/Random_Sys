import { useEffect, useState } from 'react'
import { Users, Trophy, Gift, TrendingUp } from 'lucide-react'
import { getParticipants, getEligibleParticipants, getWinners } from '../api'

export default function HomePage() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    eligibleParticipants: 0,
    totalWinners: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [participantsData, eligibleData, winnersData] = await Promise.all([
        getParticipants(),
        getEligibleParticipants(),
        getWinners(),
      ])
      setStats({
        totalParticipants: participantsData.total,
        eligibleParticipants: eligibleData.total,
        totalWinners: winnersData.total,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          ຍິນດີຕ້ອນຮັບສູ່ລະບົບຈັບລາງວັນ Lucky Draw
        </h2>
        <p className="text-lg text-gray-600">
          ລະບົບຈັບລາງວັນອັດຕະໂນມັດສໍາລັບງານອີເວັ້ນ ຮອງຮັບການສະແດງຜົນເທິງໜ້າຈໍຂະໜາດໃຫຍ່
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">ຜູ້ເຂົ້າຮ່ວມທັງໝົດ</p>
              <p className="text-4xl font-bold mt-2">
                {loading ? '...' : stats.totalParticipants.toLocaleString()}
              </p>
              <p className="text-blue-100 text-sm mt-1">ຄົນ</p>
            </div>
            <Users size={48} className="text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">ຜູ້ມີສິດລຸ້ນລາງວັນ</p>
              <p className="text-4xl font-bold mt-2">
                {loading ? '...' : stats.eligibleParticipants.toLocaleString()}
              </p>
              <p className="text-green-100 text-sm mt-1">ຄົນ</p>
            </div>
            <Gift size={48} className="text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">ຜູ້ໄດ້ຮັບລາງວັນແລ້ວ</p>
              <p className="text-4xl font-bold mt-2">
                {loading ? '...' : stats.totalWinners.toLocaleString()}
              </p>
              <p className="text-yellow-100 text-sm mt-1">ຄົນ</p>
            </div>
            <Trophy size={48} className="text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">ຄຸນສົມບັດຕົ້ນຕໍ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary-600" size={24} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">ອັບໂຫຼດລາຍຊື່ຈາກໄຟລ໌ Excel</h4>
              <p className="text-gray-600 text-sm">
                ຮອງຮັບການອັບໂຫຼດລາຍຊື່ຜູ້ເຂົ້າຮ່ວມພ້ອມກວດສອບຄວາມຄົບຖ້ວນຂອງຂໍ້ມູນ
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-600" size={24} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">ຈັບລາງວັນອັດຕະໂນມັດ</h4>
              <p className="text-gray-600 text-sm">
                ຮອງຮັບລາງວັນລໍາດັບທີ່ 7-10 ພ້ອມກໍານົດຈໍານວນຜູ້ໂຊກດີລ່ວງໜ້າ
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Gift className="text-primary-600" size={24} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">ສົ່ງອອກລາຍຊື່ຜູ້ທີ່ບໍ່ໄດ້ຮັບລາງວັນ</h4>
              <p className="text-gray-600 text-sm">
                ສົ່ງອອກເປັນ Excel ຫຼື PDF ພ້ອມຮູບແບບທີ່ສວຍງາມ ແລະ ພ້ອມພິມ
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">ສະແດງຜົນເທິງໜ້າຈໍຂະໜາດໃຫຍ່</h4>
              <p className="text-gray-600 text-sm">
                ຮອງຮັບການສະແດງຜົນແບບເຕັມຈໍສໍາລັບ Projector ແລະ LED Screen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
        <h3 className="text-2xl font-bold mb-4">ເລີ່ມຕົ້ນໃຊ້ງານ</h3>
        <p className="mb-6">ກະລຸນາດໍາເນີນການຕາມຂັ້ນຕອນຕໍ່ໄປນີ້:</p>
        <ol className="space-y-3">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold">
              1
            </span>
            <span>ອັບໂຫຼດລາຍຊື່ຜູ້ເຂົ້າຮ່ວມຈາກໄຟລ໌ Excel (ເມນູ "ອັບໂຫຼດລາຍຊື່")</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold">
              2
            </span>
            <span>ໄປທີ່ໜ້າ "ຈັບລາງວັນ" ເພື່ອເລີ່ມການຈັບລາງວັນ</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold">
              3
            </span>
            <span>ເປີດໜ້າ "ຈໍສະແດງຜົນ" ເທິງໜ້າຈໍຂະໜາດໃຫຍ່ເພື່ອສະແດງຜົນຜູ້ໂຊກດີ</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
