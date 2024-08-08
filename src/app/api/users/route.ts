import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

type KindeUser = {
  id: string;
  email: string;
  given_name?: string;  // Prénom
  family_name?: string; // Nom de famille
};

export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }

    const { id, email, given_name, family_name } = user;
    const userName = `${given_name || ''} ${family_name || ''}`.trim(); // Combine prénom et nom de famille

    if (!email) {
      return new NextResponse('Email manquant', { status: 400 });
    }

    const userData = await db.user.upsert({
      where: { email },
      update: {
        googleUser: {
          update: {
            googleName: userName,
          },
        },
      },
      create: {
        id,
        email,
        googleUser: {
          create: {
            googleId: id,
            googleName: userName,
          },
        },
      },
    });

    return NextResponse.json({
      email: userData.email,
      name: userName,  // Utilisez le nom complet
      createdAt: userData.createdAt,
    });
  } catch (error) {
    console.error('Échec de la récupération des données de l\'utilisateur :', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
