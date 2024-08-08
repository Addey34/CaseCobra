import { NextApiRequest, NextApiResponse } from 'next';

// Récupérer l'URL de redirection depuis les variables d'environnement
const LOGOUT_REDIRECT_URL = process.env.KINDE_POST_LOGOUT_REDIRECT_URL || '/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Redirigez l'utilisateur vers l'URL de déconnexion de KindeAuth
    // puis vers l'URL de redirection après la déconnexion
    const redirectUrl = new URL(process.env.KINDE_AUTH_LOGOUT_URL || '', 'https://caseart.kinde.com');
    redirectUrl.searchParams.append('post_logout_redirect_uri', LOGOUT_REDIRECT_URL);

    res.redirect(redirectUrl.toString());
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
