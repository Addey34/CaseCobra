import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      console.log('User not found or user ID is missing');
      return new NextResponse('User not found', { status: 404 });
    }

    console.log('Fetching orders for user ID:', user.id);

    const orders = await db.order.findMany({
      where: { userId: user.id },
    });

    console.log('Orders retrieved:', orders);

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
