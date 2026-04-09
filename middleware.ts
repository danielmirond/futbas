import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Refresh Supabase session
  const sessionResponse = await updateSession(request)

  // Run intl middleware
  const intlResponse = intlMiddleware(request)

  // Merge cookies from session refresh into intl response
  if (sessionResponse) {
    sessionResponse.cookies.getAll().forEach(cookie => {
      intlResponse.cookies.set(cookie)
    })
  }

  return intlResponse
}

export const config = {
  matcher: ['/', '/(ca|es)/:path*'],
}
