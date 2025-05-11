export default function Scoreboard({
  score,
  maxScore,
}: {
  score: number
  maxScore: number
}) {
  return (
    <div className="bg-zinc-800 px-4 py-2 rounded-lg font-mono">
      <span className="text-zinc-400 mr-2">Score:</span>
      <span className="text-emerald-400 font-bold">{score}</span>
      <span className="text-zinc-600"> / {maxScore}</span>
    </div>
  )
}
