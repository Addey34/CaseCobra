import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const url = req.nextUrl.clone();

  // Vérifiez si l'utilisateur est authentifié
  if (!user) {
    // Rediriger vers la page de connexion si non authentifié
    url.pathname = '/api/auth/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Appliquez ce middleware uniquement aux routes protégées
export const config = {
  matcher: ['/profile/:path*', '/configure/upload/:path*'], // Appliquer ce middleware aux routes protégées
};
