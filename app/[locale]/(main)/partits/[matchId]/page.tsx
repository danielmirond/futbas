import { MatchHeader } from '@/components/match/match-header'
import { MatchEventsTimeline } from '@/components/match/match-events-timeline'
import { CommentFeed } from '@/components/comments/comment-feed'
import { MvpVoting } from '@/components/mvp/mvp-voting'

export default function MatchDetailPage({
  params: { matchId },
}: {
  params: { matchId: string }
}) {
  return (
    <div className="space-y-8">
      <MatchHeader matchId={matchId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MatchEventsTimeline matchId={matchId} />
          <CommentFeed matchId={matchId} />
        </div>

        <div className="space-y-6">
          <MvpVoting matchId={matchId} />
        </div>
      </div>
    </div>
  )
}
