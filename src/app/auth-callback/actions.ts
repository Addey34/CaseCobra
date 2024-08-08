'use server';

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export const getAuthStatus = async () => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user.email) {
      throw new Error('Données utilisateur invalides');
    }

    return { success: true };
  } catch (error) {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Erreur dans getAuthStatus:', errorMessage);

    return { success: false, message: errorMessage };
  }
};
