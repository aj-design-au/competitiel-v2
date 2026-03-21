import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes (require auth)
  const protectedPaths = ['/dashboard', '/products', '/competitors', '/insights', '/settings', '/alerts', '/onboarding']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isOnboardingPath = pathname === '/onboarding'

  // Auth routes (redirect logged-in users away)
  const authPaths = ['/login', '/signup', '/forgot-password']
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // Unauthenticated user on protected route → login
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user on auth route → check onboarding then redirect
  if (user && isAuthPath) {
    const businessRole = user.user_metadata?.business_role
    const url = request.nextUrl.clone()
    url.pathname = businessRole ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  // Authenticated user on home → check onboarding then redirect
  if (user && pathname === '/') {
    const businessRole = user.user_metadata?.business_role
    const url = request.nextUrl.clone()
    url.pathname = businessRole ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  // Authenticated user on protected route (not onboarding) → check if onboarding needed
  if (user && isProtectedPath && !isOnboardingPath) {
    const businessRole = user.user_metadata?.business_role
    if (!businessRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Authenticated user on onboarding → if already onboarded, redirect to dashboard
  if (user && isOnboardingPath) {
    const businessRole = user.user_metadata?.business_role
    if (businessRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
