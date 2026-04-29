import { NextResponse } from 'next/server'

export type Corrections = {
  aliases: Record<string, string>
  display: Record<string, string>
}

declare global {
  // eslint-disable-next-line no-var
  var __corrections: Corrections | undefined
}

function getStore(): Corrections {
  if (!global.__corrections) {
    global.__corrections = { aliases: {}, display: {} }
  }
  return global.__corrections
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin-md-2026'

function checkAuth(req: Request): boolean {
  return (req.headers.get('x-admin-password') ?? '') === ADMIN_PASSWORD
}

export async function GET(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getStore())
}

export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as Partial<Corrections>
  const store = getStore()
  if (body.aliases) Object.assign(store.aliases, body.aliases)
  if (body.display)  Object.assign(store.display,  body.display)
  return NextResponse.json({ ok: true, store })
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type, key } = await req.json() as { type: 'aliases' | 'display'; key: string }
  const store = getStore()
  if (type === 'aliases') delete store.aliases[key]
  if (type === 'display')  delete store.display[key]
  return NextResponse.json({ ok: true, store })
}
