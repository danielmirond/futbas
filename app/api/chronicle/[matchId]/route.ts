import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  try {
    // TODO: Fetch chronicle from Supabase by matchId
    return NextResponse.json({
      matchId,
      status: 'not_implemented_yet',
      message: 'Chronicle fetch endpoint ready',
    })
  } catch (error) {
    console.error(`[api/chronicle/${matchId}] GET Error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch chronicle' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  try {
    const updates = await request.json()

    // TODO: Update chronicle in Supabase
    return NextResponse.json({
      matchId,
      updates,
      status: 'not_implemented_yet',
      message: 'Chronicle update endpoint ready',
    })
  } catch (error) {
    console.error(`[api/chronicle/${matchId}] PATCH Error:`, error)
    return NextResponse.json(
      { error: 'Failed to update chronicle' },
      { status: 500 }
    )
  }
}
