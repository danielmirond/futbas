import { ChronicleView } from '@/components/chronicle/chronicle-view'

export default function CronicaPage({
  params: { matchId },
}: {
  params: { matchId: string }
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <ChronicleView matchId={matchId} />
    </div>
  )
}
