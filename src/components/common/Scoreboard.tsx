export default function Scoreboard({
  score,
  maxScore,
}: {
  score: number
  maxScore: number
}) {
  return (
    <div className="bg-bg-secondary px-4 py-2 rounded-lg font-mono">
      <span className="text-text-muted mr-2">Score:</span>
      <span className="text-emerald-400 font-bold">{score}</span>
      <span className="text-text-subtle"> / {maxScore}</span>
    </div>
  )
}
