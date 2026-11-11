import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/admin';
export default async function middleware(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/admin') && !(await getUserContext())) return NextResponse.redirect(new URL('/sign-in', request.url));
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
