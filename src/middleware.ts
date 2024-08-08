import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Récupération de la session de l'utilisateur
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Clonage de l'URL pour les redirections
  const url = req.nextUrl.clone();

  // Liste des routes protégées
  const protectedRoutes = ['/profile', '/configure/upload'];

  // Vérifiez si la route est protégée et si l'utilisateur n'est pas authentifié
  if (protectedRoutes.includes(req.nextUrl.pathname) && !user) {
    // Redirection vers la page de connexion
    url.pathname = '/api/auth/login';
    return NextResponse.redirect(url);
  }

  // Passe à la route suivante si l'utilisateur est authentifié ou si la route n'est pas protégée
  return NextResponse.next();
}

// Configuration des routes pour le middleware
export const config = {
  matcher: ['/profile/:path*', '/configure/upload/:path*'],
};
