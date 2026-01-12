import { useEffect, useState } from 'react'
import { Trophy, Sparkles, Star, Zap, Users } from 'lucide-react'
import { Winner } from '../api'
import { getEligibleParticipants, Participant, clearAllWinners } from '../api'

// Confetti component
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10%',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF1493', '#7B68EE'][Math.floor(Math.random() * 5)],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Sparkle component
const SparkleEffect = ({ count = 20 }: { count?: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <Star
          key={i}
          className="absolute animate-sparkle text-yellow-300"
          size={Math.random() * 20 + 10}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function DisplayPage() {
  const [currentWinners, setCurrentWinners] = useState<Winner[]>([])
  const [displayMessage, setDisplayMessage] = useState('ກະລຸນາຈັບລາງວັນ...')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [rollingNames, setRollingNames] = useState<Participant[]>([])
  const [showParticipantsList, setShowParticipantsList] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [drawChannel] = useState(() => new BroadcastChannel('lucky-draw-channel'))

  const loadParticipants = async () => {
    try {
      const data = await getEligibleParticipants()
      setParticipants(data.eligible)
    } catch (error) {
      console.error('Failed to load participants:', error)
    }
  }

  const handleClearAllWinners = async () => {
    if (!confirm('ທ່ານຕ້ອງການລຶບຂໍ້ມູນຜູ້ຊະນະທັງໝົດບໍ່?\nການດໍາເນີນການນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້')) {
      return
    }

    try {
      await clearAllWinners()
      setShowPopup(false)
      setCurrentWinners([])
      setDisplayMessage('ກະລຸນາຮໍການຈັບລາງວັນ...')
      await loadParticipants()
      alert('ລຶບຂໍ້ມູນຜູ້ຊະນະທັງໝົດຮຽບຮ້ອຍແລ້ວ')
    } catch (error) {
      console.error('Failed to clear winners:', error)
      alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ')
    }
  }

  useEffect(() => {
    loadParticipants()
  }, [])

  useEffect(() => {
    // Listen for messages via BroadcastChannel
    const drawChannel = new BroadcastChannel('lucky-draw-channel')
    
    const handleMessage = async (event: MessageEvent) => {
      console.log('Received message:', event.data)
      if (event.data.type === 'DRAW_RESULT') {
        // Get participants for rolling animation
        let freshParticipants: Participant[] = event.data.allParticipants || []
        
        // If no participants sent, fetch from API
        if (freshParticipants.length === 0) {
          try {
            const data = await getEligibleParticipants()
            freshParticipants = data.eligible
          } catch (error) {
            console.error('Failed to load participants:', error)
          }
        }
        
        console.log('Fresh participants for rolling:', freshParticipants)
        
        // Start rolling animation
        setRollingNames(freshParticipants)
        setIsRolling(true)
        setShowPopup(true)
        
        // Stop rolling after 3 seconds and show winners
        setTimeout(() => {
          setIsRolling(false)
          setCurrentWinners(event.data.winners)
          setDisplayMessage(event.data.prizeName || 'ผู้โชคดี')
          setShowConfetti(true)
          
          // Hide confetti after 5 seconds
          setTimeout(() => setShowConfetti(false), 5000)
        }, 3000)
      }
    }

    drawChannel.addEventListener('message', handleMessage)
    
    return () => {
      drawChannel.removeEventListener('message', handleMessage)
      drawChannel.close()
    }
  }, [])

  // Full-screen display mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && <Confetti />}
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
        
        {/* Lightning bolts */}
        {currentWinners.length > 0 && (
          <>
            <Zap className="absolute top-10 left-10 text-yellow-400 animate-pulse" size={60} />
            <Zap className="absolute top-20 right-20 text-yellow-400 animate-pulse" size={50} style={{ animationDelay: '0.5s' }} />
            <Zap className="absolute bottom-20 left-1/4 text-yellow-400 animate-pulse" size={55} style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>
      
      {/* Sparkle Effects */}
      {currentWinners.length > 0 && <SparkleEffect count={30} />}

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Trophy className="text-yellow-400 animate-bounce" size={80} />
            <h1 className="text-7xl font-bold text-white drop-shadow-2xl">Lucky Draw</h1>
            <Sparkles className="text-yellow-400 animate-pulse" size={80} />
          </div>
          <p className="text-3xl text-blue-200 font-light">ລະບົບຈັບລາງວັນ</p>
        </div>

        {/* Waiting State */}
        <div className="text-center py-10">
          <div className="mb-8 relative">
            <Trophy className="text-yellow-400 mx-auto animate-spin-slow" size={120} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 animate-pulse">{displayMessage}</h2>
          <p className="text-2xl text-blue-200">ກະລຸນາເປີດໜ້າຈັບລາງວັນເພື່ອດໍາເນີນການຕໍ່</p>
          <p className="text-xl text-blue-300 mt-4">ກົດ <kbd className="px-3 py-1 bg-white/20 rounded-lg">F</kbd> ເພື່ອເຂົ້າສູ່ໂໝດເຕັມຈໍ</p>
        </div>

        {/* Participants List - Always Visible */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Title */}
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="bg-gradient-to-r from-yellow-400 to-pink-400 text-transparent bg-clip-text mb-4">
                <h2 className="text-5xl md:text-6xl font-bold drop-shadow-lg">
                  ຈໍານວນທັງໝົດ
                </h2>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-7xl md:text-8xl px-16 py-6 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform animate-pulse-slow">
                {participants.length}
              </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-900/20">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in transform hover:scale-105 hover:-translate-y-1 border border-blue-300/30 hover:border-yellow-400/50"
                  style={{ animationDelay: `${(index % 20) * 0.03}s` }}
                >
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold px-4 py-1 rounded-full inline-block mb-3">
                      #{index + 1}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white break-words leading-relaxed">
                      {participant.employee_id} ผ่าน {participant.employee_name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-lg">
            ກົດ <kbd className="px-2 py-1 bg-white/20 rounded">F</kbd> ເພື່ອເຂົ້າ/ອອກຈາກໂໝດເຕັມຈໍ
          </p>
        </div>
      </div>

      {/* Participants List Modal - Keep for button click */}
      {showParticipantsList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowParticipantsList(false)}
          ></div>
          
          {/* Popup Content */}
          <div className="relative z-10 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowParticipantsList(false)}
              className="absolute top-4 right-4 bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 rounded-full p-3 transition-all z-10 sticky shadow-lg transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 md:p-12">
              {/* Title */}
              <div className="text-center mb-8 flex flex-col items-center">
                <div className="bg-gradient-to-r from-yellow-400 to-pink-400 text-transparent bg-clip-text mb-4">
                  <h2 className="text-5xl md:text-6xl font-bold drop-shadow-lg">
                    ຈໍານວນທັງໝົດ
                  </h2>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-7xl md:text-8xl px-16 py-6 rounded-3xl shadow-2xl animate-pulse-slow">
                  {participants.length}
                </div>
              </div>

              {/* Participants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-900/20">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in transform hover:scale-105 hover:-translate-y-1 border border-blue-300/30 hover:border-yellow-400/50"
                    style={{ animationDelay: `${(index % 20) * 0.03}s` }}
                  >
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold px-4 py-1 rounded-full inline-block mb-3">
                        #{index + 1}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white break-words leading-relaxed">
                        {participant.employee_id} ผ่าน {participant.employee_name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Button at Bottom */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowParticipantsList(false)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold px-10 py-5 rounded-full text-2xl shadow-2xl transition-all transform hover:scale-110"
                >
                  ປິດ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winners Popup Modal */}
      {showPopup && (isRolling || currentWinners.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          ></div>
          
          {/* Popup Content */}
          <div className="relative z-10 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-10"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Sparkle Effects in Popup */}
            <SparkleEffect count={20} />

            <div className="p-8 md:p-12">
              {/* Title */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Trophy className="text-yellow-300 animate-bounce" size={60} />
                  <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg animate-pulse-slow">
                    {displayMessage}
                  </h2>
                  <Sparkles className="text-yellow-300 animate-bounce" size={60} />
                </div>
                <p className="text-2xl md:text-3xl text-yellow-200 font-semibold">
                  {isRolling ? 'ກໍາລັງສຸ່ມຜູ້ໂຊກດີ...' : 'ຂໍສະແດງຄວາມຍິນດີກັບຜູ້ໂຊກດີ!'}
                </p>
              </div>

              {/* Rolling Animation */}
              {isRolling ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-400 shadow-2xl animate-rolling relative overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine-fast"></div>
                      
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-spin">
                          <Trophy className="text-yellow-900" size={40} />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-blur">
                          {rollingNames.length > 0 
                            ? (() => {
                                const randomParticipant = rollingNames[Math.floor(Math.random() * rollingNames.length)];
                                return `${randomParticipant?.employee_id || '???'} ${randomParticipant?.employee_name || '???'}`;
                              })()
                            : '???'}
                        </h3>
                        <div className="space-y-2 text-blue-100 opacity-50">
                          <p className="text-lg md:text-xl">🎫 ລະຫັດ: ***</p>
                          <p className="text-base md:text-lg">🏢 ***</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Winners Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentWinners.map((winner, index) => (
                      <div
                        key={index}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-400 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in animate-glow relative overflow-hidden"
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine"></div>
                        
                        <div className="text-center relative z-10 flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce-slow">
                            <Trophy className="text-yellow-900" size={40} />
                          </div>
                          <div className="bg-yellow-400 text-yellow-900 font-bold text-lg px-3 py-1 rounded-full mb-3">
                            #{index + 1}
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-pulse-slow break-words w-full text-center">
                            {winner.employee_name}
                          </h3>
                          <div className="space-y-2 text-blue-100 w-full">
                            <p className="text-lg md:text-xl text-center">🎫 ລະຫັດ: {winner.employee_id}</p>
                            <p className="text-base md:text-lg break-words text-center">🏢 {winner.company}</p>
                          </div>
                          
                          {/* Sparkle decorations */}
                          <Sparkles className="absolute top-2 right-2 text-yellow-300 animate-spin-slow" size={24} />
                          <Sparkles className="absolute bottom-2 left-2 text-yellow-300 animate-spin-slow" size={20} style={{ animationDelay: '0.5s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Close Button at Bottom */}
              {!isRolling && (
                <div className="text-center mt-8 space-x-4">
                  <button
                    onClick={() => {
                      setShowPopup(false)
                    }}
                    className="bg-white hover:bg-yellow-100 text-purple-600 font-bold px-8 py-4 rounded-full text-xl shadow-lg transition-all transform hover:scale-105"
                  >
                    ປິດ
                  </button>
                  <button
                    onClick={handleClearAllWinners}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-full text-xl shadow-lg transition-all transform hover:scale-105"
                  >
                    ລຶບຂໍ້ມູນທັງໝົດ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.5); }
          50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.8), 0 0 60px rgba(250, 204, 21, 0.6); }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti linear infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        .animate-sparkle {
          animation: sparkle ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        @keyframes rolling {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(10px); }
        }
        
        .animate-rolling {
          animation: rolling 0.3s ease-in-out infinite;
        }
        
        @keyframes blur {
          0%, 100% { filter: blur(0px); opacity: 1; }
          50% { filter: blur(3px); opacity: 0.7; }
        }
        
        .animate-blur {
          animation: blur 0.5s ease-in-out infinite;
        }
        
        @keyframes shine-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shine-fast {
          animation: shine-fast 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
