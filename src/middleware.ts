import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if ((req.nextUrl.pathname.startsWith('/profile') || req.nextUrl.pathname.startsWith('/configure/upload')) && !user) {
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/configure/upload/:path*'],
};
