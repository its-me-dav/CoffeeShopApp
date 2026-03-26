interface ScoreHUDProps {
  displayScore: number
  weeklyTop: number
}

export default function ScoreHUD({ displayScore, weeklyTop }: ScoreHUDProps) {
  return (
    <>
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
        <div className="bg-[#1A1A1A] text-white text-[15px] font-bold px-6 py-2.5 rounded-full whitespace-nowrap">
          SCORE: {displayScore.toLocaleString()}
        </div>
      </div>

      {weeklyTop > 0 && (
        <div className="fixed top-[3.1rem] right-4 z-[60] pointer-events-none">
          {displayScore >= weeklyTop ? (
            <div className="bg-[#2ECC71] rounded-full px-2.5 py-1.5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-white">🏆 Record!</span>
            </div>
          ) : (
            <div className="bg-[#F4A261]/90 rounded-full px-2.5 py-1.5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-white">
                🏆 {(weeklyTop - displayScore).toLocaleString()} to beat
              </span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
