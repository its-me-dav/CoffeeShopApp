import { useGameEngine } from './useGameEngine'
import IdleScreen from './IdleScreen'
import GameOverScreen from './GameOverScreen'
import ScoreHUD from './ScoreHUD'

export default function Game() {
  const {
    canvasRef,
    previewBgCanvasRef,
    gameoverBgCanvasRef,
    phase,
    displayScore,
    finalScore,
    personalBest,
    isNewPB,
    weeklyRank,
    competitors,
    startGame,
    playAgain,
    lives,
    maxLives,
    canPlay,
    countdown,
  } = useGameEngine()

  return (
    <div className="relative w-full" style={{ height: '100svh' }}>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50"
        style={{
          display: phase === 'playing' ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {phase === 'playing' && (
        <ScoreHUD displayScore={displayScore} competitors={competitors} />
      )}

      {phase === 'idle' && (
        <IdleScreen
          personalBest={personalBest}
          lives={lives}
          maxLives={maxLives}
          canPlay={canPlay}
          countdown={countdown}
          onStart={startGame}
          previewBgCanvasRef={previewBgCanvasRef}
        />
      )}

      {phase === 'gameover' && (
        <GameOverScreen
          finalScore={finalScore}
          personalBest={personalBest}
          isNewPB={isNewPB}
          weeklyRank={weeklyRank}
          lives={lives}
          maxLives={maxLives}
          canPlay={canPlay}
          countdown={countdown}
          onPlayAgain={playAgain}
          gameoverBgCanvasRef={gameoverBgCanvasRef}
        />
      )}
    </div>
  )
}
