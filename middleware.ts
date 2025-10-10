import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from "jose"

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET)

export async  function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname

  //only in admin
  if (!p.startsWith('/admin')) return NextResponse.next()

  // allow login page under /admin 
  if (p === '/admin/login' || p.startsWith('/admin/login/')) {
    return NextResponse.next()
  }

  const token = req.cookies.get("admin_token")?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("from", p)
    return NextResponse.redirect(url)
  }

  try {
    await jwtVerify(token, key(), { algorithms: ["HS256"] })
    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("from", p)
    return NextResponse.redirect(url)
  }
}


export const config = {
  matcher: ['/admin/:path*'],
}