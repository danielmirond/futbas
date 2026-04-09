import { ClubHeader } from '@/components/club/club-header'
import { KitSvg } from '@/components/club/kit-svg'

export default function ClubDetailPage({
  params: { clubId },
}: {
  params: { clubId: string }
}) {
  return (
    <div className="space-y-8">
      <ClubHeader clubId={clubId} />
    </div>
  )
}
