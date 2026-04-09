interface MvpVote {
  playerName: string
  team: string
  votes: number
}

interface MvpResultsProps {
  votes: MvpVote[]
}

export function MvpResults({ votes }: MvpResultsProps) {
  const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0)
  const maxVotes = Math.max(...votes.map((v) => v.votes))
  const sorted = [...votes].sort((a, b) => b.votes - a.votes)

  return (
    <div>
      <h3 className="font-serif text-headline mb-4">Resultats MVP</h3>

      <div className="flex flex-col gap-2.5">
        {sorted.map((vote, i) => {
          const pct = totalVotes > 0 ? (vote.votes / totalVotes) * 100 : 0
          const isTop = vote.votes === maxVotes

          return (
            <div key={vote.playerName} className="flex items-center gap-3">
              <span className={`w-6 text-sm tabular-nums text-right ${isTop ? 'text-accent font-bold' : 'text-muted'}`}>
                {i + 1}
              </span>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-sans ${isTop ? 'font-medium text-ink' : 'text-ink/70'}`}>
                    {vote.playerName}
                    <span className="text-xs text-muted ml-2">{vote.team}</span>
                  </span>
                  <span className="text-xs font-mono tabular-nums text-muted">
                    {vote.votes}
                  </span>
                </div>
                <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isTop ? 'bg-accent' : 'bg-ink/15'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
